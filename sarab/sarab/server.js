const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const ADMIN_ROOT = path.resolve(ROOT, "../../inapp/dist");
const DATA_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const PORT = Number(process.env.PORT || 8080);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_PATH)) writeDb({ users: [], sessions: {}, guestCarts: {}, userCarts: {}, orders: [], productOverrides: {}, deletedProducts: [] });

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Guest-Id'
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch (err) { reject(err); }
    });
    req.on('error', reject);
  });
}

function token() {
  return crypto.randomBytes(32).toString('hex');
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, user) {
  const check = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(check.hash, 'hex'), Buffer.from(user.passwordHash, 'hex'));
}

function getAuth(req, db) {
  const header = req.headers.authorization || '';
  const sessionToken = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = sessionToken && db.sessions[sessionToken];
  if (!session) return null;
  const user = db.users.find(u => u.id === session.userId);
  return user ? { user, sessionToken } : null;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || null
  };
}

function productsFromHtml() {
  const htmlPath = path.join(ROOT, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const products = [];
  const re = /<div class="mcard"([^>]+)>/g;
  let match;
  while ((match = re.exec(html))) {
    const attrs = match[1];
    const get = name => {
      const found = attrs.match(new RegExp('data-' + name + '="([^"]*)"'));
      return found ? found[1] : '';
    };
    const title = get('title');
    const price = get('price');
    if (!title || !price || products.some(p => p.title === title)) continue;
    products.push({
      id: slug(title),
      title,
      cat: get('cat'),
      price,
      priceValue: Number(String(price).replace(/[^0-9.]/g, '')) || 0,
      img: get('img'),
      desc: get('desc')
    });
  }
  return products;
}

function productsWithOverrides(db) {
  const overrides = db.productOverrides || {};
  const deleted = new Set(db.deletedProducts || []);
  return productsFromHtml().filter(product => !deleted.has(product.id)).map(product => {
    const edited = overrides[product.id] || {};
    const merged = { ...product, ...edited, id: product.id };
    merged.priceValue = Number(merged.priceValue || String(merged.price || '').replace(/[^0-9.]/g, '')) || 0;
    merged.price = merged.price || ('$' + merged.priceValue.toFixed(2));
    return merged;
  });
}

function slug(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getCart(db, auth, guestId) {
  if (auth) {
    db.userCarts[auth.user.id] ||= [];
    return db.userCarts[auth.user.id];
  }
  const key = guestId || 'guest';
  db.guestCarts[key] ||= [];
  return db.guestCarts[key];
}

function cartSummary(cart) {
  const total = cart.reduce((sum, item) => sum + item.priceValue * item.qty, 0);
  return { items: cart, total: Number(total.toFixed(2)) };
}

function mergeGuestCart(db, userId, guestId) {
  if (!guestId || !db.guestCarts[guestId]) return;
  db.userCarts[userId] ||= [];
  for (const item of db.guestCarts[guestId]) {
    const existing = db.userCarts[userId].find(x => x.id === item.id);
    if (existing) existing.qty += item.qty;
    else db.userCarts[userId].push(item);
  }
  delete db.guestCarts[guestId];
}

async function handleApi(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  const url = new URL(req.url, 'http://localhost');
  const db = readDb();
  const products = productsWithOverrides(db);
  const auth = getAuth(req, db);
  const guestId = req.headers['x-guest-id'];

  try {
    if (req.method === 'GET' && url.pathname === '/api/products') return send(res, 200, { products });

    if (req.method === 'PATCH' && url.pathname === '/api/admin/products') {
      const body = await readBody(req);
      const product = products.find(p => p.id === body.id);
      if (!product) return send(res, 404, { error: 'Product not found.' });
      const title = String(body.title || product.title).trim();
      const cat = String(body.cat || product.cat || 'Menu').trim();
      const img = String(body.img || product.img || '').trim();
      const desc = String(body.desc || product.desc || '').trim();
      const quantity = Math.max(0, Number(body.quantity ?? product.quantity ?? 0));
      const priceValue = Number(body.priceValue || String(body.price || product.price).replace(/[^0-9.]/g, ''));
      if (!title) return send(res, 400, { error: 'Product title is required.' });
      if (!Number.isFinite(priceValue) || priceValue < 0) return send(res, 400, { error: 'Product price is invalid.' });
      if (!Number.isFinite(quantity)) return send(res, 400, { error: 'Product quantity is invalid.' });

      db.productOverrides ||= {};
      db.productOverrides[product.id] = {
        title,
        cat,
        img,
        desc,
        quantity,
        priceValue: Number(priceValue.toFixed(2)),
        price: '$' + Number(priceValue).toFixed(2),
        updatedAt: new Date().toISOString()
      };
      writeDb(db);
      return send(res, 200, { product: { ...product, ...db.productOverrides[product.id], id: product.id } });
    }

    if (req.method === 'DELETE' && url.pathname === '/api/admin/products') {
      const body = await readBody(req);
      const product = products.find(p => p.id === body.id);
      if (!product) return send(res, 404, { error: 'Product not found.' });
      db.deletedProducts ||= [];
      if (!db.deletedProducts.includes(product.id)) db.deletedProducts.push(product.id);
      if (db.productOverrides) delete db.productOverrides[product.id];
      writeDb(db);
      return send(res, 200, { ok: true, id: product.id });
    }

    if (req.method === 'POST' && url.pathname === '/api/register') {
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const name = String(body.name || email.split('@')[0] || 'Customer').trim();
      const phone = String(body.phone || '').trim();
      if (!email || !password) return send(res, 400, { error: 'Email and password are required.' });
      if (db.users.some(u => u.email === email)) return send(res, 409, { error: 'Email already registered.' });
      const pw = hashPassword(password);
      const user = { id: token(), name, email, phone, salt: pw.salt, passwordHash: pw.hash, address: null, createdAt: new Date().toISOString() };
      db.users.push(user);
      const sessionToken = token();
      db.sessions[sessionToken] = { userId: user.id, createdAt: new Date().toISOString() };
      mergeGuestCart(db, user.id, body.guestId || guestId);
      writeDb(db);
      return send(res, 201, { token: sessionToken, user: publicUser(user), cart: cartSummary(db.userCarts[user.id] || []) });
    }

    if (req.method === 'POST' && url.pathname === '/api/login') {
      const body = await readBody(req);
      const login = String(body.login || body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const user = db.users.find(u => u.email === login || u.name.toLowerCase() === login);
      if (!user || !verifyPassword(password, user)) return send(res, 401, { error: 'Invalid login or password.' });
      const sessionToken = token();
      db.sessions[sessionToken] = { userId: user.id, createdAt: new Date().toISOString() };
      mergeGuestCart(db, user.id, body.guestId || guestId);
      writeDb(db);
      return send(res, 200, { token: sessionToken, user: publicUser(user), cart: cartSummary(db.userCarts[user.id] || []) });
    }

    if (req.method === 'POST' && url.pathname === '/api/logout') {
      if (auth) delete db.sessions[auth.sessionToken];
      writeDb(db);
      return send(res, 200, { ok: true });
    }

    if (req.method === 'GET' && url.pathname === '/api/me') {
      if (!auth) return send(res, 401, { error: 'Not logged in.' });
      const orders = db.orders.filter(o => o.userId === auth.user.id);
      return send(res, 200, { user: publicUser(auth.user), orderCount: orders.length, address: auth.user.address || null });
    }

    if (req.method === 'PUT' && url.pathname === '/api/me') {
      if (!auth) return send(res, 401, { error: 'Not logged in.' });
      const body = await readBody(req);
      const email = String(body.email || auth.user.email).trim().toLowerCase();
      if (!email) return send(res, 400, { error: 'Email is required.' });
      if (db.users.some(u => u.id !== auth.user.id && u.email === email)) return send(res, 409, { error: 'Email already registered.' });
      auth.user.name = String(body.name || auth.user.name).trim();
      auth.user.email = email;
      auth.user.phone = String(body.phone || '').trim();
      if (body.password) {
        const pw = hashPassword(String(body.password));
        auth.user.salt = pw.salt;
        auth.user.passwordHash = pw.hash;
      }
      writeDb(db);
      return send(res, 200, { user: publicUser(auth.user) });
    }

    if (req.method === 'GET' && url.pathname === '/api/cart') {
      return send(res, 200, cartSummary(getCart(db, auth, guestId)));
    }

    if (req.method === 'POST' && url.pathname === '/api/cart/add') {
      const body = await readBody(req);
      const product = products.find(p => p.id === body.productId || p.title === body.title);
      const qty = Math.max(1, Number(body.qty || 1));
      if (!product) return send(res, 404, { error: 'Product not found.' });
      const cart = getCart(db, auth, body.guestId || guestId);
      const existing = cart.find(item => item.id === product.id);
      if (existing) existing.qty += qty;
      else cart.push({ ...product, qty });
      writeDb(db);
      return send(res, 200, cartSummary(cart));
    }

    if (req.method === 'PATCH' && url.pathname === '/api/cart/item') {
      const body = await readBody(req);
      const cart = getCart(db, auth, body.guestId || guestId);
      const item = cart.find(x => x.id === body.productId);
      if (!item) return send(res, 404, { error: 'Cart item not found.' });
      item.qty = Math.max(0, Number(body.qty || 0));
      if (item.qty === 0) cart.splice(cart.indexOf(item), 1);
      writeDb(db);
      return send(res, 200, cartSummary(cart));
    }

    if (req.method === 'DELETE' && url.pathname === '/api/cart/item') {
      const body = await readBody(req);
      const cart = getCart(db, auth, body.guestId || guestId);
      const idx = cart.findIndex(x => x.id === body.productId);
      if (idx >= 0) cart.splice(idx, 1);
      writeDb(db);
      return send(res, 200, cartSummary(cart));
    }

    if (req.method === 'PUT' && url.pathname === '/api/address') {
      if (!auth) return send(res, 401, { error: 'Please log in first.' });
      const body = await readBody(req);
      auth.user.address = {
        fullName: String(body.fullName || '').trim(),
        phone: String(body.phone || '').trim(),
        address: String(body.address || '').trim(),
        city: String(body.city || '').trim(),
        zip: String(body.zip || '').trim()
      };
      writeDb(db);
      return send(res, 200, { user: publicUser(auth.user) });
    }

    if (req.method === 'DELETE' && url.pathname === '/api/address') {
      if (!auth) return send(res, 401, { error: 'Please log in first.' });
      auth.user.address = null;
      writeDb(db);
      return send(res, 200, { user: publicUser(auth.user) });
    }

    if (req.method === 'POST' && url.pathname === '/api/checkout') {
      if (!auth) return send(res, 401, { error: 'Please log in before checkout.' });
      const cart = db.userCarts[auth.user.id] || [];
      if (!cart.length) return send(res, 400, { error: 'Cart is empty.' });
      const total = cart.reduce((sum, item) => sum + item.priceValue * item.qty, 0);
      const order = { id: token().slice(0, 12), userId: auth.user.id, items: cart, total: Number(total.toFixed(2)), status: 'created', createdAt: new Date().toISOString() };
      db.orders.push(order);
      db.userCarts[auth.user.id] = [];
      writeDb(db);
      return send(res, 201, { order, cart: cartSummary([]) });
    }

    if (req.method === 'GET' && url.pathname === '/api/orders') {
      if (!auth) return send(res, 401, { error: 'Please log in first.' });
      return send(res, 200, { orders: db.orders.filter(o => o.userId === auth.user.id) });
    }

    if (req.method === 'GET' && url.pathname === '/api/admin/orders') {
      const adminOrders = db.orders.map(order => {
        const user = db.users.find(u => u.id === order.userId);
        return {
          ...order,
          customer: user ? { name: user.name, email: user.email, phone: user.phone || '' } : null
        };
      });
      return send(res, 200, { orders: adminOrders });
    }

    if (req.method === 'PATCH' && url.pathname === '/api/admin/orders/status') {
      const body = await readBody(req);
      const order = db.orders.find(o => o.id === body.orderId);
      if (!order) return send(res, 404, { error: 'Order not found.' });
      order.status = String(body.status || 'completed').trim() || 'completed';
      order.updatedAt = new Date().toISOString();
      writeDb(db);
      const user = db.users.find(u => u.id === order.userId);
      return send(res, 200, {
        order: {
          ...order,
          customer: user ? { name: user.name, email: user.email, phone: user.phone || '' } : null
        }
      });
    }

    return send(res, 404, { error: 'API not found.' });
  } catch (err) {
    return send(res, 500, { error: err.message || 'Server error.' });
  }
}

function serveFileFromRoot(baseRoot, filePath, res) {
  const resolved = path.normalize(path.join(baseRoot, filePath));
  if (!resolved.startsWith(baseRoot)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  fs.readFile(resolved, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(resolved).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}

function serveAdmin(req, res) {
  const url = new URL(req.url, 'http://localhost');
  let filePath = decodeURIComponent(url.pathname).replace(/^\/admin/, '');
  if (!filePath || filePath === '/') filePath = '/index.html';
  return serveFileFromRoot(ADMIN_ROOT, filePath, res);
}

function serveStatic(req, res) {
  const url = new URL(req.url, 'http://localhost');
  let filePath = decodeURIComponent(url.pathname);
  if (filePath === '/') filePath = '/index.html';
  return serveFileFromRoot(ROOT, filePath, res);
}

http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) return handleApi(req, res);
  if (req.url === '/admin' || req.url.startsWith('/admin/')) return serveAdmin(req, res);
  return serveStatic(req, res);
}).listen(PORT, () => {
  console.log('Patria backend running at http://127.0.0.1:' + PORT);
});
