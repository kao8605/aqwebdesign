const API_BASE = import.meta.env.VITE_PATRIA_API_BASE || '';
const STATIC_BASE = import.meta.env.VITE_PATRIA_STATIC_BASE || 'http://127.0.0.1:8080';

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = localStorage.getItem('patriaAuthToken');
  if (token) headers.Authorization = 'Bearer ' + token;
  const response = await fetch(API_BASE + path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'API request failed.');
  return data;
}

function money(value) {
  return '$' + Number(value || 0).toFixed(2);
}

function productImage(src) {
  if (!src) return './assets/images/product-1.png';
  if (/^https?:\/\//.test(src)) return src;
  return STATIC_BASE.replace(/\/$/, '') + '/' + String(src).replace(/^\.\//, '').replace(/^\//, '');
}

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

function renderTopProducts(products) {
  const list = document.querySelector('[data-admin-list="top-products"]');
  if (!list) return;
  list.innerHTML = products.slice(0, 5).map((product, index) => {
    return '<li class="list-group-item d-flex align-items-center gap-3">'
      + '<img src="' + productImage(product.img) + '" class="rounded object-fit-cover" width="48" height="48" alt="' + product.title + '">'
      + '<div class="flex-grow-1">'
      + '<p class="mb-1">' + product.title + '</p>'
      + '<div class="d-flex align-items-center gap-2 text-muted">'
      + '<small class="fw-semibold">' + product.price + '</small><small>•</small><small>' + (product.cat || 'Menu') + '</small>'
      + '</div></div>'
      + '<span class="badge bg-primary-subtle text-primary border border-primary">#' + (index + 1) + '</span>'
      + '</li>';
  }).join('');
}

function renderRecentOrders(orders) {
  const list = document.querySelector('[data-admin-list="recent-orders"]');
  if (!list) return;
  const rows = orders.slice(-5).reverse();
  if (!rows.length) {
    list.innerHTML = '<li class="list-group-item text-secondary">No orders yet.</li>';
    return;
  }
  list.innerHTML = rows.map(order => {
    const first = order.items && order.items[0] ? order.items[0] : {};
    const qty = (order.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0);
    return '<li class="list-group-item d-flex align-items-center gap-3">'
      + '<img src="' + productImage(first.img) + '" class="rounded object-fit-cover" width="48" height="48" alt="' + (first.title || 'Order') + '">'
      + '<div class="flex-grow-1">'
      + '<p class="mb-1">Order #' + order.id + '</p>'
      + '<div class="d-flex align-items-center gap-2 text-muted">'
      + '<small class="fw-semibold">' + qty + ' items</small><small>•</small><small>' + money(order.total) + '</small>'
      + '</div></div>'
      + '<span class="badge bg-success-subtle text-success">' + (order.status || 'created') + '</span>'
      + '</li>';
  }).join('');
}

function renderInventory(products) {
  const tbody = document.querySelector('[data-admin-table="inventory"]');
  if (!tbody) return;
  tbody.innerHTML = products.map((product, index) => {
    return '<tr class="align-middle">'
      + '<td><a href="#" class="d-inline-flex align-items-center text-reset text-decoration-none">'
      + '<img src="' + productImage(product.img) + '" alt="' + product.title + '" class="avatar avatar-md rounded object-fit-cover" />'
      + '<span class="ms-3">' + product.title + '</span></a></td>'
      + '<td>PRD' + String(index + 1).padStart(3, '0') + '</td>'
      + '<td>' + (product.cat || 'Menu') + '</td>'
      + '<td>Patria</td>'
      + '<td>' + product.price + '</td>'
      + '<td>dish</td>'
      + '<td>' + (index < 3 ? 80 + index * 15 : 40 + index * 6) + '</td>'
      + '<td><a href="#"><i class="ti ti-edit"></i></a><a href="#" class="link-danger"><i class="ti ti-trash ms-2"></i></a></td>'
      + '</tr>';
  }).join('');
}

export async function loadAdminDashboard() {
  if (!document.querySelector('[data-admin-page="dashboard"]')) return;
  try {
    const result = await Promise.all([api('/api/products'), api('/api/admin/orders')]);
    const products = result[0].products || [];
    const orders = result[1].orders || [];
    const totalSales = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const itemCount = orders.reduce((sum, order) => sum + (order.items || []).reduce((s, item) => s + Number(item.qty || 0), 0), 0);
    setText('[data-admin-stat="sales"]', money(totalSales));
    setText('[data-admin-stat="products"]', String(products.length));
    setText('[data-admin-stat="orders"]', String(orders.length));
    setText('[data-admin-stat="items"]', String(itemCount));
    renderTopProducts(products);
    renderRecentOrders(orders);
  } catch (error) {
    console.error(error);
    setText('[data-admin-status]', 'Cannot connect to Patria backend.');
  }
}

export async function loadInventory() {
  if (!document.querySelector('[data-admin-table="inventory"]')) return;
  try {
    const data = await api('/api/products');
    renderInventory(data.products || []);
  } catch (error) {
    console.error(error);
    const tbody = document.querySelector('[data-admin-table="inventory"]');
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-secondary">Cannot connect to Patria backend.</td></tr>';
  }
}
