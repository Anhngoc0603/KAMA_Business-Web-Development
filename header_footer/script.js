(function() {
  function initHeaderScript() {
    if (window.__headerScriptInitialized) return;
    window.__headerScriptInitialized = true;
  // ================== NAVIGATION HELPER ==================
  // Điều hướng an toàn tới đường dẫn gốc của dự án, hoạt động với cả server (http) và mở file trực tiếp (file:///)
  function navigateToRoot(pathWithQuery) {
    try {
      const scriptEl = Array.from(document.scripts).find(s => s.src && s.src.includes('/header_footer/script.js')) || Array.from(document.scripts).find(s => s.src && s.src.includes('header_footer/script.js'));
      const srcUrl = new URL(scriptEl ? scriptEl.src : window.location.href, window.location.href);
      const baseHref = srcUrl.href.replace(/header_footer\/script\.js(?:\?.*)?$/, '');
      const target = new URL(pathWithQuery.replace(/^\//, ''), baseHref);
      window.location.href = target.href;
    } catch (err) {
      // Fallback: nếu không phân giải được, cố gắng dùng đường dẫn tuyệt đối
      const p = pathWithQuery.startsWith('/') ? pathWithQuery : '/' + pathWithQuery;
      window.location.href = p;
    }
  }
  // Expose để dùng ngoài IIFE (ví dụ popup toàn cục)
  try { window.navigateToRoot = navigateToRoot; } catch(_) {}

  // ================== ANNOUNCEMENT ==================
  const wrapper1 = document.getElementById('announcementWrapper');
  const announcement = document.querySelectorAll('.announcement-slide');
  let indexAnnouncement = 0;

  function showAnnouncement(i) {
    wrapper1.style.transform = `translateX(-${i * 100}%)`;
  }

  if (wrapper1 && announcement.length > 0) {
    setInterval(() => {
      indexAnnouncement = (indexAnnouncement + 1) % announcement.length;
      showAnnouncement(indexAnnouncement);
    }, 5000);
  }

  // ================== MENU TOGGLE ==================
  const menuToggler = document.getElementById('menu-toggler');
  const navbar = document.getElementById('navbar');
  const shopAll = document.querySelector('.shop-all');
  const menuCategories = document.querySelector('.menu-categories');
  const backBtn = document.querySelector('.back-btn');
  const nextButtons = document.querySelectorAll('.next-btn');
  const searchIcon = document.querySelector('.search .icon');
  const searchInput = document.getElementById('search-input-main');
  const searchOverlay = document.getElementById('searchOverlay');
  const overlayInput = document.getElementById('search-input-overlay');
  const closeSearchBtn = document.querySelector('.close-search');
  const searchResultsEl = document.getElementById('searchResults');
  // Logo click -> navigate to homepage
  const logoEl = document.querySelector('.logo');
  if (logoEl) {
    logoEl.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToRoot('/1.homepage/html/landingpage.html');
    });
  }
  // Toggle menu
  if (menuToggler && navbar) {
    menuToggler.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = navbar.classList.contains('active');
      navbar.classList.toggle('active', !isActive);
      navbar.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      navbar.style.transform = isActive ? 'translateY(-100%)' : 'translateY(0)';
      navbar.style.opacity = isActive ? '0' : '1';
      document.body.style.overflow = isActive ? '' : 'hidden';
      
      if (!isActive) {
        if (shopAll) shopAll.classList.remove('active');
        if (menuCategories) {
          menuCategories.classList.remove('active');
          menuCategories.style.display = 'none';
          document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
            const productList = cat.querySelector('.product-list');
            if (productList) productList.style.display = 'none';
          });
        }
      } else {
        restoreScroll();
      }
    });

    // Click outside to close menu on mobile
    document.addEventListener('click', (e) => {
      if (
        window.innerWidth <= 900 &&
        !navbar.contains(e.target) &&
        !menuToggler.contains(e.target) &&
        navbar.classList.contains('active')
      ) {
        closeMobileMenu();
      }
    });
  }

  // Mobile categories handling
  if (shopAll && menuCategories) {
    let timeoutId;

    // PC hover behavior
    const handleMouseEnter = () => {
      clearTimeout(timeoutId);
      if (window.innerWidth > 900) {
        menuCategories.style.display = 'block';
        menuCategories.style.opacity = '1';
        menuCategories.style.transform = 'translateY(0)';
        document.querySelectorAll('.category').forEach(cat => {
          cat.classList.add('active');
          const productList = cat.querySelector('.product-list');
          if (productList) productList.style.display = 'block';
        });
      }
    };

    const handleMouseLeave = () => {
      timeoutId = setTimeout(() => {
        if (window.innerWidth > 900) {
          menuCategories.style.display = 'none';
          menuCategories.style.opacity = '0';
          menuCategories.style.transform = 'translateY(-10px)';
          document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
            const productList = cat.querySelector('.product-list');
            if (productList) productList.style.display = 'none';
          });
        }
      }, 300);
    };

    // Mobile click behavior
    shopAll.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        e.stopPropagation();
        
        // Nếu click vào link "Categories", chuyển trang
        if (e.target.closest('a') && e.target.closest('a').getAttribute('href')) {
          window.location.href = e.target.closest('a').getAttribute('href');
          return;
        }
        
        // Nếu click vào phần còn lại của shopAll, toggle menu
        const isActive = shopAll.classList.contains('active');
        shopAll.classList.toggle('active', !isActive);
        menuCategories.classList.toggle('active', !isActive);
        menuCategories.style.display = menuCategories.classList.contains('active') ? 'flex' : 'none';
        menuCategories.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        menuCategories.style.opacity = isActive ? '0' : '1';
        menuCategories.style.transform = isActive ? 'translateY(-10px)' : 'translateY(0)';
        
        if (backBtn) {
          backBtn.style.display = menuCategories.classList.contains('active') ? 'flex' : 'none';
        }
      }
    });

    // Mobile category interactions
    function setupMobileCategoryInteractions() {
      nextButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const category = btn.closest('.category');
          const isActive = category.classList.contains('active');
          
          document.querySelectorAll('.category').forEach(cat => {
            if (cat !== category) {
              cat.classList.remove('active');
              const productList = cat.querySelector('.product-list');
              if (productList) productList.style.display = 'none';
            }
          });
          
          category.classList.toggle('active', !isActive);
          const productList = category.querySelector('.product-list');
          if (productList) {
            productList.style.display = category.classList.contains('active') ? 'block' : 'none';
            productList.style.transition = 'opacity 0.3s ease';
            productList.style.opacity = category.classList.contains('active') ? '1' : '0';
          }
        });
      });

      // Category header click
      document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', (e) => {
          if (window.innerWidth <= 900) {
            // Nếu click vào link category, chuyển trang
            if (e.target.closest('a') && e.target.closest('a').getAttribute('href')) {
              window.location.href = e.target.closest('a').getAttribute('href');
              return;
            }
            
            // Nếu click vào phần còn lại, toggle product list
            if (!e.target.closest('.next-btn')) {
              e.stopPropagation();
              const category = header.closest('.category');
              const isActive = category.classList.contains('active');
              
              document.querySelectorAll('.category').forEach(cat => {
                if (cat !== category) {
                  cat.classList.remove('active');
                  const productList = cat.querySelector('.product-list');
                  if (productList) productList.style.display = 'none';
                }
              });
              
              category.classList.toggle('active', !isActive);
              const productList = category.querySelector('.product-list');
              if (productList) {
                productList.style.display = category.classList.contains('active') ? 'block' : 'none';
                productList.style.transition = 'opacity 0.3s ease';
                productList.style.opacity = category.classList.contains('active') ? '1' : '0';
              }
            }
          }
        });
      });

      // Product list items click - chuyển trang khi click
      document.querySelectorAll('.product-list li a').forEach(link => {
        link.addEventListener('click', (e) => {
          if (window.innerWidth <= 900) {
            window.location.href = link.getAttribute('href');
          }
        });
      });

      // Deep link điều hướng: bấm vào tiêu đề category (FACE/EYES/LIPS)
      document.querySelectorAll('.category[data-category] .category-header h3 a').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          const cat = anchor.closest('.category')?.getAttribute('data-category');
          if (cat) {
            navigateToRoot(`categories/categories.html?cat=${encodeURIComponent(cat)}`);
          }
        });
      });

      // Deep link điều hướng: bấm "Shop All <Category>" trong dropdown
      document.querySelectorAll('.category[data-category] .product-list .shop-all-link').forEach(li => {
        li.style.cursor = 'pointer';
        li.addEventListener('click', (e) => {
          e.preventDefault();
          const cat = li.closest('.category')?.getAttribute('data-category');
          if (cat) {
            navigateToRoot(`categories/categories.html?cat=${encodeURIComponent(cat)}`);
          }
        });
      });
    }

    setupMobileCategoryInteractions();

    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMobileCategories();
      });
    }

    // PC hover events
    if (window.innerWidth > 900) {
      shopAll.addEventListener('mouseenter', handleMouseEnter);
      shopAll.addEventListener('mouseleave', handleMouseLeave);
      menuCategories.addEventListener('mouseenter', handleMouseEnter);
      menuCategories.addEventListener('mouseleave', handleMouseLeave);
    }

    // Resize handler
    const handleResize = debounce(() => {
      if (window.innerWidth > 900) {
        shopAll.addEventListener('mouseenter', handleMouseEnter);
        shopAll.addEventListener('mouseleave', handleMouseLeave);
        menuCategories.addEventListener('mouseenter', handleMouseEnter);
        menuCategories.addEventListener('mouseleave', handleMouseLeave);
        closeMobileCategories();
        navbar.classList.remove('active');
        navbar.style.transform = 'translateY(0)';
        navbar.style.opacity = '1';
        restoreScroll();
      } else {
        shopAll.removeEventListener('mouseenter', handleMouseEnter);
        shopAll.removeEventListener('mouseleave', handleMouseLeave);
        menuCategories.removeEventListener('mouseenter', handleMouseEnter);
        menuCategories.removeEventListener('mouseleave', handleMouseLeave);
        menuCategories.style.transform = 'translateY(0)';
        document.querySelectorAll('.category').forEach(cat => {
          cat.classList.remove('active');
          const productList = cat.querySelector('.product-list');
          if (productList) productList.style.display = 'none';
        });
      }
    }, 100);

    window.addEventListener('resize', handleResize);
  }

  function closeMobileMenu() {
    navbar.classList.remove('active');
    navbar.style.transform = 'translateY(-100%)';
    navbar.style.opacity = '0';
    closeMobileCategories();
    restoreScroll();
  }

  function closeMobileCategories() {
    if (shopAll) shopAll.classList.remove('active');
    if (menuCategories) {
      menuCategories.classList.remove('active');
      menuCategories.style.display = 'none';
    }
    if (backBtn) backBtn.style.display = 'none';
    document.querySelectorAll('.category').forEach(cat => {
      cat.classList.remove('active');
      const productList = cat.querySelector('.product-list');
      if (productList) productList.style.display = 'none';
    });
  }

  function restoreScroll() {
    document.body.style.overflow = '';
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ================== SEARCH FUNCTIONALITY ==================
  // Helper: debounce
  function debounce(fn, delay = 250) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Desktop: open overlay on icon click, Mobile: focus inline input
  if (searchIcon) {
    searchIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.innerWidth > 900 && searchOverlay) {
        searchOverlay.classList.add('active');
        if (overlayInput) overlayInput.focus();
      } else if (searchInput) {
        searchInput.focus();
      }
    });
  }

  // Close overlay handlers
  if (closeSearchBtn && searchOverlay) {
    closeSearchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      searchOverlay.classList.remove('active');
      if (searchResultsEl) searchResultsEl.innerHTML = '';
      if (overlayInput) overlayInput.value = '';
    });

    // Click outside to close
    searchOverlay.addEventListener('click', (e) => {
      const wrapper = searchOverlay.querySelector('.search-wrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        searchOverlay.classList.remove('active');
        if (searchResultsEl) searchResultsEl.innerHTML = '';
        if (overlayInput) overlayInput.value = '';
      }
    });

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
        searchOverlay.classList.remove('active');
        if (searchResultsEl) searchResultsEl.innerHTML = '';
        if (overlayInput) overlayInput.value = '';
      }
    });
  }

  // Inline search input (mobile/desktop header)
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (window.filterProducts) {
        window.filterProducts(query);
      }
    });
    // Enter: điều hướng tới trang Categories với truy vấn
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = (searchInput.value || '').trim();
        if (q) {
          navigateToRoot(`categories/categories.html?q=${encodeURIComponent(q)}`);
        }
      }
    });
    // Fallback: keyup để đảm bảo bắt Enter trên một số trình duyệt
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        const q = (searchInput.value || '').trim();
        if (q) {
          navigateToRoot(`categories/categories.html?q=${encodeURIComponent(q)}`);
        }
      }
    });
  }

  // Overlay search input suggestions
  if (overlayInput && searchResultsEl) {
    const onOverlayInput = debounce((e) => {
      const q = (typeof e === 'string' ? e : e.target.value || '').toLowerCase().trim();
      renderSearchSuggestions(q);
    }, 200);
    overlayInput.addEventListener('input', onOverlayInput);
    // Enter to navigate to categories page with query
    overlayInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = (overlayInput.value || '').trim();
        if (q) {
          navigateToRoot(`categories/categories.html?q=${encodeURIComponent(q)}`);
        }
      }
    });
  }

  // ====== Suggestion rendering (data wired in later section) ======
  let SEARCH_INDEX = [];
  // Load product index for suggestions from both Best_Sellers and Categories
  async function loadSearchIndex() {
    try {
      const [resBest, resCat] = await Promise.all([
        fetch('/Best_Sellers/full.json', { cache: 'no-store' }),
        fetch('/categories/full.json', { cache: 'no-store' })
      ]);
      const dataBest = resBest.ok ? await resBest.json() : { products: [] };
      const dataCat = resCat.ok ? await resCat.json() : { products: [] };
      const bestProducts = Array.isArray(dataBest.products) ? dataBest.products : [];
      const catProducts = Array.isArray(dataCat.products) ? dataCat.products : [];

      const normalizeBest = bestProducts.map(p => {
        const images = Array.isArray(p.images) ? p.images.map(img => {
          if (!img) return '/header_footer/images/LOGO.png';
          if (String(img).startsWith('./images/')) return String(img).replace('./images/', '/Best_Sellers/images/');
          if (String(img).startsWith('images/')) return '/Best_Sellers/' + String(img);
          return String(img);
        }) : p.images;
        return { ...p, images, source: 'Best_Sellers' };
      });

      const normalizeCat = catProducts.map(p => {
        const images = Array.isArray(p.images) ? p.images.map(img => {
          if (!img) return '/header_footer/images/LOGO.png';
          if (String(img).startsWith('./images/')) return String(img).replace('./images/', '/categories/images/');
          if (String(img).startsWith('images/')) return '/categories/' + String(img);
          return String(img);
        }) : p.images;
        return { ...p, images, source: 'categories' };
      });

      SEARCH_INDEX = [...normalizeBest, ...normalizeCat];
    } catch (e) {
      console.warn('Search index load error:', e);
      SEARCH_INDEX = [];
    }
  }

  // Kick off index load on desktop (overlay usage) and mobile as well
  loadSearchIndex();
  // Helpers for relevance scoring
  function normalizeText(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function relevanceScore(product, query) {
    const qn = normalizeText(query);
    if (!qn) return 0;
    const tokens = qn.split(/\s+/).filter(Boolean);

    const fields = {
      category: normalizeText(product.category),
      brand: normalizeText(product.brand),
      name: normalizeText(product.name),
      subtype: normalizeText(product.subtype),
      description: normalizeText(product.description)
    };

    let score = 0;
    tokens.forEach(tok => {
      // Ưu tiên danh mục, sau đó brand, rồi tới tên
      if (fields.category === tok) score += 60;
      else if (fields.category.startsWith(tok)) score += 40;
      else if (fields.category.includes(tok)) score += 25;

      if (fields.brand === tok) score += 55;
      else if (fields.brand.startsWith(tok)) score += 35;
      else if (fields.brand.includes(tok)) score += 22;

      if (fields.name === tok) score += 50;
      else if (fields.name.startsWith(tok)) score += 32;
      else if (fields.name.includes(tok)) score += 20;

      if (fields.subtype && fields.subtype.includes(tok)) score += 12;
      if (fields.description && fields.description.includes(tok)) score += 8;
    });

    return score;
  }

  function renderSearchSuggestions(query) {
    if (!searchResultsEl) return;
    if (!query) {
      searchResultsEl.innerHTML = '';
      return;
    }
    const scored = SEARCH_INDEX
      .map(p => ({ item: p, score: relevanceScore(p, query) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);
    const total = scored.length;
    const limited = scored.slice(0, 8).map(x => x.item);

    if (limited.length === 0) {
      searchResultsEl.innerHTML = `<div class="search-empty">No matching products</div>`;
      return;
    }

    const htmlItems = limited.map(p => {
      const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : '/header_footer/images/LOGO.png';
      const price = typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : '';
      return `
        <div class="search-item" data-id="${p.id}" data-source="${p.source || 'Best_Sellers'}">
          <img src="${img}" alt="${p.name}" onerror="this.src='/header_footer/images/LOGO.png'">
          <div class="meta">
            <div class="title">${p.name}</div>
            <div class="sub">${p.brand || ''} ${price ? '• ' + price : ''}</div>
          </div>
        </div>`;
    }).join('');

    const htmlMore = total > 8
      ? `<div class="search-item" data-more="1">View more results (${total - 8})</div>`
      : '';

    searchResultsEl.innerHTML = htmlItems + htmlMore;

    // Navigate to product detail on click
    searchResultsEl.querySelectorAll('.search-item').forEach(el => {
      el.addEventListener('click', () => {
        // View more special item
        if (el.getAttribute('data-more')) {
          const q = (overlayInput?.value || '').trim();
          if (q) navigateToRoot(`categories/categories.html?q=${encodeURIComponent(q)}`);
          return;
        }
        const id = el.getAttribute('data-id');
        const src = el.getAttribute('data-source');
        if (!id) return;
        if (src === 'categories') {
          // Giữ nguyên đường dẫn hiện tại nếu cấu trúc trang chi tiết khác; có thể chuẩn hoá sau
          window.location.href = `/src/pages/categories/categories_detail.html?id=${encodeURIComponent(id)}`;
        } else {
          navigateToRoot(`Best_Sellers/view_detail.html?id=${encodeURIComponent(id)}`);
        }
      });
    });
  }

    // ================== SLIDER FUNCTIONALITY ==================
    initializeSliders();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderScript, { once: true });
  } else {
    initHeaderScript();
  }
})();

// ================== SLIDER INITIALIZATION ==================
function initializeSliders() {
  // Hero Slider
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  let currentSlide = 0;
  let slideInterval;

  function showSlide(n) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    currentSlide = (n + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  // Auto slide every 5 seconds
  if (slides.length > 0) {
    slideInterval = setInterval(nextSlide, 5000);
  }

  // Dot click events
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      clearInterval(slideInterval);
      showSlide(index);
      slideInterval = setInterval(nextSlide, 5000);
    });
  });

  // Product Sliders Navigation
  const leftBtns = document.querySelectorAll('.navigation.left');
  const rightBtns = document.querySelectorAll('.navigation.right');

  leftBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrapper = btn.closest('.slider-new, .sliderBestsellers, .slider-container').querySelector('.new-wrapper, .wrapperBestseller, .slider-wrapper');
      if (wrapper) {
        wrapper.scrollBy({ left: -300, behavior: 'smooth' });
      }
    });
  });

  rightBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrapper = btn.closest('.slider-new, .sliderBestsellers, .slider-container').querySelector('.new-wrapper, .wrapperBestseller, .slider-wrapper');
      if (wrapper) {
        wrapper.scrollBy({ left: 300, behavior: 'smooth' });
      }
    });
  });
}

// ================== PRODUCT FILTERING ==================
window.filterProducts = function(query) {
  const productCards = document.querySelectorAll('.newproduct, .prodBestsellers, .product-card');
  
  productCards.forEach(card => {
    const productName = card.querySelector('h3')?.textContent.toLowerCase() || '';
    const productBrand = card.querySelector('.brand')?.textContent.toLowerCase() || '';
    const productCategory = card.querySelector('.category')?.textContent.toLowerCase() || '';
    
    const matches = productName.includes(query) || 
                   productBrand.includes(query) || 
                   productCategory.includes(query);
    
    card.style.display = matches ? 'block' : 'none';
    card.style.opacity = matches ? '1' : '0.3';
  });
};

// ================== CART FUNCTIONALITY ==================
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showAddToCartMessage();
}

function updateCartCount() {
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity ?? item.qty) || 0), 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

function showAddToCartMessage() {
  // Rich popup: "+1 new item added to cart" with close and Proceed
  let popup = document.querySelector('.cart-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.className = 'cart-popup';
    popup.innerHTML = `
      <button class="cart-popup-close" aria-label="Close">&times;</button>
      <div class="cart-popup-content">
        <div class="cart-popup-title">+1 new item added to cart</div>
        <div class="cart-popup-actions">
          <button class="cart-popup-checkout">Proceed to Checkout</button>
        </div>
      </div>
    `;
    // Base styles to ensure it works even if CSS file not yet loaded
    popup.style.cssText = `
      position: fixed;
      right: 20px;
      top: 90px;
      background: var(--warm-blush);
      color: #fff;
      border-radius: 12px;
      box-shadow: 0 10px 24px rgba(0,0,0,0.16);
      z-index: 10000;
      overflow: hidden;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      min-width: 280px;
      border: 1px solid var(--soft-rose);
      font-family: 'Playfair Display', serif;
    `;
    document.body.appendChild(popup);

    const closeBtn = popup.querySelector('.cart-popup-close');
    closeBtn.style.cssText = `
      background: transparent;
      border: none;
      color: #fff;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      margin-left: 8px;
    `;
    closeBtn.addEventListener('click', () => {
      hideCartPopup();
    });

    const checkoutBtn = popup.querySelector('.cart-popup-checkout');
    checkoutBtn.style.cssText = `
      background: #fff;
      color: var(--branch-brown);
      border: none;
      font-weight: 700;
      padding: 8px 12px;
      border-radius: 999px;
      cursor: pointer;
    `;
    checkoutBtn.addEventListener('click', () => {
      // Điều hướng an toàn hoạt động cả trên server http và khi mở file trực tiếp
      if (typeof window.navigateToRoot === 'function') {
        window.navigateToRoot('/checkout/checkout.html');
      } else {
        window.location.href = '/checkout/checkout.html';
      }
    });
  }

  // Update content if needed and show
  const titleEl = popup.querySelector('.cart-popup-title');
  if (titleEl) titleEl.textContent = '+1 new item added to cart';
  popup.style.opacity = '0';
  popup.style.display = 'flex';
  requestAnimationFrame(() => {
    popup.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    popup.style.transform = 'translateY(0)';
    popup.style.opacity = '1';
  });

  // Auto hide after 5 seconds
  clearTimeout(window.__cartPopupTimer);
  window.__cartPopupTimer = setTimeout(() => hideCartPopup(), 5000);

  function hideCartPopup() {
    if (!popup) return;
    popup.style.opacity = '0';
    popup.style.transform = 'translateY(-6px)';
    setTimeout(() => {
      popup.style.display = 'none';
    }, 250);
  }
}

// ================== WISHLIST FUNCTIONALITY ==================
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function toggleWishlist(product) {
  const existingIndex = wishlist.findIndex(item => item.id === product.id);
  
  if (existingIndex > -1) {
    wishlist.splice(existingIndex, 1);
  } else {
    wishlist.push(product);
  }
  
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
}

function updateWishlistCount() {
  const wishlistCount = document.querySelector('.wishlist-count');
  if (wishlistCount) {
    wishlistCount.textContent = wishlist.length;
    wishlistCount.style.display = wishlist.length > 0 ? 'flex' : 'none';
  }
}

// ================== PRODUCT CARD INTERACTIONS ==================
function setupProductCardInteractions() {
  document.querySelectorAll('.product-card').forEach(card => {
    const quickViewBtn = card.querySelector('.quick-view');
    const wishlistBtn = card.querySelector('.wishlist-btn');
    const addToCartBtn = card.querySelector('.add-to-cart');
    
    if (quickViewBtn) {
      quickViewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = card.dataset.productId;
        openQuickView(productId);
      });
    }
    
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const product = getProductData(card);
        toggleWishlist(product);
        updateWishlistButton(wishlistBtn, product.id);
      });
    }
    
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const product = getProductData(card);
        addToCart(product);
      });
    }
    
    // Card click for product detail page
    card.addEventListener('click', () => {
      const productId = card.dataset.productId;
      if (productId) {
        window.location.href = `product-detail.html?id=${productId}`;
      }
    });
  });
}

function getProductData(card) {
  return {
    id: card.dataset.productId,
    name: card.querySelector('h3')?.textContent || '',
    price: parseFloat(card.querySelector('.price')?.textContent.replace('$', '') || 0),
    image: card.querySelector('img')?.src || '',
    brand: card.querySelector('.brand')?.textContent || ''
  };
}

function updateWishlistButton(button, productId) {
  const isInWishlist = wishlist.some(item => item.id === productId);
  button.classList.toggle('active', isInWishlist);
  button.innerHTML = isInWishlist ? '❤️' : '🤍';
}

// ================== QUICK VIEW MODAL ==================
function openQuickView(productId) {
  // Implement quick view modal functionality
  console.log('Quick view for product:', productId);
}

// ================== INITIALIZE ON LOAD ==================
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  updateWishlistCount();
  setupProductCardInteractions();
  
  // Initialize all sliders
  initializeSliders();
});

// ================== UTILITY FUNCTIONS ==================
function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// ================== LOADING STATES ==================
function showLoading() {
  document.body.classList.add('loading');
}

function hideLoading() {
  document.body.classList.remove('loading');
}

// ================== RESPONSIVE UTILITIES ==================
function isMobile() {
  return window.innerWidth <= 900;
}

function isTablet() {
  return window.innerWidth > 900 && window.innerWidth <= 1200;
}

function isDesktop() {
  return window.innerWidth > 1200;
}

// ================== SCROLL TO TOP ==================
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Create scroll to top button if needed
function createScrollToTopButton() {
  const scrollBtn = document.createElement('button');
  scrollBtn.innerHTML = '↑';
  scrollBtn.className = 'scroll-to-top';
  scrollBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--warm-blush);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 20px;
    z-index: 1000;
    display: none;
    transition: all 0.3s ease;
  `;
  
  scrollBtn.addEventListener('click', scrollToTop);
  document.body.appendChild(scrollBtn);
  
  window.addEventListener('scroll', () => {
    scrollBtn.style.display = window.pageYOffset > 300 ? 'block' : 'none';
  });
}



// Initialize scroll to top button
createScrollToTopButton();
