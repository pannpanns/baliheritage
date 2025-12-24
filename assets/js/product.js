// assets/js/product.js
(function () {
  const SEARCH_INPUT_ID = 'searchInput';
  const CATEGORY_LINK_CLASS = 'category-link';
  const PRODUCT_ITEM_SELECTOR = '.product-item';

  document.addEventListener('DOMContentLoaded', () => {
    initProductSearchFilter();
    setTimeout(initProductSearchFilter, 500);
  });

  function initProductSearchFilter() {
    const searchInput = document.getElementById(SEARCH_INPUT_ID);
    let productItems = document.querySelectorAll(PRODUCT_ITEM_SELECTOR);
    const categoryLinks = document.querySelectorAll('.' + CATEGORY_LINK_CLASS);

    if (!productItems || productItems.length === 0) {
      const container = document.getElementById('product-list') || document.body;
      const mo = new MutationObserver((mutations, obs) => {
        productItems = document.querySelectorAll(PRODUCT_ITEM_SELECTOR);
        if (productItems.length > 0) {
          obs.disconnect();
          bindSearch();
          bindCategoryLinks();
        }
      });
      mo.observe(container, { childList: true, subtree: true });
      return;
    }

    bindSearch();
    bindCategoryLinks();

    window.refreshProductItems = function () {
      productItems = document.querySelectorAll(PRODUCT_ITEM_SELECTOR);
    };

    function bindSearch() {
      if (!searchInput) return;
      searchInput.addEventListener('input', function () {
        const q = this.value.trim().toLowerCase();
        productItems.forEach(item => {
          const name = (item.getAttribute('data-name') || item.querySelector('.card-title')?.innerText || '').toLowerCase();
          const description = (item.getAttribute('data-short') || item.querySelector('.card-text')?.innerText || '').toLowerCase();
          const matches = name.includes(q) || description.includes(q);
          item.style.display = matches ? '' : 'none';
        });
      });
    }

    function bindCategoryLinks() {
      if (!categoryLinks || categoryLinks.length === 0) return;
      categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const filter = link.getAttribute('data-filter');
          categoryLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          productItems = document.querySelectorAll(PRODUCT_ITEM_SELECTOR);
          productItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category') || item.dataset.category || '';
            if (filter === 'all' || itemCategory === filter) item.style.display = '';
            else item.style.display = 'none';
          });
        });
      });
    }

    if (typeof updateCartBadge === 'function') {
      try { updateCartBadge(); } catch (e) {}
    }
  }
})();
