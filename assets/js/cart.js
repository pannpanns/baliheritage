// assets/js/cart.js
// Versi ditingkatkan: localStorage menyimpan {id,qty}. Lookup produk dari PRODUCTS (fallback) atau dari API.

const API_PRODUCTS_ENDPOINT = './api/products.php';

function getCartStorageKey() { return 'bhw_cart_v1'; }

function getCart() {
  try { return JSON.parse(localStorage.getItem(getCartStorageKey()) || '[]'); }
  catch(e) { localStorage.removeItem(getCartStorageKey()); return []; }
}
function saveCart(cart) { localStorage.setItem(getCartStorageKey(), JSON.stringify(cart)); updateCartBadge(); }

let _productsCache = null;
async function loadProductsIfNeeded() {
  if (_productsCache) return _productsCache;
  if (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS) && PRODUCTS.length) {
    _productsCache = PRODUCTS.map(p => ({
      id: Number(p.id),
      name: p.name,
      price: Number(p.price || 0),
      img: p.img || (p.image || 'assets/img/placeholder.png'),
      short_description: p.short_description || ''
    }));
    return _productsCache;
  }
  try {
    const res = await fetch(API_PRODUCTS_ENDPOINT, {cache:'no-store'});
    if (!res.ok) throw new Error('Fetch products failed');
    const data = await res.json();
    _productsCache = (data||[]).map(p => ({
      id: Number(p.id),
      name: p.name || 'Produk',
      price: Number(p.price || 0),
      img: p.image || p.image_main || 'assets/img/placeholder.png',
      short_description: p.short_description || ''
    }));
    return _productsCache;
  } catch(err) {
    console.error('Error loading products:', err);
    _productsCache = [];
    return _productsCache;
  }
}

async function findProductById(id) {
  const products = await loadProductsIfNeeded();
  return products.find(p => Number(p.id) === Number(id)) || null;
}

async function addToCart(id, qty=1) {
  id = Number(id);
  if (!id) return;
  const prod = await findProductById(id);
  if (!prod) console.warn('Product not found while adding to cart:', id);
  let cart = getCart();
  const idx = cart.findIndex(i => Number(i.id) === id);
  if (idx > -1) cart[idx].qty = Number(cart[idx].qty) + Number(qty);
  else cart.push({ id: id, qty: Number(qty) });
  saveCart(cart);
  try { if (window.Toast && Toast.show) Toast.show('Produk ditambahkan ke keranjang'); } catch(e) {}
  updateCartBadge();
}

function removeFromCart(id) {
  id = Number(id);
  let cart = getCart();
  cart = cart.filter(i => Number(i.id) !== id);
  saveCart(cart);
  renderCartTable();
}

function updateQty(id, qty) {
  id = Number(id);
  qty = Number(qty);
  if (Number.isNaN(qty) || qty < 1) qty = 1;
  const cart = getCart();
  const idx = cart.findIndex(i => Number(i.id) === id);
  if (idx > -1) {
    cart[idx].qty = qty;
    saveCart(cart);
  }
  renderCartTable();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  const cart = getCart();
  const total = cart.reduce((s, i) => s + Number(i.qty || 0), 0);
  badge.innerText = total;
}

function formatRupiah(num) {
  const n = Math.round(Number(num) || 0);
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/[&<>"'`=\/]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'})[s]);
}

async function renderProductListFromApi(containerSelector = '#product-list') {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const products = await loadProductsIfNeeded();
  container.innerHTML = products.map(p => {
    const price = Number(p.price || 0);
    let orig = null, sale = price;
    // if API provides discount_price, handle both conventions:
    // - if discount_price > price => discount_price is original price (show struck original)
    // - if discount_price < price => discount_price is sale price (show struck original price)
    const dp = Number(p.discount_price || 0);
    if (dp) {
      if (dp > price) { orig = dp; sale = price; }
      else { orig = price; sale = dp; }
    }
    return `
      <div class="col-md-4 col-sm-6 product-item" data-name="${escapeHtml(p.name)}" data-category="${escapeHtml(p.category_slug || '')}">
        <div class="card h-100 card-product shadow-sm border-0">
          <img src="${escapeHtml(p.img)}" class="card-img-top" alt="${escapeHtml(p.name)}">
          <div class="card-body d-flex flex-column">
            <h6 class="fw-bold card-title">${escapeHtml(p.name)}</h6>
            <p class="text-muted small mb-2">${escapeHtml(p.short_description || '')}</p>
            <p class="mb-3">
              ${orig ? `<span class="text-decoration-line-through me-2">Rp ${formatRupiah(orig)}</span>` : ''}
              <span class="fw-bold text-brown">Rp ${formatRupiah(sale)}</span>
            </p>
            <div class="mt-auto d-grid">
              <button class="btn btn-primary" onclick="addToCart(${p.id})">Pesan</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function renderCartTable() {
  const tbody = document.querySelector('#cart-table tbody');
  if (!tbody) return;
  const cart = getCart();
  if (!cart.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Keranjang kosong</td></tr>';
    const totalEl = document.getElementById('cart-total'); if (totalEl) totalEl.innerText = 'Rp0';
    updateCartBadge();
    return;
  }
  await loadProductsIfNeeded();
  let total = 0;
  tbody.innerHTML = cart.map(item => {
    const prod = _productsCache.find(p => Number(p.id) === Number(item.id)) || {name:'Produk', price:0, img:'assets/img/placeholder.png'};
    const qty = Number(item.qty||0);
    const subtotal = Number(prod.price||0) * qty;
    total += subtotal;
    return `
      <tr>
        <td><img src="${escapeHtml(prod.img)}" width="60" class="me-2 rounded"> ${escapeHtml(prod.name)}</td>
        <td>Rp${formatRupiah(prod.price)}</td>
        <td><input type="number" min="1" value="${qty}" onchange="updateQty(${Number(item.id)}, this.value)" class="form-control" style="width:80px"></td>
        <td>Rp${formatRupiah(subtotal)}</td>
        <td><button class="btn btn-sm btn-danger" onclick="removeFromCart(${Number(item.id)})"><i class="bi bi-x-lg"></i></button></td>
      </tr>
    `;
  }).join('');
  const totalEl = document.getElementById('cart-total'); if (totalEl) totalEl.innerText = 'Rp' + formatRupiah(total);
  updateCartBadge();
}

async function renderCheckoutSummary() {
  const tbody = document.querySelector('#checkout-summary tbody');
  if (!tbody) return;
  const cart = getCart();
  if (!cart.length) {
    tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">Keranjang kosong</td></tr>';
    const el = document.getElementById('checkout-total'); if (el) el.innerText = 'Rp0';
    return;
  }
  await loadProductsIfNeeded();
  let total = 0;
  tbody.innerHTML = cart.map(item => {
    const prod = _productsCache.find(p => Number(p.id) === Number(item.id)) || {name:'Produk', price:0};
    const qty = Number(item.qty||0);
    const subtotal = Number(prod.price||0) * qty;
    total += subtotal;
    return `<tr><td>${escapeHtml(prod.name)} x${qty}</td><td>Rp${formatRupiah(subtotal)}</td></tr>`;
  }).join('');
  const el = document.getElementById('checkout-total'); if (el) el.innerText = 'Rp' + formatRupiah(total);
}

async function sendWhatsAppOrder() {
  const nameEl = document.getElementById('name'); const waEl = document.getElementById('whatsapp');
  const addressEl = document.getElementById('address'); const noteEl = document.getElementById('note');
  const name = nameEl ? nameEl.value.trim() : ''; const whatsapp = waEl ? waEl.value.trim() : '';
  const address = addressEl ? addressEl.value.trim() : ''; const note = noteEl ? noteEl.value.trim() : '';

  if (!name || !whatsapp || !address) { alert('Lengkapi nama, WhatsApp, dan alamat!'); return; }
  const cart = getCart(); if (!cart.length) { alert('Keranjang kosong'); return; }

  await loadProductsIfNeeded();
  let lines = [], total = 0;
  for (const it of cart) {
    const prod = _productsCache.find(p => Number(p.id) === Number(it.id)) || {name:'Produk', price:0};
    const qty = Number(it.qty || 0);
    const subtotal = Number(prod.price || 0) * qty; total += subtotal;
    lines.push(`${prod.name} x${qty} - Rp${formatRupiah(subtotal)}`);
  }

  let message = `Halo Bali Heritage Wear,%0ASaya ingin memesan:%0A` + lines.map(l => `- ${encodeURIComponent(l)}`).join('%0A');
  message += `%0A%0ANama: ${encodeURIComponent(name)}%0ANo. WA: ${encodeURIComponent(whatsapp)}%0AAlamat: ${encodeURIComponent(address)}`;
  if (note) message += `%0ACatatan: ${encodeURIComponent(note)}`;
  message += `%0A%0ATotal: Rp${formatRupiah(total)}`;

  const targetNumber = '62881037557496';
  const url = `https://wa.me/${targetNumber}?text=${message}`;
  window.open(url, '_blank');
}

/* Init on DOM ready */
document.addEventListener('DOMContentLoaded', async () => {
  updateCartBadge();
  if (document.querySelector('#product-list')) {
    try { await renderProductListFromApi('#product-list'); } catch(e){console.error(e);}
  }
  if (document.querySelector('#cart-table')) await renderCartTable();
  if (document.querySelector('#checkout-summary')) await renderCheckoutSummary();
});

/* expose */
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;
window.sendWhatsAppOrder = sendWhatsAppOrder;
window.renderCartTable = renderCartTable;
window.renderCheckoutSummary = renderCheckoutSummary;
window.renderProductListFromApi = renderProductListFromApi;
