document.addEventListener('DOMContentLoaded', () => {
    // === CÁC THÀNH PHẦN ===
    const menuToggler = document.getElementById('menu-toggler');
    const navbar = document.getElementById('navbar'); // Menu chính (NEW, COLLECTION...) / Container menu mobile
    const navLinks = navbar ? navbar.querySelectorAll(':scope > a:not(.shop-all)') : []; // Các link chính (NEW,...) - :scope chỉ tìm con trực tiếp
    const shopAllLink = navbar ? navbar.querySelector(':scope > .shop-all') : null; // Link 'CATEGORIES' - :scope chỉ tìm con trực tiếp
    const menuCategories = navbar ? navbar.querySelector('.menu-categories') : null; // Sub-menu Categories
    const backBtn = menuCategories ? menuCategories.querySelector('.back-btn') : null; // Nút Back
    const categoryItems = menuCategories ? menuCategories.querySelectorAll('.category') : []; // Các mục Face, Eyes, Lips...
    
    // === XỬ LÝ MENU (Desktop) ===
    setupMenuInteractions(); // Gọi hàm xử lý menu

    // ============================================
    // === CÁC HÀM CHI TIẾT ===
    // ============================================

    function setupMenuInteractions() {
        if (!navbar || !shopAllLink || !menuCategories) {
            console.error("Navbar elements not found!"); // Log lỗi nếu thiếu element
            return;
        }

        let isDesktop = window.innerWidth > 900;

        // --- Desktop Functions ---
        const showPcMenu = () => {
            if (!isDesktop) return; // Không chạy trên mobile
            menuCategories.style.display = 'block';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => { // Thêm 1 frame nữa cho chắc
                    menuCategories.style.opacity = '1';
                    menuCategories.style.visibility = 'visible';
                    menuCategories.style.transform = 'translateY(0)';
                });
            });
        };

        const hidePcMenu = () => {
            if (!isDesktop) return; // Không chạy trên mobile
            menuCategories.style.opacity = '0';
            menuCategories.style.visibility = 'hidden';
            menuCategories.style.transform = 'translateY(-10px)';
        };

        const setupDesktopListeners = () => {
            shopAllLink.addEventListener('mouseenter', showPcMenu);
            shopAllLink.addEventListener('mouseleave', hidePcMenu);
            menuCategories.addEventListener('mouseenter', showPcMenu);
            menuCategories.addEventListener('mouseleave', hidePcMenu);

            categoryItems.forEach(item => {
                const header = item.querySelector('.category-header');
                if (header) {
                    header.addEventListener('click', () => {
                        item.classList.toggle('active');
                        const productList = item.querySelector('.product-list');
                        if (productList) {
                            productList.style.display = productList.style.display === 'block' ? 'none' : 'block';
                        }
                    });
                }
            });
        };

        const removeDesktopListeners = () => {
            shopAllLink.removeEventListener('mouseenter', showPcMenu);
            shopAllLink.removeEventListener('mouseleave', hidePcMenu);
            menuCategories.removeEventListener('mouseenter', showPcMenu);
            menuCategories.removeEventListener('mouseleave', hidePcMenu);

            categoryItems.forEach(item => {
                const header = item.querySelector('.category-header');
                if (header) {
                    header.removeEventListener('click', () => {
                        item.classList.toggle('active');
                        const productList = item.querySelector('.product-list');
                        if (productList) {
                            productList.style.display = productList.style.display === 'block' ? 'none' : 'block';
                        }
                    });
                }
            });
        };

        // --- Đảm bảo hoạt động tốt khi thay đổi kích thước ---
        const handleResize = () => {
            const newIsDesktop = window.innerWidth > 900;
            if (newIsDesktop !== isDesktop) {
                isDesktop = newIsDesktop;
                if (isDesktop) {
                    setupDesktopListeners();
                } else {
                    removeDesktopListeners();
                }
            }
        };

        window.addEventListener('resize', handleResize);

        // Chạy lần đầu tiên
        if (isDesktop) {
            setupDesktopListeners();
        } else {
            removeDesktopListeners();
        }
    }

});
