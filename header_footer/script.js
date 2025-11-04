// ================== ANNOUNCEMENT ==================
const wrapper1 = document.getElementById('announcementWrapper');
const announcement = document.querySelectorAll('.announcement-slide');
let indexAnnouncement = 0;

function showAnnouncement(i) {
  wrapper1.style.transform = `translateX(-${i * 100}%)`;
}

// Tự động chuyển sau 5s
setInterval(() => {
  indexAnnouncement = (indexAnnouncement + 1) % announcement.length;
  showAnnouncement(indexAnnouncement);
}, 5000);

document.addEventListener('DOMContentLoaded', () => {
  // ================== MENU TOGGLE ==================
  const menuToggler = document.getElementById('menu-toggler');
  const navbar = document.getElementById('navbar');
  const shopAll = document.querySelector('.shop-all');
  const menuCategories = document.querySelector('.menu-categories');
  const backBtn = document.querySelector('.back-btn');
  const nextButtons = document.querySelectorAll('.next-btn');
  const searchIcon = document.querySelector('.search .icon');
  const searchInput = document.getElementById('search-input-main');

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
  // Mobile search functionality
  if (searchIcon && searchInput) {
    if (window.innerWidth <= 900) {
      // Mobile: icon acts as search trigger
      searchIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        searchInput.focus();
      });
    } else {
      // Desktop: normal search behavior
      searchInput.style.display = 'block';
    }

    // Search input functionality
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (window.filterProducts) {
        window.filterProducts(query);
      }
    });
  }

  // ================== SLIDER FUNCTIONALITY ==================
  initializeSliders();
});

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
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

function showAddToCartMessage() {
  // Create or show add to cart message
  let message = document.querySelector('.add-to-cart-message');
  if (!message) {
    message = document.createElement('div');
    message.className = 'add-to-cart-message';
    message.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: var(--warm-blush);
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      z-index: 10000;
      transition: all 0.3s ease;
      font-family: 'Playfair Display', serif;
    `;
    document.body.appendChild(message);
  }
  
  message.textContent = 'Product added to cart!';
  message.style.display = 'block';
  message.style.opacity = '1';
  
  setTimeout(() => {
    message.style.opacity = '0';
    setTimeout(() => {
      message.style.display = 'none';
    }, 300);
  }, 2000);
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