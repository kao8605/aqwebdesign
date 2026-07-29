const API_BASE = import.meta.env.VITE_PATRIA_API_BASE || (window.location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
const STATIC_BASE = import.meta.env.VITE_PATRIA_STATIC_BASE || 'http://127.0.0.1:8080';
let latestAdminOrders = [];
let latestInventoryProducts = [];
let inventoryPage = 1;
const INVENTORY_PAGE_SIZE = 10;

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

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function formatOrderDate(value) {
  return value ? new Date(value).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Just now';
}

function inventoryQuantity(product, index) {
  return Number.isFinite(Number(product.quantity)) ? Number(product.quantity) : (index < 3 ? 80 + index * 15 : 40 + index * 6);
}

async function markOrderCompleted(orderId) {
  const data = await api('/api/admin/orders/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, status: 'completed' })
  });
  latestAdminOrders = latestAdminOrders.map(order => order.id === orderId ? data.order : order);
  renderRecentOrders(latestAdminOrders);
  renderOrderDetailCard(data.order);
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

function renderLowStockProducts(products) {
  const list = document.querySelector('[data-admin-list="low-stock-products"]');
  if (!list) return;
  list.innerHTML = products.slice(-5).map((product, index) => {
    const stock = String(3 + index * 2).padStart(2, '0');
    return '<li class="list-group-item d-flex align-items-center gap-3">'
      + '<img src="' + productImage(product.img) + '" class="rounded object-fit-cover" width="48" height="48" alt="' + product.title + '">'
      + '<div class="flex-grow-1">'
      + '<p class="mb-1">' + product.title + '</p>'
      + '<small>ID: #' + product.id.toUpperCase().slice(0, 8) + '</small>'
      + '</div>'
      + '<div class="d-flex flex-column gap-0 align-items-center">'
      + '<span class="fw-semibold text-primary">' + stock + '</span>'
      + '<small class="text-muted">In Stock</small>'
      + '</div>'
      + '</li>';
  }).join('');
}

function renderOrderDetailCard(order) {
  const existing = document.querySelector('[data-admin-order-modal]');
  if (existing) existing.remove();

  const customer = order.customer || {};
  const items = order.items || [];
  const qty = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const isCompleted = String(order.status || '').toLowerCase() === 'completed';
  const itemRows = items.map(item => {
    const lineTotal = Number(item.priceValue || 0) * Number(item.qty || 0);
    return '<div class="admin-order-item">'
      + '<img src="' + productImage(item.img) + '" alt="' + escapeHtml(item.title || 'Item') + '">'
      + '<div><strong>' + escapeHtml(item.title || 'Untitled item') + '</strong><span>' + escapeHtml(item.cat || 'Menu') + ' • ' + escapeHtml(item.price || money(item.priceValue)) + ' x ' + Number(item.qty || 0) + '</span></div>'
      + '<b>' + money(lineTotal) + '</b>'
      + '</div>';
  }).join('');

  const modal = document.createElement('div');
  modal.className = 'admin-order-modal';
  modal.setAttribute('data-admin-order-modal', '');
  modal.innerHTML = '<div class="admin-order-card">'
    + '<button type="button" class="admin-order-close" aria-label="Close order detail">&times;</button>'
    + '<div class="admin-order-head"><span>Order Detail</span><strong>#' + escapeHtml(order.id) + '</strong></div>'
    + '<div class="admin-order-meta">'
    + '<div><small>Customer</small><strong>' + escapeHtml(customer.name || 'Guest customer') + '</strong><span>' + escapeHtml(customer.email || '') + '</span></div>'
    + '<div><small>Status</small><strong>' + escapeHtml(order.status || 'created') + '</strong><span>' + formatOrderDate(order.createdAt) + '</span></div>'
    + '<div><small>Items</small><strong>' + qty + '</strong><span>Total quantity</span></div>'
    + '</div>'
    + '<div class="admin-order-items">' + itemRows + '</div>'
    + '<div class="admin-order-total"><span>Total</span><strong>' + money(order.total) + '</strong></div>'
    + '<button type="button" class="btn btn-primary w-100 admin-order-complete" data-order-complete="' + escapeHtml(order.id) + '"' + (isCompleted ? ' disabled' : '') + '>'
    + (isCompleted ? '已完成' : '標記為已完成')
    + '</button>'
    + '</div>';

  modal.addEventListener('click', event => {
    if (event.target === modal || event.target.closest('.admin-order-close')) modal.remove();
  });
  const completeButton = modal.querySelector('[data-order-complete]');
  if (completeButton) {
    completeButton.addEventListener('click', async () => {
      completeButton.disabled = true;
      completeButton.textContent = '更新中...';
      try {
        await markOrderCompleted(order.id);
      } catch (error) {
        console.error(error);
        completeButton.disabled = false;
        completeButton.textContent = '標記為已完成';
      }
    });
  }
  document.body.appendChild(modal);
}

function renderRecentOrders(orders) {
  const list = document.querySelector('[data-admin-list="recent-orders"]');
  if (!list) return;
  const rows = orders.slice(-5).reverse();
  if (!rows.length) {
    list.innerHTML = '<li class="list-group-item text-secondary">No orders yet.</li>';
    return;
  }
  list.innerHTML = rows.map((order, index) => {
    const first = order.items && order.items[0] ? order.items[0] : {};
    const qty = (order.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const customer = order.customer && order.customer.name ? order.customer.name : 'Guest customer';
    const date = formatOrderDate(order.createdAt);
    return '<li class="list-group-item d-flex align-items-center gap-3 admin-order-row" role="button" tabindex="0" data-order-index="' + index + '">'
      + '<img src="' + productImage(first.img) + '" class="rounded object-fit-cover" width="48" height="48" alt="' + escapeHtml(first.title || 'Order') + '">'
      + '<div class="flex-grow-1">'
      + '<p class="mb-1">Order #' + escapeHtml(order.id) + '</p>'
      + '<div class="d-flex align-items-center gap-2 text-muted flex-wrap">'
      + '<small class="fw-semibold">' + escapeHtml(customer) + '</small><small>•</small><small>' + qty + ' items</small><small>•</small><small>' + money(order.total) + '</small><small>•</small><small>' + date + '</small>'
      + '</div></div>'
      + '<span class="badge bg-success-subtle text-success">' + escapeHtml(order.status || 'created') + '</span>'
      + '</li>';
  }).join('');

  list.querySelectorAll('[data-order-index]').forEach(row => {
    const open = () => renderOrderDetailCard(rows[Number(row.dataset.orderIndex)]);
    row.addEventListener('click', open);
    row.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });
}

function renderInventory(products) {
  const tbody = document.querySelector('[data-admin-table="inventory"]');
  if (!tbody) return;
  latestInventoryProducts = products;
  const pageCount = Math.max(1, Math.ceil(products.length / INVENTORY_PAGE_SIZE));
  inventoryPage = Math.min(Math.max(1, inventoryPage), pageCount);
  const start = (inventoryPage - 1) * INVENTORY_PAGE_SIZE;
  const pageProducts = products.slice(start, start + INVENTORY_PAGE_SIZE);
  tbody.innerHTML = pageProducts.map((product, pageIndex) => {
    const index = start + pageIndex;
    return '<tr class="align-middle">'
      + '<td><a href="#" class="d-inline-flex align-items-center text-reset text-decoration-none">'
      + '<img src="' + productImage(product.img) + '" alt="' + escapeHtml(product.title) + '" class="avatar avatar-md rounded object-fit-cover" />'
      + '<span class="ms-3">' + escapeHtml(product.title) + '</span></a></td>'
      + '<td>PRD' + String(index + 1).padStart(3, '0') + '</td>'
      + '<td>' + escapeHtml(product.cat || 'Menu') + '</td>'
      + '<td>Patria</td>'
      + '<td>' + escapeHtml(product.price) + '</td>'
      + '<td>dish</td>'
      + '<td>' + inventoryQuantity(product, index) + '</td>'
      + '<td><div class="d-inline-flex align-items-center gap-2">'
      + '<button type="button" class="btn btn-sm btn-light admin-product-edit" data-product-index="' + index + '" aria-label="Edit ' + escapeHtml(product.title) + '"><i class="ti ti-edit"></i></button>'
      + '<button type="button" class="btn btn-sm btn-light link-danger admin-product-delete" data-product-delete-index="' + index + '" aria-label="Delete ' + escapeHtml(product.title) + '"><i class="ti ti-trash"></i></button>'
      + '</div></td>'
      + '</tr>';
  }).join('');
  renderInventoryPagination(products.length, pageCount);

  tbody.querySelectorAll('[data-product-index]').forEach(button => {
    button.addEventListener('click', () => openProductEditor(latestInventoryProducts[Number(button.dataset.productIndex)], Number(button.dataset.productIndex)));
  });
  tbody.querySelectorAll('[data-product-delete-index]').forEach(button => {
    button.addEventListener('click', () => deleteInventoryProduct(latestInventoryProducts[Number(button.dataset.productDeleteIndex)]));
  });
}

function renderInventoryPagination(total, pageCount) {
  const tbody = document.querySelector('[data-admin-table="inventory"]');
  const table = tbody && tbody.closest('table');
  const footerLabel = table && table.querySelector('tfoot td:first-child');
  const pager = table && table.querySelector('tfoot .pagination');
  if (!pager) return;
  const start = total ? (inventoryPage - 1) * INVENTORY_PAGE_SIZE + 1 : 0;
  const end = Math.min(inventoryPage * INVENTORY_PAGE_SIZE, total);
  if (footerLabel) footerLabel.textContent = 'Showing ' + start + '-' + end + ' of ' + total;
  const pageLinks = Array.from({ length: pageCount }, (_, index) => {
    const page = index + 1;
    return '<li class="page-item' + (page === inventoryPage ? ' active' : '') + '">'
      + '<a class="page-link" href="#" data-inventory-page="' + page + '">' + page + '</a>'
      + '</li>';
  }).join('');
  pager.innerHTML = '<li class="page-item' + (inventoryPage <= 1 ? ' disabled' : '') + '">'
    + '<a class="page-link" href="#" data-inventory-page="prev" tabindex="-1">Previous</a>'
    + '</li>'
    + pageLinks
    + '<li class="page-item' + (inventoryPage >= pageCount ? ' disabled' : '') + '">'
    + '<a class="page-link" href="#" data-inventory-page="next">Next</a>'
    + '</li>';
  pager.querySelectorAll('[data-inventory-page]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      if (button.closest('.page-item').classList.contains('disabled')) return;
      if (button.dataset.inventoryPage === 'next') inventoryPage += 1;
      else if (button.dataset.inventoryPage === 'prev') inventoryPage -= 1;
      else inventoryPage = Number(button.dataset.inventoryPage);
      renderInventory(latestInventoryProducts);
    });
  });
}

async function deleteInventoryProduct(product) {
  if (!product) return;
  if (!window.confirm('Delete ' + product.title + ' from inventory?')) return;
  await api('/api/admin/products', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: product.id })
  });
  latestInventoryProducts = latestInventoryProducts.filter(item => item.id !== product.id);
  renderInventory(latestInventoryProducts);
}

function openProductEditor(product, index) {
  if (!product) return;
  const existing = document.querySelector('[data-admin-product-modal]');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.className = 'admin-product-modal';
  modal.setAttribute('data-admin-product-modal', '');
  modal.innerHTML = '<form class="admin-product-card">'
    + '<button type="button" class="admin-order-close" aria-label="Close product editor">&times;</button>'
    + '<div class="admin-order-head"><span>Edit Product</span><strong>' + escapeHtml(product.title) + '</strong></div>'
    + '<div class="admin-product-preview"><img src="' + productImage(product.img) + '" alt="' + escapeHtml(product.title) + '"><span>PRD' + String(index + 1).padStart(3, '0') + '</span></div>'
    + '<label>Product Name<input name="title" value="' + escapeHtml(product.title) + '" required></label>'
    + '<label>Category<input name="cat" value="' + escapeHtml(product.cat || 'Menu') + '" required></label>'
    + '<label>Price<input name="priceValue" type="number" min="0" step="0.01" value="' + Number(product.priceValue || 0).toFixed(2) + '" required></label>'
    + '<label>Quantity<input name="quantity" type="number" min="0" step="1" value="' + inventoryQuantity(product, index) + '" required></label>'
    + '<label class="wide">Image Path<input name="img" value="' + escapeHtml(product.img || '') + '"></label>'
    + '<label class="wide">Description<textarea name="desc" rows="3">' + escapeHtml(product.desc || '') + '</textarea></label>'
    + '<p class="admin-product-error" data-product-error></p>'
    + '<button type="submit" class="btn btn-primary w-100">Save Changes</button>'
    + '</form>';

  modal.addEventListener('click', event => {
    if (event.target === modal || event.target.closest('.admin-order-close')) modal.remove();
  });
  modal.querySelector('form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('[type="submit"]');
    const error = form.querySelector('[data-product-error]');
    const formData = new FormData(form);
    button.disabled = true;
    button.textContent = 'Saving...';
    if (error) error.textContent = '';
    try {
      const data = await api('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          title: formData.get('title'),
          cat: formData.get('cat'),
          priceValue: Number(formData.get('priceValue')),
          quantity: Number(formData.get('quantity')),
          img: formData.get('img'),
          desc: formData.get('desc')
        })
      });
      latestInventoryProducts = latestInventoryProducts.map(item => item.id === product.id ? data.product : item);
      renderInventory(latestInventoryProducts);
      modal.remove();
    } catch (saveError) {
      if (error) error.textContent = saveError.message;
      button.disabled = false;
      button.textContent = 'Save Changes';
    }
  });
  document.body.appendChild(modal);
}

export async function loadAdminDashboard() {
  if (!document.querySelector('[data-admin-page="dashboard"]')) return;
  try {
    const productsData = await api('/api/products');
    const products = productsData.products || [];
    let orders = [];
    try {
      const ordersData = await api('/api/admin/orders');
      orders = ordersData.orders || [];
      latestAdminOrders = orders;
    } catch (ordersError) {
      console.warn('Admin orders API is not available yet. Restart sarab/sarab/server.js to enable it.', ordersError);
    }
    const totalSales = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const itemCount = orders.reduce((sum, order) => sum + (order.items || []).reduce((s, item) => s + Number(item.qty || 0), 0), 0);
    setText('[data-admin-stat="sales"]', money(totalSales));
    setText('[data-admin-stat="products"]', String(products.length));
    setText('[data-admin-stat="orders"]', String(orders.length));
    setText('[data-admin-stat="items"]', String(itemCount));
    renderTopProducts(products);
    renderLowStockProducts(products);
    renderRecentOrders(orders);
    setText('[data-admin-status]', orders.length ? 'Connected to Patria backend.' : 'Products connected. Restart Patria backend to load orders.');
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
