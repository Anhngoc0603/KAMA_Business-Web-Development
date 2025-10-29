document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  // ===================================================================
  // 1. UTILS
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
  // 2. LOAD NEW ARRIVALS
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

    if (!Array.isArray(newProducts) || newProducts.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:50px 20px;color:#9b7c7c;font-style:italic;">
          <p>No new arrivals at the moment.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = newProducts.map(p => `
      <div class="product-card">
        <div class="product-image-container">
          <img src="${safeGet(p, 'images.0', 'https://via.placeholder.com/300')}" 
               alt="${escapeHTML(p.name || 'Product')}" 
               class="product-img"
               onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
          ${p.isNew ? `<span class="product-badge new">NEW</span>` : ''}
        </div>
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
  // 4. FIREWORKS
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
  // 5. MAIN VARIABLES
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
  // 6. LOAD PRODUCTS
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
  // 7. RENDER GRID
  // ===================================================================
  function renderGrid() {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const show = filtered.slice(start, end);
    displayed = [...displayed, ...show];

    els.grid.innerHTML = displayed.map(p => {
      const badge = p.isNew ? `<span class="product-badge new">NEW</span>` : '';
      return `
        <div class="product-card">
          <div class="product-image-container">
            <img src="${p.images?.[0] || 'https://via.placeholder.com/300'}" alt="${p.name}" class="product-img" onerror="this.src='https://via.placeholder.com/300';">
            <img src="${p.hoverImage || p.images?.[1] || p.images?.[0] || 'https://via.placeholder.com/300'}" alt="${p.name}" class="product-img hover-image" onerror="this.src='https://via.placeholder.com/300';">
            ${badge}
          </div>
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
      `;
    }).join('');

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

  // ===================================================================
  // 8. KẾT QUẢ & KHỞI ĐỘNG
  // ===================================================================
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

  if (els.loadMore) els.loadMore.onclick = () => { page++; renderGrid(); };

  // ===================================================================
  // 9. KHỞI ĐỘNG
  // ===================================================================
  loadNewArrivals();
  loadMainProducts();
});
