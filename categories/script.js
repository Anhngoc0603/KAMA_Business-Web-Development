document.addEventListener('DOMContentLoaded', () => {
    // === CÁC THÀNH PHẦN ===
    const fireworksContainer = document.querySelector('.fireworks-container');
    const menuToggler = document.getElementById('menu-toggler');
    const navbar = document.getElementById('navbar'); // Menu chính (NEW, COLLECTION...) / Container menu mobile
    const navLinks = navbar ? navbar.querySelectorAll(':scope > a:not(.shop-all)') : []; // Các link chính (NEW,...) - :scope chỉ tìm con trực tiếp
    const shopAllLink = navbar ? navbar.querySelector(':scope > .shop-all') : null; // Link 'CATEGORIES' - :scope chỉ tìm con trực tiếp
    const menuCategories = navbar ? navbar.querySelector('.menu-categories') : null; // Sub-menu Categories
    const backBtn = menuCategories ? menuCategories.querySelector('.back-btn') : null; // Nút Back
    const categoryItems = menuCategories ? menuCategories.querySelectorAll('.category') : []; // Các mục Face, Eyes, Lips...
    const announcementWrapper = document.getElementById('announcementWrapper');
    const searchIcon = document.querySelector('.search .icon');
    const searchInputHeader = document.querySelector('.search input');
    const productListPopup = document.getElementById('productListPopup'); // Popup cho brand kiểu cũ
    const productListPopupCloseBtn = productListPopup ? productListPopup.querySelector('.product-list-close') : null;

    // Search Overlay Elements (Tạo động)
    const searchOverlay = document.createElement('div');
    const searchInputOverlay = document.createElement('input');
    const closeSearchBtn = document.createElement('button');

    // === KHỞI TẠO HIỆU ỨNG PHÁO HOA ===
    if (fireworksContainer) {
        setupFireworks(); // Gọi hàm để tạo pháo hoa
    }

    // === XỬ LÝ THANH THÔNG BÁO ===
    if (announcementWrapper && announcementWrapper.children.length > 1) {
        startAnnouncementSlider(); // Gọi hàm chạy slider
    }

    // === XỬ LÝ MENU (PC & Mobile) ===
    setupMenuInteractions(); // Gọi hàm xử lý menu

    // === XỬ LÝ SEARCH OVERLAY ===
    setupSearchOverlay(); // Gọi hàm tạo và xử lý overlay

     // === XỬ LÝ POPUP PRODUCT LIST (cho Shop By Brand kiểu cũ - nếu còn dùng) ===
    setupProductListPopup(); // Gọi hàm xử lý popup


    // ============================================
    // === CÁC HÀM CHI TIẾT ===
    // ============================================

    function setupFireworks() {
        const colors = ['pink-1', 'pink-2', 'pink-3', 'pink-4'];
        const numParticles = window.innerWidth > 768 ? 60 : 30; // Giảm số lượng nữa
        if (!fireworksContainer) return; // Kiểm tra lại container
        // Xóa particle cũ nếu có (tránh tạo nhiều lần khi resize nhanh)
        while (fireworksContainer.firstChild) {
             fireworksContainer.removeChild(fireworksContainer.firstChild);
        }

        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.classList.add('firework-particle', colors[Math.floor(Math.random() * colors.length)]);
            particle.style.setProperty('--tx', `${Math.random() * 150 - 75}vw`);
            particle.style.setProperty('--ty', `${Math.random() * 150 - 75}vh`);
            particle.style.setProperty('--i', i);
            fireworksContainer.appendChild(particle);
            // Sử dụng animationend để xóa
            particle.addEventListener('animationend', function handler() {
                // Kiểm tra xem phần tử còn là con của container không trước khi xóa
                if (particle.parentNode === fireworksContainer) {
                    fireworksContainer.removeChild(particle);
                }
                particle.removeEventListener('animationend', handler); // Xóa listener sau khi chạy
            }, { once: true }); // Đảm bảo listener chỉ chạy 1 lần
        }
    }


    function startAnnouncementSlider() {
        let currentSlide = 0;
        const slides = announcementWrapper.children;
        const intervalTime = 3000;
        let slideInterval;

        function nextSlide() {
            // Kiểm tra slides có tồn tại không
             if (!slides || slides.length === 0) {
                 clearInterval(slideInterval);
                 return;
             }
            currentSlide = (currentSlide + 1) % slides.length;
            announcementWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
        }

        // Chỉ chạy nếu có nhiều hơn 1 slide
        if(slides.length > 1) {
           slideInterval = setInterval(nextSlide, intervalTime);
             // Optional: Pause on hover
             announcementWrapper.addEventListener('mouseenter', () => clearInterval(slideInterval));
             announcementWrapper.addEventListener('mouseleave', () => {
                 // Clear interval cũ trước khi tạo mới để tránh bị nhân đôi
                 clearInterval(slideInterval);
                 slideInterval = setInterval(nextSlide, intervalTime)
             });
        }
    }


    function setupMenuInteractions() {
        if (!navbar || !shopAllLink || !menuCategories) {
            console.error("Navbar elements not found!"); // Log lỗi nếu thiếu element
            return;
        }

        let pcMenuTimeoutId;
        let isMobile = window.innerWidth <= 900;

        // --- Desktop Functions ---
        const showPcMenu = () => {
            if (isMobile) return; // Không chạy trên mobile
            clearTimeout(pcMenuTimeoutId);
            // Đảm bảo display là block trước khi thay đổi opacity/transform
             menuCategories.style.display = 'block';
             // Dùng requestAnimationFrame để đảm bảo trình duyệt đã render display: block
             requestAnimationFrame(() => {
                 requestAnimationFrame(() => { // Thêm 1 frame nữa cho chắc
                    menuCategories.style.opacity = '1';
                    menuCategories.style.visibility = 'visible';
                    menuCategories.style.transform = 'translateY(0)';
                 });
             });
        };

        const hidePcMenu = () => {
             if (isMobile) return; // Không chạy trên mobile
            clearTimeout(pcMenuTimeoutId); // Xóa timeout hiện có nếu trỏ chuột ra nhanh
            pcMenuTimeoutId = setTimeout(() => {
                menuCategories.style.opacity = '0';
                menuCategories.style.visibility = 'hidden';
                menuCategories.style.transform = 'translateY(-10px)';
                 // Dùng 'transitionend' để set display: none sau khi transition xong
                 const transitionEndHandler = () => {
                     // Chỉ set display none nếu menu vẫn đang ẩn (opacity = 0)
                     if (menuCategories.style.opacity === '0') {
                         menuCategories.style.display = 'none';
                     }
                     menuCategories.removeEventListener('transitionend', transitionEndHandler);
                 };
                 // Xóa listener cũ trước khi thêm mới (phòng trường hợp event bị gọi nhiều lần)
                 menuCategories.removeEventListener('transitionend', transitionEndHandler);
                 menuCategories.addEventListener('transitionend', transitionEndHandler, { once: true });

            }, 150); // Giảm nhẹ delay
        };

        const setupDesktopListeners = () => {
             // Gắn listener cho PC
            shopAllLink.addEventListener('mouseenter', showPcMenu);
            shopAllLink.addEventListener('mouseleave', hidePcMenu);
            menuCategories.addEventListener('mouseenter', showPcMenu);
            menuCategories.addEventListener('mouseleave', hidePcMenu);
             // Xóa listener mobile nếu có
            shopAllLink.removeEventListener('click', handleMobileCategoryClick);
             if (backBtn) backBtn.removeEventListener('click', handleMobileBackClick);
             categoryItems.forEach(item => { // Xóa listener mobile cho category con
                 const header = item.querySelector('.category-header');
                 if(header && header.mobileClickHandler) { // Kiểm tra xem có lưu function không
                     header.removeEventListener('click', header.mobileClickHandler);
                     delete header.mobileClickHandler; // Xóa tham chiếu đã lưu
                 }
             });
             // Reset style mobile có thể còn sót lại
             if(backBtn) backBtn.style.display = 'none';
             navLinks.forEach(link => link.style.display = 'inline-block');
             shopAllLink.style.display = 'inline-block';
             menuCategories.classList.remove('active');
             menuCategories.style.position = 'absolute'; // Đảm bảo position cho desktop
             menuCategories.style.height = ''; // Reset height
             menuCategories.style.left = ''; // Reset left
             menuCategories.style.width = '100vw'; // Giữ lại width
             menuCategories.style.marginLeft = 'calc(-50vw + 50%)'; // Giữ lại margin
             categoryItems.forEach(cat => { // Reset category con
                cat.classList.remove('active');
                const productList = cat.querySelector('.product-list');
                if(productList) productList.style.display = 'block'; // Hiển thị list con trên desktop
             });
             closeMobileNav(); // Đảm bảo menu mobile đóng
        };

        const removeDesktopListeners = () => {
            shopAllLink.removeEventListener('mouseenter', showPcMenu);
            shopAllLink.removeEventListener('mouseleave', hidePcMenu);
            menuCategories.removeEventListener('mouseenter', showPcMenu);
            menuCategories.removeEventListener('mouseleave', hidePcMenu);
            clearTimeout(pcMenuTimeoutId);
            // Đảm bảo menu desktop ẩn khi chuyển sang mobile
             menuCategories.style.display = 'none';
             menuCategories.style.opacity = '0';
             menuCategories.style.visibility = 'hidden';
             menuCategories.style.transform = 'translateY(-10px)';
        };

        // --- Mobile Functions ---
        const handleMobileCategoryClick = (e) => {
             if (!isMobile) return; // Chỉ chạy trên mobile
            e.preventDefault();
            e.stopPropagation();
            menuCategories.classList.add('active'); // Hiện sub-menu (sẽ có animation CSS)
            if (backBtn) backBtn.style.display = 'flex';

            // Ẩn các link nav chính và link CATEGORIES
            navLinks.forEach(link => link.style.display = 'none');
            shopAllLink.style.display = 'none';
        };

        const handleMobileBackClick = (e) => {
             if (!isMobile) return; // Chỉ chạy trên mobile
            e.stopPropagation();

             // Thêm hiệu ứng trượt ra (nếu muốn)
             menuCategories.style.animation = 'slideOutRight 0.4s ease forwards';
             menuCategories.addEventListener('animationend', function handler(){
                 menuCategories.classList.remove('active');
                 if (backBtn) backBtn.style.display = 'none';
                 // Hiện lại các link nav chính
                 navLinks.forEach(link => link.style.display = 'block'); // Đổi thành block
                 shopAllLink.style.display = 'flex'; // Hiện lại link CATEGORIES (dùng flex)
                 // Đóng tất cả product list con
                 categoryItems.forEach(cat => {
                     cat.classList.remove('active');
                     const productList = cat.querySelector('.product-list');
                     if(productList) productList.style.display = 'none';
                 });
                  menuCategories.style.animation = ''; // Reset animation
                  menuCategories.removeEventListener('animationend', handler);
             }, {once: true});


        };
         // Định nghĩa hàm để có thể xóa listener sau này
         const toggleMobileSubList = (e) => {
              if (!isMobile) return;
              e.stopPropagation();
              const categoryItem = e.currentTarget.closest('.category'); // Lấy đúng thẻ .category cha
              if(!categoryItem) return;

              const isActive = categoryItem.classList.toggle('active');
              const productList = categoryItem.querySelector('.product-list');

               // Đóng các list khác
              categoryItems.forEach(otherItem => {
                  if (otherItem !== categoryItem && otherItem.classList.contains('active')) {
                      otherItem.classList.remove('active');
                      const otherList = otherItem.querySelector('.product-list');
                      if (otherList) otherList.style.display = 'none';
                  }
              });

              if (productList) {
                  // Dùng slideToggle đơn giản
                  if (isActive) {
                     productList.style.display = 'block'; // Hiện ra trước
                     // Có thể thêm hiệu ứng slideDown nếu muốn (cần thêm CSS/JS phức tạp hơn)
                  } else {
                     productList.style.display = 'none';
                     // Có thể thêm hiệu ứng slideUp
                  }
              }
          };


        const setupMobileListeners = () => {
             // Gắn listener cho mobile
             shopAllLink.addEventListener('click', handleMobileCategoryClick);
             if (backBtn) backBtn.addEventListener('click', handleMobileBackClick);

            // Xử lý click vào từng category header trên mobile
            categoryItems.forEach(item => {
                const header = item.querySelector('.category-header');
                if (header) {
                     // Lưu trữ tham chiếu đến hàm xử lý để có thể xóa sau này
                     header.mobileClickHandler = toggleMobileSubList;
                     header.addEventListener('click', header.mobileClickHandler);
                }
                 // Đảm bảo product list ẩn ban đầu trên mobile
                 const productList = item.querySelector('.product-list');
                 if(productList) productList.style.display = 'none';
            });
             // Đảm bảo menu desktop ẩn
             menuCategories.style.display = 'none'; // Sẽ được bật bởi class active
             menuCategories.style.opacity = '1'; // Reset opacity/visibility/transform cho mobile
             menuCategories.style.visibility = 'visible';
             menuCategories.style.transform = 'none';
              menuCategories.style.position = 'absolute'; // Vẫn là absolute để hiện trên navbar
              menuCategories.style.height = '100%'; // Chiếm hết chiều cao navbar mobile
              menuCategories.style.left = '0';
              menuCategories.style.width = '100%'; // Chiếm hết chiều rộng navbar mobile
              menuCategories.style.marginLeft = '0'; // Reset margin

        };

         const removeMobileListeners = () => {
            shopAllLink.removeEventListener('click', handleMobileCategoryClick);
             if (backBtn) backBtn.removeEventListener('click', handleMobileBackClick);
              categoryItems.forEach(item => {
                const header = item.querySelector('.category-header');
                 if (header && header.mobileClickHandler) {
                     header.removeEventListener('click', header.mobileClickHandler);
                     delete header.mobileClickHandler; // Quan trọng: Xóa tham chiếu đã lưu
                 }
            });
             menuCategories.classList.remove('active'); // Đảm bảo sub-menu đóng
         };


        // --- Initial Setup & Resize Handling ---
        const handleResize = () => {
            const newIsMobile = window.innerWidth <= 900;
            if (newIsMobile !== isMobile) {
                isMobile = newIsMobile;
                // Xóa hết listener cũ trước khi gắn mới
                removeDesktopListeners();
                removeMobileListeners();

                if (isMobile) {
                    setupMobileListeners();
                } else {
                    setupDesktopListeners();
                }
            }
             // Đóng menu mobile nếu resize ra màn hình lớn
            if (!isMobile) {
                closeMobileNav();
            }
        };

         // --- Toggle Mobile Nav ---
         const closeMobileNav = () => {
             if (navbar && navbar.classList.contains('active')) {
                 navbar.classList.remove('active');
                 document.body.style.overflow = ''; // Cho phép scroll lại
                  // Reset trạng thái sub-menu và các link con
                  if(menuCategories) menuCategories.classList.remove('active');
                  if(backBtn) backBtn.style.display = 'none';
                  navLinks.forEach(link => link.style.display = 'block'); // Hiện lại link chính (dùng block)
                  if(shopAllLink) shopAllLink.style.display = 'flex'; // Hiện lại CATEGORIES (dùng flex)
                   categoryItems.forEach(cat => { // Reset category con
                     cat.classList.remove('active');
                     const productList = cat.querySelector('.product-list');
                     if(productList) productList.style.display = 'none'; // Ẩn list con
                 });
             }
         };

         if (menuToggler) {
             menuToggler.addEventListener('click', (e) => {
                 e.stopPropagation();
                  if (!isMobile) return; // Chỉ hoạt động trên mobile

                 const isActive = navbar.classList.toggle('active');
                 document.body.style.overflow = isActive ? 'hidden' : '';
                 // Reset sub-menu khi đóng menu chính bằng nút toggler
                 if (!isActive && menuCategories && backBtn) { // Chỉ reset nếu đang đóng
                     menuCategories.classList.remove('active');
                     backBtn.style.display = 'none';
                     navLinks.forEach(link => link.style.display = 'block');
                     if(shopAllLink) shopAllLink.style.display = 'flex';
                      categoryItems.forEach(cat => {
                        cat.classList.remove('active');
                        const productList = cat.querySelector('.product-list');
                        if(productList) productList.style.display = 'none';
                    });
                 }
             });
         }


         // Click outside to close mobile nav
         document.addEventListener('click', (e) => {
             // Đảm bảo là mobile, menu đang mở, click không phải vào menu và không phải nút toggler
            if (isMobile && navbar && navbar.classList.contains('active') && !navbar.contains(e.target) && e.target !== menuToggler && !menuToggler.contains(e.target)) {
               closeMobileNav();
            }
         });


        // --- Chạy lần đầu ---
        if (isMobile) {
            setupMobileListeners();
        } else {
            setupDesktopListeners();
        }
        // Thêm debounce để tránh gọi resize quá nhiều lần
         let resizeTimer;
         window.addEventListener('resize', () => {
             clearTimeout(resizeTimer);
             resizeTimer = setTimeout(handleResize, 100); // Delay 100ms
         });
    }


    function setupSearchOverlay() {
        // Cấu hình Search Overlay
        searchOverlay.classList.add('search-overlay');
        searchInputOverlay.classList.add('search-input');
        searchInputOverlay.placeholder = 'Search here...';
        searchInputOverlay.setAttribute('type', 'search'); // Thêm type search
        closeSearchBtn.classList.add('close-search');
        closeSearchBtn.innerHTML = '&times;';
        closeSearchBtn.setAttribute('aria-label', 'Close search'); // Thêm aria-label

        searchOverlay.appendChild(searchInputOverlay);
        searchOverlay.appendChild(closeSearchBtn);
        document.body.appendChild(searchOverlay);

        const openSearch = (e) => {
            e.stopPropagation();
            searchOverlay.classList.add('active');
            // Delay focus một chút để transition kịp chạy
             setTimeout(() => searchInputOverlay.focus(), 50);
            document.body.style.overflow = 'hidden';
        };

        const closeSearch = () => {
             searchOverlay.classList.remove('active');
             document.body.style.overflow = '';
             // Xóa input khi đóng (tùy chọn)
             // searchInputOverlay.value = '';
             // if(searchInputHeader) searchInputHeader.value = '';
        };

        // Mở Search Overlay
        if (searchIcon) {
            searchIcon.addEventListener('click', openSearch);
        }
         // Mở khi click input header trên mobile
         if (searchInputHeader) {
              searchInputHeader.addEventListener('click', (e) => {
                   if (window.innerWidth <= 900) {
                       e.preventDefault();
                       openSearch(e);
                   }
              });
               searchInputHeader.addEventListener('focus', (e) => {
                    if (window.innerWidth <= 900) {
                        e.target.blur(); // Bỏ focus khỏi input header để tránh bàn phím ảo hiện rồi tắt
                        openSearch(e);
                    }
               });
         }

        // Đóng Search Overlay
        closeSearchBtn.addEventListener('click', closeSearch);
        searchOverlay.addEventListener('click', (e) => { // Đóng khi click nền mờ
            if (e.target === searchOverlay) {
                closeSearch();
            }
        });
         // Đóng bằng phím Escape
         document.addEventListener('keydown', (e) => {
             if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                 closeSearch();
             }
         });

        // Đồng bộ giá trị input (nếu cần)
        searchInputOverlay.addEventListener('input', () => {
            if (searchInputHeader) {
                searchInputHeader.value = searchInputOverlay.value;
            }
        });
    }

     function setupProductListPopup() {
        // --- Hàm để hiển thị popup sản phẩm (Dùng cho Shop By Brand kiểu cũ) ---
        window.showProductList = function(brandOrCategory) {
            if (!productListPopup) return;
            const title = productListPopup.querySelector('.product-list-title');
            const itemsContainer = productListPopup.querySelector('.product-list-items');
            if (!title || !itemsContainer) return;

            title.textContent = `${brandOrCategory} Products`;
            // --- Lấy dữ liệu sản phẩm (Ví dụ) ---
            const sampleProducts = [
              { name: `${brandOrCategory} Item 1`, price: '$25.99', img: 'https://via.placeholder.com/200x200/FADADD/6B4C3B?text=Item+1' },
              { name: `${brandOrCategory} Item 2`, price: '$30.50', img: 'https://via.placeholder.com/200x200/FADADD/6B4C3B?text=Item+2' },
              { name: `${brandOrCategory} Item 3`, price: '$22.00', img: 'https://via.placeholder.com/200x200/FADADD/6B4C3B?text=Item+3' },
              { name: `${brandOrCategory} Item 4`, price: '$35.75', img: 'https://via.placeholder.com/200x200/FADADD/6B4C3B?text=Item+4' }
            ];
            itemsContainer.innerHTML = sampleProducts.map(product => `
              <div class="product-list-item" onclick="window.location.href='#'">
                <img src="${product.img}" alt="${product.name}" loading="lazy"> <h4>${product.name}</h4>
                <p class="price">${product.price}</p>
              </div>
            `).join('');

            productListPopup.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        // --- Hàm để đóng popup sản phẩm ---
        window.closeProductList = function() {
            if (productListPopup) {
                productListPopup.classList.remove('active');
                document.body.style.overflow = '';
            }
        };

        // Đóng popup
        if (productListPopupCloseBtn) {
            productListPopupCloseBtn.addEventListener('click', closeProductList);
        }
        if (productListPopup) {
            productListPopup.addEventListener('click', (e) => {
                if (e.target === productListPopup) closeProductList();
            });
             document.addEventListener('keydown', (e) => { // Đóng bằng Escape
                 if (e.key === 'Escape' && productListPopup.classList.contains('active')) {
                     closeProductList();
                 }
             });
        }
     }

}); // Kết thúc DOMContentLoaded