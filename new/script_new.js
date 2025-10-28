document.addEventListener('DOMContentLoaded', async () => {
  // Fetch data from product.json
  fetch('product.json')
    .then(response => response.json())
    .then(data => {
      const newProducts = data.products.filter(product => product.isNew); // Lọc các sản phẩm mới

      let productsHTML = '';
      newProducts.forEach(product => {
        productsHTML += `
          <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="product-info">
              <h3>${product.name}</h3>
              <p>${product.brand} • ${product.category}</p>
              <p>${product.description}</p>
              <span class="price">$${product.price.toFixed(2)}</span>
              <div class="rating">★★★★☆ (${product.rating})</div>
              <button class="btn-primary">View Details</button>
            </div>
          </div>
        `;
      });

      // Chèn các sản phẩm mới vào trong container
      document.getElementById('new-products-container').innerHTML = productsHTML;
    })
    .catch(error => console.error('Error loading products:', error));
  // Fetch and load header
  try {
    const headerResponse = await fetch('../header_footer/header.html');
    const headerHTML = await headerResponse.text();
    document.getElementById('header-placeholder').innerHTML = headerHTML;
    // Re-init header logic sau khi chèn (vì script trong HTML không chạy)
    initHeader();
  } catch (error) {
    console.error('Failed to load header:', error);
  }

  // Fetch and load footer
  try {
    const footerResponse = await fetch('../header_footer/footer.html');
    const footerHTML = await footerResponse.text();
    document.getElementById('footer-placeholder').innerHTML = footerHTML;
  } catch (error) {
    console.error('Failed to load footer:', error);
  }

  // Fireworks Animation (giữ nguyên)
  const fireworksContainer = document.querySelector('.fireworks-container');
  const colors = ['pink-1', 'pink-2', 'pink-3', 'pink-4'];
  for (let i = 0; i < 120; i++) {
    const particle = document.createElement('div');
    particle.classList.add('firework-particle', colors[Math.floor(Math.random() * colors.length)]);
    particle.style.setProperty('--tx', `${Math.random() * 200 - 100}vw`);
    particle.style.setProperty('--ty', `${Math.random() * 200 - 100}vh`);
    particle.style.setProperty('--i', i);
    fireworksContainer.appendChild(particle);
    particle.addEventListener('animationend', () => {
      particle.remove();
    });
  }

  // State (giữ nguyên)
  let products = [];
  let filteredProducts = [];
  let displayedProducts = [];
  let currentPage = 1;
  const productsPerPage = 8;
  let isFiltered = false;

  // Category Mappings (giữ nguyên)
  const categoryMappings = {
    'Face': ['Blush', 'Primer', 'Concealer', 'Finish Powder', 'Contour & Highlighter', 'Makeup Cleansing Balm', 'Shop All Face'],
    'Eyes': ['Makeup Palette', 'Eyebrow Enhancer', 'Mascara', 'Eyeliner', 'Shop All Eyes'],
    'Lips': ['Lip Cream', 'Lipstick', 'Lip Gloss', 'Lip Lacquer', 'Lip Glaze', 'Lip Jelly', 'Lip Mask', 'Shop All Lips']
  };

  // Elements (loại bỏ header elements, giữ main)
  const filterToggle = document.getElementById('filter-toggle');
  const filterMenu = document.getElementById('filter-menu');
  const priceFilter = document.getElementById('price-filter');
  const ratingFilter = document.getElementById('rating-filter');
  const brandFilter = document.getElementById('brand-filter');
  const loadMoreButton = document.getElementById('load-more-button');
  const productsGrid = document.getElementById('products');
  const aiButton = document.querySelector('.ai-btn');

  // Setup AI Combo popup (giữ nguyên)
  const comboPopup = document.createElement('div');
  comboPopup.classList.add('combo-popup');
  const comboWrapper = document.createElement('div');
  comboWrapper.classList.add('combo-wrapper');
  const comboTitle = document.createElement('h3');
  comboTitle.classList.add('combo-title');
  comboTitle.textContent = 'Your AI Combo Suggestion';
  const comboItems = document.createElement('div');
  comboItems.classList.add('combo-items');
  const comboClose = document.createElement('button');
  comboClose.classList.add('combo-close');
  comboClose.innerHTML = '&times;';
  comboWrapper.appendChild(comboTitle);
  comboWrapper.appendChild(comboItems);
  comboWrapper.appendChild(comboClose);
  comboPopup.appendChild(comboWrapper);
  document.body.appendChild(comboPopup);

  // Setup Added to Cart popup (giữ nguyên)
  const addedCartPopup = document.createElement('div');
  addedCartPopup.classList.add('added-cart-popup');
  const addedCartWrapper = document.createElement('div');
  addedCartWrapper.classList.add('added-cart-wrapper');
  const addedCartTitle = document.createElement('h3');
  addedCartTitle.classList.add('added-cart-title');
  addedCartTitle.textContent = 'Added to Cart Successfully';
  const addedCartProduct = document.createElement('p');
  addedCartProduct.classList.add('added-cart-product');
  const addedCartClose = document.createElement('button');
  addedCartClose.classList.add('added-cart-close');
  addedCartClose.innerHTML = '&times;';
  addedCartWrapper.appendChild(addedCartTitle);
  addedCartWrapper.appendChild(addedCartProduct);
  addedCartWrapper.appendChild(addedCartClose);
  addedCartPopup.appendChild(addedCartWrapper);
  document.body.appendChild(addedCartPopup);

  // Add to Cart function (giữ nguyên)
  function addToCart(product, quantity) {
    try {
      let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      quantity = Math.max(1, Math.min(99, parseInt(quantity) || 1));
      const existingItem = cartItems.find(item => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cartItems.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
          quantity: quantity
        });
      }
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      console.log('Cart updated:', cartItems);
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  }
  

  // Added to Cart Popup (giữ nguyên)
  function showAddedCartPopup(productName, quantity) {
    addedCartProduct.textContent = `${productName} x ${quantity}`;
    addedCartPopup.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      addedCartPopup.classList.remove('active');
      document.body.style.overflow = '';
    }, 3000);
  }

  addedCartClose.addEventListener('click', () => {
    addedCartPopup.classList.remove('active');
    document.body.style.overflow = '';
  });

  addedCartPopup.addEventListener('click', (e) => {
    if (e.target === addedCartPopup) {
      addedCartPopup.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Fetch products (giữ nguyên)
  async function loadProducts() {
    try {
      const response = await fetch('./products.json');
      if (!response.ok) throw new Error('Failed to load products.json');
      products = await response.json();
      filteredProducts = [...products];
      displayedProducts = [];
      currentPage = 1;
      renderProducts();
      updateSearchResultCount();
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback (giữ nguyên)
      products = [
        {
          id: 1,
          name: 'Blush',
          brand: 'Dior',
          category: 'Face',
          price: 45.99,
          rating: 4.8,
          description: 'A rosy blush for a natural glow.',
          image: 'https://images.unsplash.com/photo-1608248116868-1947b0d0c663',
          hoverImage: 'https://images.unsplash.com/photo-1608248116868-1947b0d0c663?auto=format&fit=crop&q=80'
        },
        {
          id: 2,
          name: 'Mascara',
          brand: 'Lancôme',
          category: 'Eyes',
          price: 32.50,
          rating: 4.5,
          description: 'Volumizing mascara for bold lashes.',
          image: 'https://images.unsplash.com/photo-1571781920869-a5e2f6c3a2f0',
          hoverImage: 'https://images.unsplash.com/photo-1571781920869-a5e2f6c3a2f0?auto=format&fit=crop&q=80'
        },
        {
          id: 3,
          name: 'Lip Gloss',
          brand: 'Fenty Beauty',
          category: 'Lips',
          price: 19.99,
          rating: 4.7,
          description: 'Shiny lip gloss with lasting color.',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
          hoverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80'
        }
      ];
      filteredProducts = [...products];
      displayedProducts = [];
      currentPage = 1;
      renderProducts();
      updateSearchResultCount();
    }
  }

  // AI Combo Suggestion (cập nhật để dùng query từ search overlay)
  if (aiButton) {
    aiButton.addEventListener('click', () => {
      const faceProduct = products.filter(p => p.category === 'Face')[Math.floor(Math.random() * products.filter(p => p.category === 'Face').length)];
      const eyesProduct = products.filter(p => p.category === 'Eyes')[Math.floor(Math.random() * products.filter(p => p.category === 'Eyes').length)];
      const lipsProduct = products.filter(p => p.category === 'Lips')[Math.floor(Math.random() * products.filter(p => p.category === 'Lips').length)];
      const combo = [faceProduct, eyesProduct, lipsProduct].filter(p => p);

      comboItems.innerHTML = combo.map(product => `
        <div class="combo-item">
          <img src="${product.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c';">
          <h4>${product.name}</h4>
          <p class="meta">${product.brand} • ${product.category}</p>
          <p class="price">$${product.price.toFixed(2)}</p>
          <p class="rating">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))} (${product.rating})</p>
        </div>
      `).join('');

      comboPopup.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    comboClose.addEventListener('click', () => {
      comboPopup.classList.remove('active');
      document.body.style.overflow = '';
    });

    comboPopup.addEventListener('click', (e) => {
      if (e.target === comboPopup) {
        comboPopup.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Global filterProducts for search from header
  window.filterProducts = (query = '') => {
    const category = filterMenu.querySelector('.category-btn.is-selected')?.dataset.category || 'All';
    const priceSort = priceFilter.value;
    const ratingSort = ratingFilter.value;
    const brand = brandFilter.value;

    filteredProducts = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query);
      const matchesCategory = category === 'All' || product.category === category;
      const matchesBrand = brand === 'default' || product.brand === brand;
      const matchesRating = ratingSort === 'default' || (
        ratingSort === '5' && product.rating === 5 ||
        ratingSort === '4.5' && product.rating >= 4.5 ||
        ratingSort === '4' && product.rating >= 4
      );
      return matchesSearch && matchesCategory && matchesBrand && matchesRating;
    });

    if (priceSort !== 'default') {
      filteredProducts.sort((a, b) => {
        return priceSort === 'low-high' ? a.price - b.price : b.price - a.price;
      });
    }

    isFiltered = query || category !== 'All' || priceSort !== 'default' || ratingSort !== 'default' || brand !== 'default';
    currentPage = 1;
    displayedProducts = [];
    renderProducts();
    updateSearchResultCount();
  };

  if (filterToggle && filterMenu) {
    filterToggle.addEventListener('click', () => {
      filterMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!filterToggle.contains(e.target) && !filterMenu.contains(e.target)) {
        filterMenu.classList.remove('show');
      }
    });

    filterMenu.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterMenu.querySelectorAll('.category-btn').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        window.filterProducts();
      });
    });
  }

  function renderProducts() {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const productsToShow = filteredProducts.slice(start, end);

    displayedProducts = [...displayedProducts, ...productsToShow];

    productsGrid.innerHTML = displayedProducts.map(product => `
      <div class="product-card">
        <img src="${product.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'}" alt="${product.name}" class="product-img" onerror="this.src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c';">
        <img src="${product.hoverImage || product.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'}" alt="${product.name} hover" class="product-img hover-image" onerror="this.src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c';">
        <div class="info">
          <h3>${product.name}</h3>
          <p class="meta">${product.brand} • ${product.category}</p>
          <p>${product.description}</p>
          <div class="actions">
            <span class="price">$${product.price.toFixed(2)}</span>
            <span class="rating">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))} (${product.rating})</span>
          </div>
          <div class="buttons">
            <input type="number" class="quantity-input" value="1" min="1" max="99">
            <button class="btn-outline" data-id="${product.id}"></button>
            <button class="btn-primary" onclick="window.location.href='./view_product/view_new.html?id=${product.id}'">View Details</button>
          </div>
        </div>
      </div>
    `).join('');

    // Add event listeners for Add to Cart buttons
    document.querySelectorAll('.btn-outline').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        const product = products.find(p => p.id == productId);
        const quantityInput = btn.closest('.buttons').querySelector('.quantity-input');
        const quantity = parseInt(quantityInput.value) || 1;
        if (product) {
          addToCart(product, quantity);
          showAddedCartPopup(product.name, quantity);
        }
      });
    });

    loadMoreButton.style.display = end < filteredProducts.length ? 'block' : 'none';
  }

  function updateSearchResultCount() {
    const resultCount = document.querySelector('.search-result-count') || document.createElement('div');
    resultCount.classList.add('search-result-count');
    if (isFiltered) {
      resultCount.textContent = `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`;
      resultCount.classList.add('active');
      if (!document.querySelector('.search-result-count')) {
        productsGrid.insertAdjacentElement('beforebegin', resultCount);
      }
    } else {
      resultCount.classList.remove('active');
    }
  }

  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', () => {
      currentPage++;
      renderProducts();
    });
  }

  if (priceFilter) priceFilter.addEventListener('change', () => window.filterProducts());
  if (ratingFilter) ratingFilter.addEventListener('change', () => window.filterProducts());
  if (brandFilter) brandFilter.addEventListener('change', () => window.filterProducts());

  loadProducts();

  // ===== HEADER INIT FUNCTION (copy từ script trong header.html) =====
  function initHeader() {
    // Elements for header (sau khi chèn)
    const menuToggler = document.getElementById('menu-toggler');
    const navbar = document.getElementById('navbar');
    const shopAll = document.querySelector('.shop-all');
    const menuCategories = document.querySelector('.menu-categories');
    const backBtn = document.querySelector('.back-btn');
    const nextButtons = document.querySelectorAll('.next-btn');
    const announcementWrapper = document.getElementById('announcementWrapper');
    const searchIcon = document.querySelector('.search .icon');
    const searchInput = document.getElementById('search-input-main');
    const searchOverlay = document.createElement('div');
    const searchWrapper = document.createElement('div');
    const searchInputOverlay = document.createElement('input');
    const closeSearch = document.createElement('button');

    // Setup search overlay
    searchOverlay.classList.add('search-overlay');
    searchWrapper.classList.add('search-wrapper');
    searchInputOverlay.classList.add('search-input');
    searchInputOverlay.placeholder = 'Search for...';
    closeSearch.classList.add('close-search');
    closeSearch.innerHTML = '&times;';
    searchWrapper.appendChild(searchInputOverlay);
    searchWrapper.appendChild(closeSearch);
    searchOverlay.appendChild(searchWrapper);
    document.body.appendChild(searchOverlay);

    // Debounce function for resize
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
          navbar.classList.remove('active');
          navbar.style.transform = 'translateY(-100%)';
          navbar.style.opacity = '0';
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
          restoreScroll();
        }
      });
    }

    // Toggle categories
    if (shopAll && menuCategories) {
      let timeoutId;

      const handleMouseEnter = () => {
        clearTimeout(timeoutId);
        if (window.innerWidth > 900) {
          menuCategories.style.display = 'block';
          menuCategories.style.opacity = '1';
          menuCategories.style.transform = 'translateY(0)';
          // Hiển thị tất cả product-list trên PC
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
            // Ẩn tất cả product-list khi rời chuột
            document.querySelectorAll('.category').forEach(cat => {
              cat.classList.remove('active');
              const productList = cat.querySelector('.product-list');
              if (productList) productList.style.display = 'none';
            });
          }
        }, 300);
      };

      if (window.innerWidth > 900) {
        shopAll.addEventListener('mouseenter', handleMouseEnter);
        shopAll.addEventListener('mouseleave', handleMouseLeave);
        menuCategories.addEventListener('mouseenter', handleMouseEnter);
        menuCategories.addEventListener('mouseleave', handleMouseLeave);
      }

      shopAll.addEventListener('click', (e) => {
        if (window.innerWidth <= 900) {
          e.preventDefault();
          e.stopPropagation();
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

      if (backBtn) {
        backBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          shopAll.classList.remove('active');
          menuCategories.classList.remove('active');
          menuCategories.style.display = 'none';
          menuCategories.style.opacity = '0';
          menuCategories.style.transform = 'translateY(-10px)';
          backBtn.style.display = 'none';
          document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
            const productList = cat.querySelector('.product-list');
            if (productList) productList.style.display = 'none';
          });
          restoreScroll();
        });
      }

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

        document.querySelectorAll('.category-header').forEach(header => {
          header.addEventListener('click', (e) => {
            if (!e.target.closest('.next-btn') && !e.target.closest('a')) {
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
          });
        });
      }

      setupMobileCategoryInteractions();

      // Debounce resize event
      const handleResize = debounce(() => {
        if (window.innerWidth > 900) {
          shopAll.addEventListener('mouseenter', handleMouseEnter);
          shopAll.addEventListener('mouseleave', handleMouseLeave);
          menuCategories.addEventListener('mouseenter', handleMouseEnter);
          menuCategories.addEventListener('mouseleave', handleMouseLeave);
          shopAll.classList.remove('active');
          menuCategories.classList.remove('active');
          menuCategories.style.display = 'none';
          menuCategories.style.opacity = '0';
          menuCategories.style.transform = 'translateY(-10px)';
          if (backBtn) backBtn.style.display = 'none';
          document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
            const productList = cat.querySelector('.product-list');
            if (productList) productList.style.display = 'none';
          });
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
          // Đảm bảo product-list ẩn trên mobile khi resize
          document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
            const productList = cat.querySelector('.product-list');
            if (productList) productList.style.display = 'none';
          });
        }
      }, 100);

      window.addEventListener('resize', handleResize);
    }

    function restoreScroll() {
      document.body.style.overflow = '';
    }

    // Announcement slide
    if (announcementWrapper) {
      let currentSlide = 0;
      const slides = announcementWrapper.children;
      let slideInterval;

      function startSlide() {
        slideInterval = setInterval(() => {
          currentSlide = (currentSlide + 1) % slides.length;
          announcementWrapper.style.transition = 'transform 0.8s ease-in-out';
          announcementWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
        }, 2000);
      }

      startSlide();

      announcementWrapper.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
      });

      announcementWrapper.addEventListener('mouseleave', () => {
        startSlide();
      });
    }

    // Search overlay
    if (searchIcon && searchInput) {
      searchIcon.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        searchInputOverlay.focus();
        document.body.style.overflow = 'hidden';
      });

      closeSearch.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });

      searchInputOverlay.addEventListener('input', () => {
        const query = searchInputOverlay.value.toLowerCase();
        searchInput.value = query;
        if (window.filterProducts) window.filterProducts(query);
      });
    }
  }
});