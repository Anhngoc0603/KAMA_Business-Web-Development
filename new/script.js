<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
  // State
  let products = [];
  let filteredProducts = [];
  let currentPage = 1;
  const productsPerPage = 6;
  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

  // Elements
  const wrapper = document.getElementById('announcementWrapper');
  const slides = document.querySelectorAll('.announcement-slide');
  const menuToggler = document.getElementById('menu-toggler');
  const navbar = document.getElementById('navbar');
  const productsGrid = document.getElementById('products');
  const loadMoreButton = document.getElementById('load-more-button');
  const priceFilter = document.getElementById('price-filter');
  const ratingFilter = document.getElementById('rating-filter');
  const brandFilter = document.getElementById('brand-filter');
  const filterToggle = document.getElementById('filter-toggle');
  const filterMenu = document.getElementById('filter-menu');
  const categoryButtons = document.querySelectorAll('.category-btn');
  const aiButton = document.querySelector('.ai-btn');
  const cartIcon = document.querySelector('.header nav a img[alt="Shopping"]');
  const shopAll = document.querySelector('.shop-all');
  const menuCategories = document.querySelector('.menu-categories');
  const backBtn = document.querySelector('.back-btn');

  // Debug: Check if elements exist
  console.log('menuToggler:', menuToggler);
  console.log('navbar:', navbar);
  console.log('shopAll:', shopAll);
  console.log('menuCategories:', menuCategories);
  console.log('backBtn:', backBtn);
  console.log('productsGrid:', productsGrid);

  // Toggle Menu and Hover Support for Navbar
  if (menuToggler && navbar) {
    menuToggler.addEventListener('click', () => {
      const isActive = navbar.classList.contains('active');
      navbar.classList.toggle('active', !isActive);
      document.body.style.overflow = isActive ? '' : 'hidden';
      console.log('Menu toggled, navbar active:', navbar.classList.contains('active'));
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 900 && !navbar.contains(e.target) && !menuToggler.contains(e.target) && navbar.classList.contains('active')) {
        navbar.classList.remove('active');
        if (shopAll) shopAll.classList.remove('active');
        if (menuCategories) {
          menuCategories.classList.remove('active');
          // Đóng tất cả categories khi click ra ngoài
          document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
          });
        }
        document.body.style.overflow = '';
      }
    });
  } else {
    console.error('menuToggler or navbar not found');
  }

  // Desktop Hover Support for Categories Menu with Delay
  if (shopAll && menuCategories) {
    let timeoutId;
    
    const handleMouseEnter = () => {
      clearTimeout(timeoutId);
      console.log('Mouse entered categories menu');
      if (window.innerWidth > 900) {
        menuCategories.style.display = 'block';
      }
    };
    
    const handleMouseLeave = () => {
      console.log('Mouse left categories menu');
      timeoutId = setTimeout(() => {
        if (window.innerWidth > 900) {
          menuCategories.style.display = 'none';
        }
      }, 300); // Delay 300ms
    };

    // Initialize based on screen size
    if (window.innerWidth > 900) {
      shopAll.addEventListener('mouseenter', handleMouseEnter);
      shopAll.addEventListener('mouseleave', handleMouseLeave);
      menuCategories.addEventListener('mouseenter', handleMouseEnter);
      menuCategories.addEventListener('mouseleave', handleMouseLeave);
    }

    // Mobile Click Support for Categories - 2 BƯỚC
    shopAll.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        e.stopPropagation();
        const isActive = shopAll.classList.contains('active');
        shopAll.classList.toggle('active', !isActive);
        menuCategories.classList.toggle('active', !isActive);
        console.log('Categories toggled, menuCategories active:', menuCategories.classList.contains('active'));
        
        // Ensure back-btn is visible
        if (backBtn) {
          backBtn.style.display = menuCategories.classList.contains('active') ? 'flex' : 'none';
          console.log('Back button display:', backBtn.style.display);
        }
        
        // Reset all categories khi mở menu
        if (!isActive) {
          document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
          });
          loadCategoryProducts();
        }
      }
    });

    // Back Button for Mobile
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Back button clicked');
        if (window.innerWidth <= 900) {
          shopAll.classList.remove('active');
          menuCategories.classList.remove('active');
          backBtn.style.display = 'none';
          // Đóng tất cả categories khi back
          document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
          });
          console.log('menuCategories active after back:', menuCategories.classList.contains('active'));
        }
      });
    } else {
      console.error('backBtn not found');
    }

    // Xử lý Next Button và Category Header cho Mobile
    function setupMobileCategoryInteractions() {
      // Xử lý next button
      document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const category = btn.closest('.category');
          const isActive = category.classList.contains('active');
          
          // Đóng tất cả categories khác
          document.querySelectorAll('.category').forEach(cat => {
            if (cat !== category) {
              cat.classList.remove('active');
            }
          });
          
          // Toggle category hiện tại
          category.classList.toggle('active', !isActive);
        });
      });

      // Xử lý click vào category header (ngoài next button)
      document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', (e) => {
          if (!e.target.closest('.next-btn') && !e.target.closest('a')) {
            const category = header.closest('.category');
            const isActive = category.classList.contains('active');
            
            // Đóng tất cả categories khác
            document.querySelectorAll('.category').forEach(cat => {
              if (cat !== category) {
                cat.classList.remove('active');
              }
            });
            
            // Toggle category hiện tại
            category.classList.toggle('active', !isActive);
          }
        });
      });
    }

    // Gọi hàm setup interactions
    setupMobileCategoryInteractions();

    // Update on resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        // Desktop behavior
        shopAll.addEventListener('mouseenter', handleMouseEnter);
        shopAll.addEventListener('mouseleave', handleMouseLeave);
        menuCategories.addEventListener('mouseenter', handleMouseEnter);
        menuCategories.addEventListener('mouseleave', handleMouseLeave);
        shopAll.classList.remove('active');
        menuCategories.classList.remove('active');
        menuCategories.style.display = 'none';
        if (backBtn) backBtn.style.display = 'none';
        // Đóng tất cả categories trên desktop
        document.querySelectorAll('.category').forEach(cat => {
          cat.classList.remove('active');
        });
      } else {
        // Mobile behavior
        shopAll.removeEventListener('mouseenter', handleMouseEnter);
        shopAll.removeEventListener('mouseleave', handleMouseLeave);
        menuCategories.removeEventListener('mouseenter', handleMouseEnter);
        menuCategories.removeEventListener('mouseleave', handleMouseLeave);
        menuCategories.style.display = 'none';
        
        // Ensure back-btn is visible when menuCategories is active
        if (menuCategories.classList.contains('active')) {
          menuCategories.style.display = 'flex';
          if (backBtn) {
            backBtn.style.display = 'flex';
            console.log('Resize: Back button set to display: flex');
          }
        }
      }
    }, { passive: true });
  } else {
    console.error('shopAll or menuCategories not found');
  }

  // Announcement Bar
  let index = 0;
  function showSlide(i) {
    if (wrapper) {
      wrapper.style.transform = `translateX(-${i * 100}%)`;
    }
  }
  
  if (slides.length > 0) {
    setInterval(() => {
      index = (index + 1) % slides.length;
      showSlide(index);
    }, 5000);
  }

  // Helper Functions
  const formatCurrency = (price) => '$' + price.toFixed(2);
  const showMessage = (message, type = 'info') => {
    const colors = {
      success: '#16a34a',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: ${colors[type]}; color: white;
      padding: 12px 20px; border-radius: 8px; z-index: 2000; animation: slideInRight 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // Load Products and Populate Categories Menu
  fetch('../new/products.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load products');
      return response.json();
    })
    .then(data => {
      products = data;
      filteredProducts = [...products];
      console.log('Products loaded:', products.length);
      loadCategoryProducts();
      renderProducts();
      setupFilters();
      setupLoadMore();
      setupViewDetails();
      setupSearch();
      setupAICombo();
      setupCart();
    })
    .catch(error => {
      console.error('Error loading products:', error);
      showMessage('Failed to load products. Please check the products.json file.', 'error');
    });

  // Load Dynamic Products into Categories Menu
  function loadCategoryProducts() {
    const categoryMappings = {
      'Face': ['Blush', 'Primer', 'Concealer', 'Finish Powder', 'Contour & Highlighter', 'Makeup Cleansing Balm', 'Shop All Face'],
      'Eyes': ['Makeup Palette', 'Eyebrow Enhancer', 'Mascara', 'Eyeliner', 'Shop All Eyes'],
      'Lips': ['Lip Cream', 'Lipstick', 'Lip Gloss', 'Lip Lacquer', 'Lip Glaze', 'Lip Jelly', 'Lip Mask', 'Shop All Lips']
    };

    const productLists = document.querySelectorAll('.menu-categories .product-list');
    productLists.forEach(list => {
      const category = list.closest('.category').dataset.category;
      const subItems = categoryMappings[category] || [];
      
      console.log('Rendering category:', category, 'with items:', subItems);
      list.innerHTML = subItems.map((item, index) => {
        if (item.includes('Shop All')) {
          return `<li class="shop-all-link">${item}</li>`;
        }
        return `<li data-subtype="${item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}">${item}</li>`;
      }).join('');

      list.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', (e) => {
          e.stopPropagation();
          if (li.classList.contains('shop-all-link')) {
            filteredProducts = products.filter(p => p.category === category);
            currentPage = 1;
            renderProducts();
            if (window.innerWidth <= 900) {
              navbar.classList.remove('active');
              shopAll.classList.remove('active');
              menuCategories.classList.remove('active');
              document.body.style.overflow = '';
            }
          } else {
            const subtype = li.dataset.subtype;
            filteredProducts = products.filter(p => 
              p.category === category && 
              (p.name.toLowerCase().includes(subtype) || (p.subtype && p.subtype.toLowerCase() === subtype))
            );
            currentPage = 1;
            renderProducts();
            if (window.innerWidth <= 900) {
              navbar.classList.remove('active');
              shopAll.classList.remove('active');
              menuCategories.classList.remove('active');
              document.body.style.overflow = '';
            }
          }
        });
      });
    });
  }

  // Render Products
  function renderProducts() {
    if (!productsGrid) {
      console.error('productsGrid not found');
      return;
    }
    
    productsGrid.innerHTML = '';
    if (!filteredProducts || filteredProducts.length === 0) {
      productsGrid.innerHTML = '<p style="text-align: center; color: var(--branch-brown);">No products found or failed to load.</p>';
      console.log('No products to render:', filteredProducts);
      return;
    }
    
    const start = 0;
    const end = currentPage * productsPerPage;
    const pageProducts = filteredProducts.slice(start, end);
    
    console.log('Rendering products:', pageProducts.length, 'from', start, 'to', end);
    
    if (pageProducts.length === 0) {
      productsGrid.innerHTML = '<p style="text-align: center; color: var(--branch-brown);">No products found.</p>';
      return;
    }

    pageProducts.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.innerHTML = `
        <div style="position: relative;">
          <img src="${product.image}" alt="${product.name}" class="product-img">
          <img src="${product.image}" alt="${product.name}" class="product-img hover-image">
        </div>
        <div class="info">
          <h3>${product.name}</h3>
          <p class="meta">Brand: ${product.brand}</p>
          <p class="meta">Category: ${product.category}</p>
          <div class="actions">
            <span class="price">${formatCurrency(product.price)}</span>
            <span class="rating">${product.rating} <span class="star">★</span></span>
          </div>
          <div class="buttons">
            <button class="btn-outline view-details" data-id="${product.id}">View Details</button>
            <button class="btn-primary add-to-cart" data-id="${product.id}">Add to Cart</button>
          </div>
        </div>
      `;
      productsGrid.appendChild(productCard);
    });

    if (loadMoreButton) {
      loadMoreButton.style.display = end >= filteredProducts.length ? 'none' : 'block';
    }
  }

  // Filters
  function setupFilters() {
    if (categoryButtons.length > 0) {
      categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          categoryButtons.forEach(b => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          const category = btn.dataset.category;
          applyFilters(category);
        });
      });
    }

    if (filterToggle && filterMenu) {
      filterToggle.addEventListener('click', () => {
        filterMenu.classList.toggle('show');
      });
    }

    [priceFilter, ratingFilter, brandFilter].forEach(filter => {
      filter?.addEventListener('change', () => applyFilters());
    });
  }

  function applyFilters(category = document.querySelector('.category-btn.is-selected')?.dataset.category || 'All') {
    filteredProducts = [...products];

    if (category !== 'All') {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (priceFilter?.value === 'low-high') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (priceFilter?.value === 'high-low') {
      filteredProducts.sort((a, b) => b.price - a.price);
    }

    if (ratingFilter?.value !== 'default') {
      const minRating = parseFloat(ratingFilter.value);
      filteredProducts = filteredProducts.filter(p => p.rating >= minRating);
    }

    if (brandFilter?.value !== 'default') {
      filteredProducts = filteredProducts.filter(p => p.brand === brandFilter.value);
    }

    currentPage = 1;
    renderProducts();
  }

  // Search
  function setupSearch() {
    const searchInput = document.querySelector('.search input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        filteredProducts = products.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.brand.toLowerCase().includes(query) || 
          (p.description && p.description.toLowerCase().includes(query))
        );
        currentPage = 1;
        renderProducts();
      });
    }
  }

  // Load More
  function setupLoadMore() {
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', () => {
        currentPage++;
        renderProducts();
      });
    }
  }

  // View Details Redirect
  function setupViewDetails() {
    productsGrid.addEventListener('click', (e) => {
      if (e.target.classList.contains('view-details')) {
        const id = parseInt(e.target.dataset.id);
        const product = products.find(p => p.id === id);
        if (product) {
          window.location.href = `../new/view_product/view_new.html?id=${id}`;
        }
      }
    });
  }

  // Cart Functionality
  function setupCart() {
    function addToCart(productId, quantity = 1) {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const existingItem = cartItems.find(item => item.id === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cartItems.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity
        });
      }

      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      showMessage(`${product.name} added to cart!`, 'success');
    }

    productsGrid.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart')) {
        const id = parseInt(e.target.dataset.id);
        addToCart(id, 1);
      }
    });

    if (cartIcon) {
      cartIcon.parentElement.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '../cart/cart.html';
      });
    } else {
      console.log('Cart icon not found. Check HTML structure: .header nav a img[alt="Shopping"]');
    }
  }
  function setupAICombo() {
    if (aiButton) {
      aiButton.addEventListener('click', () => {
        const combo = generateAICombo();
        showMessage(`Suggested Combo: ${combo.join(', ')}`, 'info');
      });
    }
  }
  function generateAICombo() {
    const categories = ['Face', 'Eyes', 'Lips'];
    const combo = categories.map(category => {
      const categoryProducts = products.filter(p => p.category === category);
      return categoryProducts[Math.floor(Math.random() * categoryProducts.length)]?.name || 'No product';
    });
    return combo;
  }
=======
document.addEventListener('DOMContentLoaded', () => {
  // State
  let products = [];
  let filteredProducts = [];
  let currentPage = 1;
  const productsPerPage = 6;
  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

  // Elements
  const wrapper = document.getElementById('announcementWrapper');
  const slides = document.querySelectorAll('.announcement-slide');
  const menuToggler = document.getElementById('menu-toggler');
  const navbar = document.getElementById('navbar');
  const productsGrid = document.getElementById('products');
  const loadMoreButton = document.getElementById('load-more-button');
  const priceFilter = document.getElementById('price-filter');
  const ratingFilter = document.getElementById('rating-filter');
  const brandFilter = document.getElementById('brand-filter');
  const filterToggle = document.getElementById('filter-toggle');
  const filterMenu = document.getElementById('filter-menu');
  const categoryButtons = document.querySelectorAll('.category-btn');
  const aiButton = document.querySelector('.ai-btn');
  const cartIcon = document.querySelector('.header nav a img[alt="Shopping"]');
  const shopAll = document.querySelector('.shop-all');
  const menuCategories = document.querySelector('.menu-categories');
  const backBtn = document.querySelector('.back-btn');

  // Debug: Check if elements exist
  console.log('menuToggler:', menuToggler);
  console.log('navbar:', navbar);
  console.log('shopAll:', shopAll);
  console.log('menuCategories:', menuCategories);
  console.log('backBtn:', backBtn);
  console.log('productsGrid:', productsGrid);

  // Toggle Menu and Hover Support for Navbar
  if (menuToggler && navbar) {
    menuToggler.addEventListener('click', () => {
      const isActive = navbar.classList.contains('active');
      navbar.classList.toggle('active', !isActive);
      document.body.style.overflow = isActive ? '' : 'hidden';
      console.log('Menu toggled, navbar active:', navbar.classList.contains('active'));
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 900 && !navbar.contains(e.target) && !menuToggler.contains(e.target) && navbar.classList.contains('active')) {
        navbar.classList.remove('active');
        if (shopAll) shopAll.classList.remove('active');
        if (menuCategories) {
          menuCategories.classList.remove('active');
          // Đóng tất cả categories khi click ra ngoài
          document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
          });
        }
        document.body.style.overflow = '';
      }
    });
  } else {
    console.error('menuToggler or navbar not found');
  }

  // Desktop Hover Support for Categories Menu with Delay
  if (shopAll && menuCategories) {
    let timeoutId;
    
    const handleMouseEnter = () => {
      clearTimeout(timeoutId);
      console.log('Mouse entered categories menu');
      if (window.innerWidth > 900) {
        menuCategories.style.display = 'block';
      }
    };
    
    const handleMouseLeave = () => {
      console.log('Mouse left categories menu');
      timeoutId = setTimeout(() => {
        if (window.innerWidth > 900) {
          menuCategories.style.display = 'none';
        }
      }, 300); // Delay 300ms
    };

    // Initialize based on screen size
    if (window.innerWidth > 900) {
      shopAll.addEventListener('mouseenter', handleMouseEnter);
      shopAll.addEventListener('mouseleave', handleMouseLeave);
      menuCategories.addEventListener('mouseenter', handleMouseEnter);
      menuCategories.addEventListener('mouseleave', handleMouseLeave);
    }

    // Mobile Click Support for Categories - 2 BƯỚC
    shopAll.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        e.stopPropagation();
        const isActive = shopAll.classList.contains('active');
        shopAll.classList.toggle('active', !isActive);
        menuCategories.classList.toggle('active', !isActive);
        console.log('Categories toggled, menuCategories active:', menuCategories.classList.contains('active'));
        
        // Ensure back-btn is visible
        if (backBtn) {
          backBtn.style.display = menuCategories.classList.contains('active') ? 'flex' : 'none';
          console.log('Back button display:', backBtn.style.display);
        }
        
        // Reset all categories khi mở menu
        if (!isActive) {
          document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
          });
          loadCategoryProducts();
        }
      }
    });

    // Back Button for Mobile
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Back button clicked');
        if (window.innerWidth <= 900) {
          shopAll.classList.remove('active');
          menuCategories.classList.remove('active');
          backBtn.style.display = 'none';
          // Đóng tất cả categories khi back
          document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
          });
          console.log('menuCategories active after back:', menuCategories.classList.contains('active'));
        }
      });
    } else {
      console.error('backBtn not found');
    }

    // Xử lý Next Button và Category Header cho Mobile
    function setupMobileCategoryInteractions() {
      // Xử lý next button
      document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const category = btn.closest('.category');
          const isActive = category.classList.contains('active');
          
          // Đóng tất cả categories khác
          document.querySelectorAll('.category').forEach(cat => {
            if (cat !== category) {
              cat.classList.remove('active');
            }
          });
          
          // Toggle category hiện tại
          category.classList.toggle('active', !isActive);
        });
      });

      // Xử lý click vào category header (ngoài next button)
      document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', (e) => {
          if (!e.target.closest('.next-btn') && !e.target.closest('a')) {
            const category = header.closest('.category');
            const isActive = category.classList.contains('active');
            
            // Đóng tất cả categories khác
            document.querySelectorAll('.category').forEach(cat => {
              if (cat !== category) {
                cat.classList.remove('active');
              }
            });
            
            // Toggle category hiện tại
            category.classList.toggle('active', !isActive);
          }
        });
      });
    }

    // Gọi hàm setup interactions
    setupMobileCategoryInteractions();

    // Update on resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        // Desktop behavior
        shopAll.addEventListener('mouseenter', handleMouseEnter);
        shopAll.addEventListener('mouseleave', handleMouseLeave);
        menuCategories.addEventListener('mouseenter', handleMouseEnter);
        menuCategories.addEventListener('mouseleave', handleMouseLeave);
        shopAll.classList.remove('active');
        menuCategories.classList.remove('active');
        menuCategories.style.display = 'none';
        if (backBtn) backBtn.style.display = 'none';
        // Đóng tất cả categories trên desktop
        document.querySelectorAll('.category').forEach(cat => {
          cat.classList.remove('active');
        });
      } else {
        // Mobile behavior
        shopAll.removeEventListener('mouseenter', handleMouseEnter);
        shopAll.removeEventListener('mouseleave', handleMouseLeave);
        menuCategories.removeEventListener('mouseenter', handleMouseEnter);
        menuCategories.removeEventListener('mouseleave', handleMouseLeave);
        menuCategories.style.display = 'none';
        
        // Ensure back-btn is visible when menuCategories is active
        if (menuCategories.classList.contains('active')) {
          menuCategories.style.display = 'flex';
          if (backBtn) {
            backBtn.style.display = 'flex';
            console.log('Resize: Back button set to display: flex');
          }
        }
      }
    }, { passive: true });
  } else {
    console.error('shopAll or menuCategories not found');
  }

  // Announcement Bar
  let index = 0;
  function showSlide(i) {
    if (wrapper) {
      wrapper.style.transform = `translateX(-${i * 100}%)`;
    }
  }
  
  if (slides.length > 0) {
    setInterval(() => {
      index = (index + 1) % slides.length;
      showSlide(index);
    }, 5000);
  }

  // Helper Functions
  const formatCurrency = (price) => '$' + price.toFixed(2);
  const showMessage = (message, type = 'info') => {
    const colors = {
      success: '#16a34a',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: ${colors[type]}; color: white;
      padding: 12px 20px; border-radius: 8px; z-index: 2000; animation: slideInRight 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // Load Products and Populate Categories Menu
  fetch('../new/products.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load products');
      return response.json();
    })
    .then(data => {
      products = data;
      filteredProducts = [...products];
      console.log('Products loaded:', products.length);
      loadCategoryProducts();
      renderProducts();
      setupFilters();
      setupLoadMore();
      setupViewDetails();
      setupSearch();
      setupAICombo();
      setupCart();
    })
    .catch(error => {
      console.error('Error loading products:', error);
      showMessage('Failed to load products. Please check the products.json file.', 'error');
    });

  // Load Dynamic Products into Categories Menu
  function loadCategoryProducts() {
    const categoryMappings = {
      'Face': ['Blush', 'Primer', 'Concealer', 'Finish Powder', 'Contour & Highlighter', 'Makeup Cleansing Balm', 'Shop All Face'],
      'Eyes': ['Makeup Palette', 'Eyebrow Enhancer', 'Mascara', 'Eyeliner', 'Shop All Eyes'],
      'Lips': ['Lip Cream', 'Lipstick', 'Lip Gloss', 'Lip Lacquer', 'Lip Glaze', 'Lip Jelly', 'Lip Mask', 'Shop All Lips']
    };

    const productLists = document.querySelectorAll('.menu-categories .product-list');
    productLists.forEach(list => {
      const category = list.closest('.category').dataset.category;
      const subItems = categoryMappings[category] || [];
      
      console.log('Rendering category:', category, 'with items:', subItems);
      list.innerHTML = subItems.map((item, index) => {
        if (item.includes('Shop All')) {
          return `<li class="shop-all-link">${item}</li>`;
        }
        return `<li data-subtype="${item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}">${item}</li>`;
      }).join('');

      list.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', (e) => {
          e.stopPropagation();
          if (li.classList.contains('shop-all-link')) {
            filteredProducts = products.filter(p => p.category === category);
            currentPage = 1;
            renderProducts();
            if (window.innerWidth <= 900) {
              navbar.classList.remove('active');
              shopAll.classList.remove('active');
              menuCategories.classList.remove('active');
              document.body.style.overflow = '';
            }
          } else {
            const subtype = li.dataset.subtype;
            filteredProducts = products.filter(p => 
              p.category === category && 
              (p.name.toLowerCase().includes(subtype) || (p.subtype && p.subtype.toLowerCase() === subtype))
            );
            currentPage = 1;
            renderProducts();
            if (window.innerWidth <= 900) {
              navbar.classList.remove('active');
              shopAll.classList.remove('active');
              menuCategories.classList.remove('active');
              document.body.style.overflow = '';
            }
          }
        });
      });
    });
  }

  // Render Products
  function renderProducts() {
    if (!productsGrid) {
      console.error('productsGrid not found');
      return;
    }
    
    productsGrid.innerHTML = '';
    if (!filteredProducts || filteredProducts.length === 0) {
      productsGrid.innerHTML = '<p style="text-align: center; color: var(--branch-brown);">No products found or failed to load.</p>';
      console.log('No products to render:', filteredProducts);
      return;
    }
    
    const start = 0;
    const end = currentPage * productsPerPage;
    const pageProducts = filteredProducts.slice(start, end);
    
    console.log('Rendering products:', pageProducts.length, 'from', start, 'to', end);
    
    if (pageProducts.length === 0) {
      productsGrid.innerHTML = '<p style="text-align: center; color: var(--branch-brown);">No products found.</p>';
      return;
    }

    pageProducts.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.innerHTML = `
        <div style="position: relative;">
          <img src="${product.image}" alt="${product.name}" class="product-img">
          <img src="${product.image}" alt="${product.name}" class="product-img hover-image">
        </div>
        <div class="info">
          <h3>${product.name}</h3>
          <p class="meta">Brand: ${product.brand}</p>
          <p class="meta">Category: ${product.category}</p>
          <div class="actions">
            <span class="price">${formatCurrency(product.price)}</span>
            <span class="rating">${product.rating} <span class="star">★</span></span>
          </div>
          <div class="buttons">
            <button class="btn-outline view-details" data-id="${product.id}">View Details</button>
            <button class="btn-primary add-to-cart" data-id="${product.id}">Add to Cart</button>
          </div>
        </div>
      `;
      productsGrid.appendChild(productCard);
    });

    if (loadMoreButton) {
      loadMoreButton.style.display = end >= filteredProducts.length ? 'none' : 'block';
    }
  }

  // Filters
  function setupFilters() {
    if (categoryButtons.length > 0) {
      categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          categoryButtons.forEach(b => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          const category = btn.dataset.category;
          applyFilters(category);
        });
      });
    }

    if (filterToggle && filterMenu) {
      filterToggle.addEventListener('click', () => {
        filterMenu.classList.toggle('show');
      });
    }

    [priceFilter, ratingFilter, brandFilter].forEach(filter => {
      filter?.addEventListener('change', () => applyFilters());
    });
  }

  function applyFilters(category = document.querySelector('.category-btn.is-selected')?.dataset.category || 'All') {
    filteredProducts = [...products];

    if (category !== 'All') {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (priceFilter?.value === 'low-high') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (priceFilter?.value === 'high-low') {
      filteredProducts.sort((a, b) => b.price - a.price);
    }

    if (ratingFilter?.value !== 'default') {
      const minRating = parseFloat(ratingFilter.value);
      filteredProducts = filteredProducts.filter(p => p.rating >= minRating);
    }

    if (brandFilter?.value !== 'default') {
      filteredProducts = filteredProducts.filter(p => p.brand === brandFilter.value);
    }

    currentPage = 1;
    renderProducts();
  }

  // Search
  function setupSearch() {
    const searchInput = document.querySelector('.search input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        filteredProducts = products.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.brand.toLowerCase().includes(query) || 
          (p.description && p.description.toLowerCase().includes(query))
        );
        currentPage = 1;
        renderProducts();
      });
    }
  }

  // Load More
  function setupLoadMore() {
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', () => {
        currentPage++;
        renderProducts();
      });
    }
  }

  // View Details Redirect
  function setupViewDetails() {
    productsGrid.addEventListener('click', (e) => {
      if (e.target.classList.contains('view-details')) {
        const id = parseInt(e.target.dataset.id);
        const product = products.find(p => p.id === id);
        if (product) {
          window.location.href = `../new/view_product/view_new.html?id=${id}`;
        }
      }
    });
  }

  // Cart Functionality
  function setupCart() {
    function addToCart(productId, quantity = 1) {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const existingItem = cartItems.find(item => item.id === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cartItems.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity
        });
      }

      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      showMessage(`${product.name} added to cart!`, 'success');
    }

    productsGrid.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart')) {
        const id = parseInt(e.target.dataset.id);
        addToCart(id, 1);
      }
    });

    if (cartIcon) {
      cartIcon.parentElement.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '../cart/cart.html';
      });
    } else {
      console.log('Cart icon not found. Check HTML structure: .header nav a img[alt="Shopping"]');
    }
  }

  // AI Combo Suggestion
  function setupAICombo() {
    if (aiButton) {
      aiButton.addEventListener('click', () => {
        const combo = generateAICombo();
        showMessage(`Suggested Combo: ${combo.join(', ')}`, 'info');
      });
    }
  }

  function generateAICombo() {
    const categories = ['Face', 'Eyes', 'Lips'];
    const combo = categories.map(category => {
      const categoryProducts = products.filter(p => p.category === category);
      return categoryProducts[Math.floor(Math.random() * categoryProducts.length)]?.name || 'No product';
    });
    return combo;
  }
>>>>>>> c520dcef0b06d211d50cb50060c0d90b6af6e350
});