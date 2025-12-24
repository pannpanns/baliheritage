// assets/js/api-products.js
// Fetch products from api/products.php and render cards into #product-list
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('product-list');
  if (!container) return;

  fetch('./api/products.php')
    .then(res => res.json())
    .then(products => {
      container.innerHTML = ''; // clear
      if (!products || products.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted">Belum ada produk.</p></div>';
        return;
      }

      products.forEach(p => {
        // determine display price & original price
        const price = Number(p.price) || 0;
        const dp = p.discount_price !== undefined ? Number(p.discount_price) : null;
        // decide which is original and which is promo (common patterns)
        let orig = null, sale = price;
        if (dp) {
          if (dp > price) { orig = dp; sale = price; }
          else { orig = price; sale = dp; }
        }

        const img = p.image ? p.image : (p.image_main ? p.image_main : 'assets/img/placeholder.png');
        const category = p.category_slug || p.category || '';

        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6 product-item';
        // add data attrs for search & filter
        col.setAttribute('data-name', p.name || '');
        col.setAttribute('data-category', category);

        col.innerHTML = `
          <div class="card h-100 card-product shadow-sm border-0">
            <img src="${escapeHtml(img)}" class="card-img-top" alt="${escapeHtml(p.name)}">
            <div class="card-body d-flex flex-column">
              <h6 class="fw-bold card-title">${escapeHtml(p.name)}</h6>
              <p class="text-muted small mb-2">${escapeHtml(p.short_description || '')}</p>
              <p class="mb-3">
                ${orig ? `<span class="text-decoration-line-through me-2">Rp ${numberWithDots(orig)}</span>` : ''}
                <span class="fw-bold text-brown">Rp ${numberWithDots(sale)}</span>
              </p>
              <div class="mt-auto d-grid">
                <button class="btn btn-primary" onclick="addToCart(${Number(p.id)})">Pesan</button>
              </div>
            </div>
          </div>
        `;
        container.appendChild(col);
      });

      // If product.js uses MutationObserver or initial binding, it will pick up new items.
      // But to be safe, if a refresh helper exists, call it:
      if (typeof window.refreshProductItems === 'function') {
        try { window.refreshProductItems(); } catch(e) { /* ignore */ }
      }
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = '<div class="col-12"><p class="text-danger">Gagal memuat produk.</p></div>';
    });

  // helpers
  function numberWithDots(x) {
    return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"'`=\/]/g, function (s) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
      })[s];
    });
  }
});
