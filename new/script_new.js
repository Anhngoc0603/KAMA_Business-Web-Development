(function() {
  const mask = document.querySelector('.video-mask');
  if (!mask) return;

  let lastScrollY = 0;
  let ticking = false;

  function updateWave(scrollY) {
    const curveY = 90 - Math.min(scrollY / 30, 10);
    mask.style.clipPath = `path("M 0 0 H 100% V ${curveY}% Q 50% 100% 100% ${curveY}% V 0 Z")`;
    mask.style.webkitClipPath = `path("M 0 0 H 100% V ${curveY}% Q 50% 100% 100% ${curveY}% V 0 Z")`;
  }

  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateWave(lastScrollY);
        ticking = false;
      });
      ticking = true;
    }
  });
})();
// ===== Escape HTML để tránh lỗi XSS =====
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}


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
  // 2. LOAD HEADER & FOOTER (Đặt lên đầu để load sớm)
  // ===================================================================
  async function loadPartial(url, placeholderId) {
    const el = document.getElementById(placeholderId);
    if (!el) return log(`${placeholderId} not found`, 'warn');
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      el.innerHTML = await res.text();
      log(`Loaded ${url}`);
    } catch (e) {
      log(`Failed to load ${url}: ${e.message}`, 'error');
    }
  }

await loadPartial('../header_footer/header.html', 'header-placeholder');
  await loadPartial('../header_footer/footer.html', 'footer-placeholder');

  // SAU KHI HEADER LOAD → GỌI INIT
  setTimeout(initHeaderEvents, 100); // Đảm bảo DOM đã sẵn sàng
});

// === INIT HEADER EVENTS – KHÔNG CẦN SỬA HEADER.HTML ===
function initHeaderEvents() {
  const shopAll = document.querySelector('.shop-all');
  const menuCategories = document.querySelector('.menu-categories');
  const menuToggler = document.querySelector('.menu-toggler');
  const navbar = document.querySelector('.navbar');

  if (!shopAll || !menuCategories) {
    console.warn('Shop All or Menu Categories not found');
    return;
  }

  // Mobile menu toggle (hamburger)
  if (menuToggler && navbar) {
    menuToggler.addEventListener('click', () => {
      navbar.classList.toggle('active');
    });
  }

  // === DESKTOP: HOVER ===
  if (window.innerWidth > 900) {
    const show = () => menuCategories.classList.add('active');
    const hide = () => menuCategories.classList.remove('active');

    shopAll.addEventListener('mouseenter', show);
    menuCategories.addEventListener('mouseenter', show);
    shopAll.addEventListener('mouseleave', hide);
    menuCategories.addEventListener('mouseleave', hide);
  }

  // === MOBILE: CLICK TOGGLE ===
  else {
    // Chuyển <li> thành clickable
    menuCategories.querySelectorAll('.product-list li').forEach(li => {
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        // Tùy chọn: chuyển trang hoặc đóng menu
        const text = li.textContent.trim();
        if (text.includes('Shop All')) {
          window.location.href = '../categories/categories.html'; // Thay bằng link thật sau
        } else {
          alert(`Bạn chọn: ${text}`); // Thay bằng link thật sau
        }
        closeMobileMenu();
      });
    });

    // Click Shop All → mở/đóng dropdown
shopAll.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (window.innerWidth <= 900) {
    // MOBILE: Điều hướng ngay lập tức
    window.location.href = '../categories/categories.html';
  } else {
    // DESKTOP: Mở dropdown như cũ
    const isActive = menuCategories.classList.contains('active');
    menuCategories.classList.toggle('active', !isActive);
    document.body.classList.toggle('menu-open', !isActive);
  }
});

    // Click ngoài → đóng
    document.addEventListener('click', (e) => {
      if (!shopAll.contains(e.target) && !menuCategories.contains(e.target)) {
        closeMobileMenu();
      }
    });

    function closeMobileMenu() {
      menuCategories.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  }
}

  // ===================================================================
  // 3. LOAD NEW ARRIVALS
  // ===================================================================
  async function loadNewArrivals() {
    const container = document.getElementById('new-products-container');
    if (!container) return;

    try {
      const res = await fetch('./products.json', { cache: 'no-store' });
      const data = await res.json();
      const newProducts = data.products.filter(p => p.isNew);

      container.innerHTML = newProducts.map(p => `
        <div class="product-card">
          <div class="product-image-container">
<img src="${(p.images && p.images[0]) ? p.images[0] : 'https://via.placeholder.com/300'}" 
     alt="${escapeHTML(p.name)}" class="product-img">

            <span class="product-badge new">NEW</span>
          </div>
          <div class="product-info">
            <h3>${escapeHTML(p.name)}</h3>
            <p>${escapeHTML(p.brand)} • ${escapeHTML(p.category)}</p>
            <span class="price">$${p.price.toFixed(2)}</span>
            <button class="btn-primary" onclick="window.location.href='./view_product/view_new.html?id=${p.id}'">View Details</button>
          </div>
        </div>
      `).join('');
    } catch (e) {
      log(`New arrivals error: ${e.message}`, 'error');
    }
  }

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
  // 5. LOAD PRODUCTS
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

  async function loadMainProducts() {
    try {
      const res = await fetch('./products.json', { cache: 'no-store' });
      const data = await res.json();
      products = data.products || [];
    } catch (e) {
      log('Fallback product', 'warn');
      products = [{ id: 1, name: 'Sample', brand: 'Demo', price: 29.99, rating: 4.5, category: 'Face', images: ['https://via.placeholder.com/300'] }];
    }
    filtered = [...products];
    page = 1;
    displayed = [];
    renderGrid();
    updateResultCount();
  }

  function renderGrid() {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const show = filtered.slice(start, end);
    displayed = [...displayed, ...show];

    els.grid.innerHTML = displayed.map(p => `
      <div class="product-card">
        <div class="product-image-container">
          <img src="${p.images?.[0] || 'https://via.placeholder.com/300'}" alt="${escapeHTML(p.name)}" class="product-img">
          <img src="${p.images?.[1] || p.images?.[0]}" alt="${escapeHTML(p.name)}" class="product-img hover-image">
          ${p.isNew ? `<span class="product-badge new">NEW</span>` : ''}
        </div>
        <div class="info">
          <h3>${escapeHTML(p.name)}</h3>
          <p class="meta">${escapeHTML(p.brand)} • ${escapeHTML(p.category)}</p>
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

  if (els.loadMore) els.loadMore.onclick = () => { page++; renderGrid(); };
  

  // ===================================================================
  // 6. RUN
  // ===================================================================
  loadNewArrivals();
  loadMainProducts();
  document.addEventListener("DOMContentLoaded", () => {
  const wave = document.querySelector(".wave-bg");
  const section = document.querySelector(".wave-section");
  if (!wave || !section) return;

  function updateWave() {
    const scrollY = window.scrollY;
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const windowHeight = window.innerHeight;

    // Tính phần cuộn trong viewport
    const distance = scrollY + windowHeight - sectionTop;
    const progress = Math.min(1, Math.max(0, distance / (windowHeight + sectionHeight)));

    // Cập nhật hiệu ứng parallax
    const translateY = progress * 60;  // di chuyển mượt
    const scaleY = 1 + progress * 0.1; // phồng nhẹ
    const brightness = 1 - progress * 0.25; // tối dần

    wave.style.transform = `translateY(${translateY}px) scaleY(${scaleY})`;
    wave.style.filter = `brightness(${brightness})`;
  }

  window.addEventListener("scroll", updateWave, { passive: true });
  updateWave();
});
// ✅ FIX MOBILE DROPDOWN CLICK
document.addEventListener('DOMContentLoaded', () => {
  // Chờ header load xong
  setTimeout(() => {
    const shopAll = document.querySelector('.shop-all');
    const menuCategories = document.querySelector('.menu-categories');
    const body = document.body;
    
    if (!shopAll || !menuCategories) return;
    
    // Mobile: Toggle dropdown thay vì chuyển trang
    if (window.innerWidth <= 900) {
      shopAll.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isActive = menuCategories.classList.contains('active');
        
        // Đóng tất cả menu khác
        document.querySelectorAll('.menu-categories').forEach(m => m.classList.remove('active'));
        body.classList.remove('menu-open');
        
        if (!isActive) {
          // Mở dropdown
          menuCategories.classList.add('active');
          body.classList.add('menu-open');
        }
      });
      
      // Đóng khi click ngoài
      document.addEventListener('click', (e) => {
        if (!shopAll.contains(e.target) && !menuCategories.contains(e.target)) {
          menuCategories.classList.remove('active');
          body.classList.remove('menu-open');
        }
      });
    }
  }, 500); // Delay để header load từ fetch
});
