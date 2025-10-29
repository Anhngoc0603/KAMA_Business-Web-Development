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
  // Elements for header 
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
      }, 3000);
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
});

const searchIcon = document.querySelector('.search img.icon');
const searchOverlay = document.getElementById('searchOverlay');
const searchWrapper = searchOverlay.querySelector('.search-wrapper');
const closeBtn = searchOverlay.querySelector('.close-search');

function openSearch() {
  searchOverlay.classList.add('active');
}

function closeSearchOverlay() {
  searchOverlay.classList.remove('active');
}

// ✅ mở overlay
searchIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  openSearch();
});

// ✅ click nút X để đóng
closeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  closeSearchOverlay();
});

// ✅ Không đóng khi click bên trong hộp search
searchWrapper.addEventListener('click', (e) => e.stopPropagation());

// ✅ đóng khi click bất cứ đâu ngoài search-wrapper
document.addEventListener('click', () => {
  if (searchOverlay.classList.contains('active')) {
    closeSearchOverlay();
  }
});
