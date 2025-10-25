document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Website initialized');
    
    // ==================== FIREWORKS ANIMATION ====================
    const fireworksContainer = document.querySelector('.fireworks-container');
    if (fireworksContainer) {
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
    }

    // ==================== ANNOUNCEMENT SLIDER - 4 CÂU ====================
    const announcementWrapper = document.getElementById('announcementWrapper');
    if (announcementWrapper) {
        let currentSlide = 0;
        const slides = document.querySelectorAll('.announcement-slide');
        const totalSlides = slides.length;
        
        console.log(`📢 Announcement: ${totalSlides} slides loaded`);
        
        // FIX: Đảm bảo slides không bị dính chữ
        slides.forEach(slide => {
            slide.style.lineHeight = '40px';
            slide.style.height = '40px';
            slide.style.display = 'flex';
            slide.style.alignItems = 'center';
            slide.style.justifyContent = 'center';
            slide.style.flex = '0 0 25%';
        });
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            const translateX = -currentSlide * 25;
            announcementWrapper.style.transform = `translateX(${translateX}%)`;
            
            console.log(`📢 Slide ${currentSlide + 1}/${totalSlides}: ${slides[currentSlide].textContent}`);
        }
        
        // Khởi tạo slide đầu tiên
        announcementWrapper.style.transform = 'translateX(0)';
        
        // Auto slide mỗi 3 giây
        setInterval(nextSlide, 3000);
    }

    // ==================== FLOATING ELEMENTS ====================
    const floatingElements = ['🌸', '✨', '💖'];
    floatingElements.forEach((emoji, index) => {
        const element = document.createElement('div');
        element.className = 'floating-element';
        element.innerHTML = emoji;
        element.style.fontSize = `${40 + index * 10}px`;
        document.body.appendChild(element);
    });

    // ==================== HEADER SCROLL EFFECT ====================
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ==================== SCROLL TO TOP BUTTON ====================
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '↑';
    scrollButton.className = 'scroll-to-top';
    document.body.appendChild(scrollButton);

    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollButton.style.display = 'block';
        } else {
            scrollButton.style.display = 'none';
        }
    });

    // ==================== MOBILE NAVIGATION - COMPLETELY FIXED ====================
    const menuToggler = document.getElementById('menu-toggler');
    const navbar = document.getElementById('navbar');
    const shopAllBtn = document.querySelector('.shop-all');
    const menuCategories = document.querySelector('.menu-categories');
    const backBtn = document.querySelector('.back-btn');

    console.log('🔍 Mobile Nav Debug:', { 
        menuToggler: !!menuToggler, 
        navbar: !!navbar, 
        shopAllBtn: !!shopAllBtn,
        menuCategories: !!menuCategories,
        backBtn: !!backBtn,
        windowWidth: window.innerWidth,
        isMobile: window.innerWidth <= 900
    });

    // FIX: Mobile Menu Toggler - HOÀN TOÀN MỚI
    if (menuToggler) {
        menuToggler.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📱 Menu toggler CLICKED');
            
            if (!navbar) {
                console.error('❌ Navbar element not found!');
                return;
            }

            const isCurrentlyActive = navbar.classList.contains('active');
            
            // Đóng categories nếu đang mở
            if (menuCategories && menuCategories.classList.contains('active')) {
                console.log('📱 Closing categories menu');
                menuCategories.classList.remove('active');
                if (backBtn) backBtn.style.display = 'none';
            }
            
            // Toggle navbar
            if (isCurrentlyActive) {
                navbar.classList.remove('active');
                document.body.style.overflow = '';
                console.log('📱 Navbar CLOSED');
            } else {
                navbar.classList.add('active');
                document.body.style.overflow = 'hidden';
                console.log('📱 Navbar OPENED');
            }
        });

        // Đóng menu khi click ra ngoài
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 900 && 
                navbar && 
                navbar.classList.contains('active') &&
                !navbar.contains(e.target) && 
                !menuToggler.contains(e.target) &&
                !(menuCategories && menuCategories.contains(e.target))) {
                
                console.log('📱 Closing navbar - outside click');
                navbar.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // FIX: Shop All Categories - MOBILE ONLY
    if (shopAllBtn && menuCategories) {
        // Desktop hover behavior
        const handleMouseEnter = () => {
            if (window.innerWidth > 900) {
                menuCategories.style.display = 'block';
                setTimeout(() => {
                    menuCategories.classList.add('active');
                }, 10);
                
                // DESKTOP: Tự động hiện tất cả product lists
                document.querySelectorAll('.category').forEach(category => {
                    category.classList.add('active');
                });
            }
        };

        const handleMouseLeave = () => {
            if (window.innerWidth > 900) {
                menuCategories.classList.remove('active');
                // Ẩn tất cả product lists khi rời chuột
                document.querySelectorAll('.category').forEach(category => {
                    category.classList.remove('active');
                });
                setTimeout(() => {
                    menuCategories.style.display = 'none';
                }, 300);
            }
        };

        shopAllBtn.addEventListener('click', function(e) {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🛍️ Shop All clicked on mobile');
                
                const isCategoriesActive = menuCategories.classList.contains('active');
                
                // Đóng navbar nếu đang mở
                if (navbar && navbar.classList.contains('active')) {
                    navbar.classList.remove('active');
                }
                
                // Toggle categories menu
                if (!isCategoriesActive) {
                    menuCategories.style.display = 'flex';
                    setTimeout(() => {
                        menuCategories.classList.add('active');
                    }, 10);
                    if (backBtn) backBtn.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                    console.log('🛍️ Categories menu OPENED');
                    
                    // MOBILE: Ẩn tất cả product lists khi mở menu
                    document.querySelectorAll('.category').forEach(category => {
                        category.classList.remove('active');
                    });
                    
                    // Áp dụng CSS không scroll
                    applyMobileListStyles();
                } else {
                    menuCategories.classList.remove('active');
                    if (backBtn) backBtn.style.display = 'none';
                    document.body.style.overflow = '';
                    console.log('🛍️ Categories menu CLOSED');
                    
                    setTimeout(() => {
                        menuCategories.style.display = 'none';
                    }, 300);
                }
            }
        });

        // Áp dụng hover behavior cho desktop
        if (window.innerWidth > 900) {
            shopAllBtn.addEventListener('mouseenter', handleMouseEnter);
            shopAllBtn.addEventListener('mouseleave', handleMouseLeave);
            menuCategories.addEventListener('mouseenter', handleMouseEnter);
            menuCategories.addEventListener('mouseleave', handleMouseLeave);
        }

        // Resize handler
        window.addEventListener('resize', function() {
            if (window.innerWidth > 900) {
                // Desktop
                shopAllBtn.addEventListener('mouseenter', handleMouseEnter);
                shopAllBtn.addEventListener('mouseleave', handleMouseLeave);
                menuCategories.addEventListener('mouseenter', handleMouseEnter);
                menuCategories.addEventListener('mouseleave', handleMouseLeave);
                
                // Reset mobile states
                menuCategories.classList.remove('active');
                menuCategories.style.display = 'none';
                if (backBtn) backBtn.style.display = 'none';
                document.body.style.overflow = '';
            } else {
                // Mobile
                shopAllBtn.removeEventListener('mouseenter', handleMouseEnter);
                shopAllBtn.removeEventListener('mouseleave', handleMouseLeave);
                menuCategories.removeEventListener('mouseenter', handleMouseEnter);
                menuCategories.removeEventListener('mouseleave', handleMouseLeave);
                menuCategories.style.display = 'none';
            }
        });
    }

    // Back button functionality
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔙 Back button clicked');
            
            if (menuCategories) {
                menuCategories.classList.remove('active');
            }
            if (backBtn) backBtn.style.display = 'none';
            document.body.style.overflow = '';
            
            // Đóng tất cả categories
            document.querySelectorAll('.category').forEach(cat => {
                cat.classList.remove('active');
            });
            
            setTimeout(() => {
                if (menuCategories) {
                    menuCategories.style.display = 'none';
                }
            }, 300);
        });
    }

    // FIX: Áp dụng CSS không scroll cho mobile lists
    function applyMobileListStyles() {
        if (window.innerWidth <= 900) {
            const productLists = document.querySelectorAll('.product-list');
            productLists.forEach(list => {
                list.style.maxHeight = 'none';
                list.style.overflow = 'visible';
                list.style.height = 'auto';
            });
            
            const categoriesWrapper = document.querySelector('.categories-wrapper');
            if (categoriesWrapper) {
                categoriesWrapper.style.maxHeight = 'none';
                categoriesWrapper.style.overflow = 'visible';
            }
        }
    }

    // Category interactions - MOBILE ONLY
    function setupCategoryInteractions() {
        const nextButtons = document.querySelectorAll('.next-btn');
        
        nextButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                // Chỉ hoạt động trên mobile
                if (window.innerWidth <= 900) {
                    const category = this.closest('.category');
                    const isActive = category.classList.contains('active');
                    
                    // Đóng các category khác
                    document.querySelectorAll('.category').forEach(cat => {
                        if (cat !== category) {
                            cat.classList.remove('active');
                        }
                    });
                    
                    category.classList.toggle('active', !isActive);
                    console.log('📱 Next button clicked');
                    
                    // Áp dụng CSS không scroll
                    applyMobileListStyles();
                }
            });
        });

        // Category header click - chỉ toggle trên mobile
        document.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', function(e) {
                e.stopPropagation();
                // Chỉ hoạt động trên mobile, không phải desktop
                if (window.innerWidth <= 900 && !e.target.closest('.next-btn')) {
                    const category = this.closest('.category');
                    const isActive = category.classList.contains('active');
                    
                    // Đóng các category khác
                    document.querySelectorAll('.category').forEach(cat => {
                        if (cat !== category) {
                            cat.classList.remove('active');
                        }
                    });
                    
                    category.classList.toggle('active', !isActive);
                    
                    // Áp dụng CSS không scroll
                    applyMobileListStyles();
                }
            });
        });
    }

    setupCategoryInteractions();

    // Resize handler - Áp dụng mobile styles khi resize
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 900) {
            applyMobileListStyles();
        }
    });

    // Áp dụng mobile styles ngay khi load
    if (window.innerWidth <= 900) {
        applyMobileListStyles();
    }

    // ==================== SEARCH FUNCTIONALITY ====================
    const searchIcon = document.querySelector('.search .icon');
    const searchInput = document.querySelector('.search input');
    
    if (searchIcon) {
        // Tạo search overlay
        const searchOverlay = document.createElement('div');
        searchOverlay.className = 'search-overlay';
        searchOverlay.innerHTML = `
            <div class="search-wrapper">
                <input type="text" class="search-input" placeholder="Search for...">
                <button class="close-search">&times;</button>
            </div>
        `;
        document.body.appendChild(searchOverlay);

        const searchInputOverlay = searchOverlay.querySelector('.search-input');
        const closeSearch = searchOverlay.querySelector('.close-search');

        searchIcon.addEventListener('click', function() {
            searchOverlay.classList.add('active');
            searchInputOverlay.focus();
            document.body.style.overflow = 'hidden';
        });

        closeSearch.addEventListener('click', function() {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Đồng bộ input
        if (searchInput) {
            searchInputOverlay.addEventListener('input', function() {
                searchInput.value = this.value;
            });
        }
    }

    // ==================== PRODUCT GALLERY ====================
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('main-image');
    
    if (thumbnails && mainImage) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                changeMainImage(this.src, this);
            });
        });
    }

    // ==================== QUANTITY SELECTOR ====================
    const decreaseBtn = document.getElementById('decrease-qty');
    const increaseBtn = document.getElementById('increase-qty');
    const quantityInput = document.getElementById('quantity');
    
    if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
                quantityInput.style.transform = 'scale(1.05)';
                setTimeout(() => quantityInput.style.transform = 'scale(1)', 150);
            }
        });

        increaseBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value < 999) {
                quantityInput.value = value + 1;
                quantityInput.style.transform = 'scale(1.05)';
                setTimeout(() => quantityInput.style.transform = 'scale(1)', 150);
            }
        });

        quantityInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) {
                this.value = 1;
            } else if (value > 999) {
                this.value = 999;
            }
        });
    }

    // ==================== ADD TO CART ====================
    const addToCartBtn = document.getElementById('addToCartBtn');
    let isAddingToCart = false;
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (isAddingToCart) return;
            isAddingToCart = true;
            
            console.log('🛒 Add to cart clicked');
            
            // Hiệu ứng button
            this.classList.add('added');
            const originalText = this.innerHTML;
            this.innerHTML = '✓ ADDED TO CART';
            
            // Tạo popup chỉ MỘT lần
            const existingPopup = document.querySelector('.added-cart-popup');
            if (existingPopup) {
                existingPopup.remove();
            }
            
            const popup = document.createElement('div');
            popup.className = 'added-cart-popup active';
            popup.innerHTML = `
                <div class="added-cart-wrapper">
                    <button class="added-cart-close">&times;</button>
                    <h2 class="added-cart-title">Added to Cart!</h2>
                    <p class="added-cart-product">Dior Forever Foundation</p>
                </div>
            `;
            
            document.body.appendChild(popup);
            
            // Close button functionality
            const closeBtn = popup.querySelector('.added-cart-close');
            closeBtn.addEventListener('click', function() {
                popup.classList.remove('active');
                setTimeout(() => {
                    if (popup.parentNode) {
                        popup.remove();
                    }
                }, 300);
            });
            
            // Close on overlay click
            popup.addEventListener('click', function(e) {
                if (e.target === popup) {
                    popup.classList.remove('active');
                    setTimeout(() => {
                        if (popup.parentNode) {
                            popup.remove();
                        }
                    }, 300);
                }
            });
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                addToCartBtn.classList.remove('added');
                addToCartBtn.innerHTML = originalText;
                isAddingToCart = false;
                
                if (popup && popup.classList.contains('active')) {
                    popup.classList.remove('active');
                    setTimeout(() => {
                        if (popup.parentNode) {
                            popup.remove();
                        }
                    }, 300);
                }
            }, 3000);
        });
    }

    // ==================== FOOTER INTERACTIONS ====================
    // Footer social buttons
    document.querySelectorAll('.footer-social button').forEach(btn => {
        btn.addEventListener('click', function() {
            const platform = this.getAttribute('aria-label');
            console.log(`Social media clicked: ${platform}`);
        });
    });

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            if (email) {
                console.log('Newsletter signup:', email);
                alert('Thank you for subscribing!');
                this.reset();
            }
        });
    }

    // ==================== GLOBAL FUNCTIONS ====================
    window.changeMainImage = function(src, thumb) {
        const mainImage = document.getElementById('main-image');
        if (mainImage) {
            mainImage.style.opacity = '0.5';
            setTimeout(() => {
                mainImage.src = src;
                mainImage.style.opacity = '1';
            }, 200);
            
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        }
    };

    window.changeQuantity = function(delta) {
        const qtyInput = document.getElementById('quantity');
        let newVal = parseInt(qtyInput.value) + delta;
        if (newVal >= 1) {
            qtyInput.value = newVal;
            qtyInput.style.transform = 'scale(1.05)';
            setTimeout(() => qtyInput.style.transform = 'scale(1)', 150);
        }
    };

    window.addToCart = function() {
        if (addToCartBtn) {
            addToCartBtn.click();
        }
    };

    // ==================== ERROR HANDLING ====================
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
            console.warn('Image failed to load:', e.target.src);
            e.target.style.display = 'none';
        }
    }, true);

    console.log('✅ All JavaScript initialized successfully');
});