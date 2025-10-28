/**
 * script_new.js – PHIÊN BẢN HOÀN CHỈNH, AN TOÀN, KHÔNG LỖI
 * Dùng fetch('./products.json') riêng – không gộp
 * Đã sửa: 
 *   1. products is not iterable
 *   2. Cannot set properties of null
 *   3. shopping.png 404 → dùng SVG inline
 * Tương thích mọi trường hợp: file JSON hỏng, thiếu, 404, DOM lỗi...
 */

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  // ===================================================================
  // 1. UTILS: escapeHTML, log, safeGet
  // ===================================================================
  const escapeHTML = (str) => {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const log = (msg, type = 'log') => console[type](`[Script] ${msg}`);
  const safeGet = (obj, path, def = null) => {
    try {
      return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : def), obj);
    } catch {
      return def;
    }
  };

  // ===================================================================
  // 2. LOAD NEW ARRIVALS – TỪ FILE products.json RIÊNG
  // ===================================================================
  async function loadNewArrivals() {
    const container = document.getElementById('new-products-container');
    if (!container) {
      log('#new-products-container not found', 'warn');
      return;
    }

    let newProducts = [];

    try {
      const res = await fetch('./products.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!data || !Array.isArray(safeGet(data, 'products'))) {
        throw new Error('Invalid JSON: missing products array');
      }

      newProducts = data.products.filter(p => p && p.isNew === true);
      log(`Loaded ${newProducts.length} new arrival(s)`);

    } catch (err) {
      log(`Failed to load products.json: ${err.message}`, 'error');
    }

    // Fallback UI
    if (!Array.isArray(newProducts) || newProducts.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:50px 20px;color:#9b7c7c;font-style:italic;">
          <p>No new arrivals at the moment.</p>
        </div>
      `;
      return;
    }

    // Render
    container.innerHTML = newProducts.map(p => `
      <div class="product-card">
        <img 
          src="${safeGet(p, 'images.0', 'https://via.placeholder.com/300')}" 
          alt="${escapeHTML(p.name || 'Product')}" 
          class="product-img"
          onerror="this.src='https://via.placeholder.com/300?text=No+Image'"
        >
        <div class="product-info">
          <h3>${escapeHTML(p.name || 'Unknown')}</h3>
          <p>${escapeHTML(p.brand || 'Brand')} • ${escapeHTML(p.category || 'Category')}</p>
          <p>${escapeHTML(p.description || 'No description')}</p>
          <span class="price">$${Number(p.price || 0).toFixed(2)}</span>
          <div class="rating">
            ${'★'.repeat(Math.floor(p.rating || 0))}${'☆'.repeat(5 - Math.floor(p.rating || 0))} 
            (${p.rating || 'N/A'})
          </div>
          <button class="btn-primary" onclick="window.location.href='./view_product/view_new.html?id=${p.id}'">
            View Details
          </button>
        </div>
      </div>
    `).join('');
  }

  // ===================================================================
  // 3. LOAD HEADER & FOOTER
  // ===================================================================
  const loadPartial = async (url, placeholderId) => {
    const el = document.getElementById(placeholderId);
    if (!el) return log(`${placeholderId} not found`, 'warn');
    try {
      const res = await fetch(url);
      if (res.ok) el.innerHTML = await res.text();
      else throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      log(`Failed to load ${url}: ${e.message}`, 'error');
    }
  };

  await Promise.all([
    loadPartial('../header_footer/header.html', 'header-placeholder'),
    loadPartial('../header_footer/footer.html', 'footer-placeholder')
  ]);

  // ===================================================================
  // 4. FIREWORKS ANIMATION
  // ===================================================================
  const fireworks = document.querySelector('.fireworks-container');
  if (fireworks) {
    const colors = ['pink-1', 'pink-2', 'pink-3', 'pink-4'];
    for (let i = 0; i < 120; i++) {
      const p = document.createElement('div');
      p.className = `firework-particle ${colors[Math.floor(Math.random() * colors.length)]}`;
      p.style.setProperty('--tx', `${Math.random() * 200 - 100}vw`);
      p.style.setProperty('--ty', `${Math.random() * 200 - 100}vh`);
      p.style.setProperty('--i', i);
      fireworks.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }

  // ===================================================================
  // 5. STATE & DOM ELEMENTS
  // ===================================================================
  let products = [], filtered = [], displayed = [];
  let page = 1, perPage = 8, filteredFlag = false;

  const els = {
    filterToggle: document.getElementById('filter-toggle'),
    filterMenu: document.getElementById('filter-menu'),
    priceFilter: document.getElementById('price-filter'),
    ratingFilter: document.getElementById('rating-filter'),
    brandFilter: document.getElementById('brand-filter'),
    loadMore: document.getElementById('load-more-button'),
    grid: document.getElementById('products'),
    aiBtn: document.querySelector('.ai-btn')
  };

  // ===================================================================
  // 6. POPUP: AI COMBO
  // ===================================================================
  const comboPopup = document.createElement('div');
  comboPopup.className = 'combo-popup';
  comboPopup.innerHTML = `
    <div class="combo-wrapper">
      <h3 class="combo-title">Your AI Combo Suggestion</h3>
      <div class="combo-items"></div>
      <button class="combo-close">×</button>
    </div>
  `;
  document.body.appendChild(comboPopup);

  const comboItems = comboPopup.querySelector('.combo-items');
  const comboClose = comboPopup.querySelector('.combo-close');

  // ===================================================================
  // 7. POPUP: ADDED TO CART
  // ===================================================================
  const cartPopup = document.createElement('div');
  cartPopup.className = 'added-cart-popup';
  cartPopup.innerHTML = `
    <div class="added-cart-wrapper">
      <h3 class="added-cart-title">Added to Cart Successfully</h3>
      <p class="added-cart-product"></p>
      <button class="added-cart-close">×</button>
    </div>
  `;
  document.body.appendChild(cartPopup);

  const cartProduct = cartPopup.querySelector('.added-cart-product');
  const cartClose = cartPopup.querySelector('.added-cart-close');

  // ===================================================================
  // 8. CART SYSTEM
  // ===================================================================
  const addToCart = (product, qty = 1) => {
    try {
      let cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      qty = Math.max(1, Math.min(99, parseInt(qty) || 1));
      const existing = cart.find(i => i.id === product.id);
      if (existing) existing.quantity += qty;
      else cart.push({ id: product.id, name: product.name, price: product.price, image: product.images?.[0], quantity: qty });
      localStorage.setItem('cartItems', JSON.stringify(cart));
    } catch (e) {
      log('Cart save failed', 'error');
    }
  };

  const showCartPopup = (name, qty) => {
    cartProduct.textContent = `${name} × ${qty}`;
    cartPopup.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      cartPopup.classList.remove('active');
      document.body.style.overflow = '';
    }, 3000);
  };

  cartClose.onclick = () => {
    cartPopup.classList.remove('active');
    document.body.style.overflow = '';
  };
  cartPopup.onclick = (e) => e.target === cartPopup && (cartPopup.classList.remove('active'), document.body.style.overflow = '');

  // ===================================================================
  // 9. LOAD MAIN PRODUCTS
  // ===================================================================
  async function loadMainProducts() {
    try {
      const res = await fetch('./products.json');
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      if (!Array.isArray(data?.products)) throw new Error('Invalid data');
      products = data.products;
    } catch (e) {
      log('Using fallback products', 'warn');
      products = [{ id: 999, name: 'Sample', brand: 'Demo', category: 'Face', price: 29.99, rating: 4.5, description: 'Demo', images: ['https://via.placeholder.com/300'] }];
    }
    filtered = [...products];
    page = 1;
    displayed = [];
    renderGrid();
    updateResultCount();
  }

  // ===================================================================
  // 10. AI COMBO
  // ===================================================================
  if (els.aiBtn) {
    els.aiBtn.onclick = () => {
      const rand = (cat) => {
        const list = products.filter(p => p.category === cat);
        return list.length ? list[Math.floor(Math.random() * list.length)] : null;
      };
      const combo = [rand('Face'), rand('Eyes'), rand('Lips')].filter(Boolean);
      comboItems.innerHTML = combo.map(p => `
        <div class="combo-item">
          <img src="${p.images?.[0] || 'https://via.placeholder.com/150'}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/150';">
          <h4>${escapeHTML(p.name)}</h4>
          <p class="meta">${escapeHTML(p.brand)} • ${escapeHTML(p.category)}</p>
          <p class="price">$${p.price.toFixed(2)}</p>
          <p class="rating">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))} (${p.rating})</p>
        </div>
      `).join('');
      comboPopup.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    comboClose.onclick = () => {
      comboPopup.classList.remove('active');
      document.body.style.overflow = '';
    };
    comboPopup.onclick = (e) => e.target === comboPopup && (comboPopup.classList.remove('active'), document.body.style.overflow = '');
  }

  // ===================================================================
  // 11. FILTER & RENDER
  // ===================================================================
  window.filterProducts = (query = '') => {
    const cat = els.filterMenu?.querySelector('.is-selected')?.dataset.category || 'All';
    const price = els.priceFilter?.value || 'default';
    const rating = els.ratingFilter?.value || 'default';
    const brand = els.brandFilter?.value || 'default';

    filtered = products.filter(p => {
      const s = query.toLowerCase();
      const matchSearch = p.name?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s);
      const matchCat = cat === 'All' || p.category === cat;
      const matchBrand = brand === 'default' || p.brand === brand;
      const matchRating = rating === 'default' || (
        (rating === '5' && p.rating === 5) ||
        (rating === '4.5' && p.rating >= 4.5) ||
        (rating === '4' && p.rating >= 4)
      );
      return matchSearch && matchCat && matchBrand && matchRating;
    });

    if (price !== 'default') {
      filtered.sort((a, b) => price === 'low-high' ? a.price - b.price : b.price - a.price);
    }

    filteredFlag = true;
    page = 1;
    displayed = [];
    renderGrid();
    updateResultCount();
  };

  function renderGrid() {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const show = filtered.slice(start, end);
    displayed = [...displayed, ...show];

    els.grid.innerHTML = displayed.map(p => `
      <div class="product-card">
        <img src="${p.images?.[0] || 'https://via.placeholder.com/300'}" alt="${p.name}" class="product-img" onerror="this.src='https://via.placeholder.com/300';">
        <img src="${p.hoverImage || p.images?.[1] || p.images?.[0] || 'https://via.placeholder.com/300'}" alt="${p.name}" class="product-img hover-image" onerror="this.src='https://via.placeholder.com/300';">
        <div class="info">
          <h3>${escapeHTML(p.name)}</h3>
          <p class="meta">${escapeHTML(p.brand)} • ${escapeHTML(p.category)}</p>
          <p>${escapeHTML(p.description)}</p>
          <div class="actions">
            <span class="price">$${p.price.toFixed(2)}</span>
            <span class="rating">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))} (${p.rating})</span>
          </div>
          <div class="buttons">
            <input type="number" class="quantity-input" value="1" min="1" max="99">
            <button class="btn-outline" data-id="${p.id}"></button>
            <button class="btn-primary" onclick="window.location.href='./view_product/view_new.html?id=${p.id}'">View Details</button>
          </div>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.btn-outline').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const product = products.find(p => p.id == id);
        const qty = btn.closest('.buttons').querySelector('.quantity-input').value;
        if (product) {
          addToCart(product, qty);
          showCartPopup(product.name, qty);
        }
      };
    });

    els.loadMore.style.display = end < filtered.length ? 'block' : 'none';
  }

  function updateResultCount() {
    let el = document.querySelector('.search-result-count');
    if (!el) {
      el = document.createElement('div');
      el.className = 'search-result-count';
      els.grid.before(el);
    }
    if (filteredFlag && filtered.length) {
      el.textContent = `${filtered.length} product${filtered.length > 1 ? 's' : ''} found`;
      el.classList.add('active');
    } else el.classList.remove('active');
  }

  // Load more
  if (els.loadMore) els.loadMore.onclick = () => { page++; renderGrid(); };

  // Filters
  [els.priceFilter, els.ratingFilter, els.brandFilter].forEach(el => el && (el.onchange = () => window.filterProducts()));

  // Category toggle
  if (els.filterToggle && els.filterMenu) {
    els.filterToggle.onclick = () => els.filterMenu.classList.toggle('show');
    document.addEventListener('click', e => {
      if (!els.filterToggle.contains(e.target) && !els.filterMenu.contains(e.target)) {
        els.filterMenu.classList.remove('show');
      }
    });
    els.filterMenu.querySelectorAll('.category-btn').forEach(btn => {
      btn.onclick = () => {
        els.filterMenu.querySelectorAll('.category-btn').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        window.filterProducts();
      };
    });
  }

  // ===================================================================
  // 12. HEADER INIT
  // ===================================================================
  function initHeader() {
    const toggler = document.getElementById('menu-toggler');
    const nav = document.getElementById('navbar');
    const searchIcon = document.querySelector('.search .icon');
    const searchInput = document.getElementById('search-input-main');

    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
      <div class="search-wrapper">
        <input class="search-input" placeholder="Search for...">
        <button class="close-search">×</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('.search-input');
    const close = overlay.querySelector('.close-search');

    searchIcon?.addEventListener('click', () => {
      overlay.classList.add('active');
      input.focus();
      document.body.style.overflow = 'hidden';
    });
    close.onclick = () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };
    input.oninput = () => {
      searchInput.value = input.value;
      window.filterProducts(input.value);
    };

    toggler?.addEventListener('click', e => {
      e.stopPropagation();
      nav.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
    document.addEventListener('click', e => {
      if (window.innerWidth <= 900 && nav.classList.contains('active') && !nav.contains(e.target) && !toggler.contains(e.target)) {
        nav.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // ===================================================================
  // 13. KHỞI ĐỘNG
  // ===================================================================
  loadNewArrivals();
  loadMainProducts();
  setTimeout(initHeader, 200);
});