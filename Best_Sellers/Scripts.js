// ---------------------- script.js (final) ----------------------
document.addEventListener('DOMContentLoaded', () => {
  /* =============== Announcement Banner Carousel =============== */
  const announcementWrapper = document.getElementById('announcementWrapper');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');

  if (announcementWrapper) {
    let currentSlide = 0;
    const slides = Array.from(announcementWrapper.children);
    const totalSlides = slides.length;

    function goTo(i) {
      currentSlide = (i + totalSlides) % totalSlides;
      announcementWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    const next = () => goTo(currentSlide + 1);
    const prev = () => goTo(currentSlide - 1);

    let timer = setInterval(next, 3000);
    const restart = () => { clearInterval(timer); timer = setInterval(next, 3000); };

    nextBtn?.addEventListener('click', () => { next(); restart(); });
    prevBtn?.addEventListener('click', () => { prev(); restart(); });
  }

  /* =============== Mobile Menu Toggler =============== */
  const menuToggler = document.getElementById('menu-toggler');
  const navbar = document.getElementById('navbar');

  if (menuToggler && navbar) {
    menuToggler.addEventListener('click', () => {
      navbar.classList.toggle('active');
      menuToggler.classList.toggle('active');

      // luôn đóng mega menu & reset các trạng thái khi bật/tắt navbar
      const menuCategories = document.querySelector('.menu-categories');
      menuCategories?.classList.remove('active');
      document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
      document.querySelectorAll('.product-list').forEach(list => (list.style.display = 'none'));
    });

    // click ngoài để đóng trên mobile
    document.addEventListener('click', (ev) => {
      if (window.innerWidth <= 900 && navbar.classList.contains('active')) {
        if (!navbar.contains(ev.target) && !menuToggler.contains(ev.target)) {
          navbar.classList.remove('active');
          menuToggler.classList.remove('active');
        }
      }
    });
  }

  /* =============== Mega Menu (desktop hover / mobile click) =============== */
  const shopAllLink = document.querySelector('.navbar .shop-all');
  const menuCategories = document.querySelector('.menu-categories');

  // Desktop – hover
  if (shopAllLink && menuCategories && window.innerWidth > 900) {
    let hoverTimeout;
    const showMenu = () => { clearTimeout(hoverTimeout); menuCategories.classList.add('active'); };
    const hideMenu = () => { hoverTimeout = setTimeout(() => menuCategories.classList.remove('active'), 300); };
    shopAllLink.addEventListener('mouseenter', showMenu);
    menuCategories.addEventListener('mouseenter', showMenu);
    shopAllLink.addEventListener('mouseleave', hideMenu);
    menuCategories.addEventListener('mouseleave', hideMenu);
  }

  // Mobile – click
  if (shopAllLink && menuCategories && window.innerWidth <= 900) {
    shopAllLink.addEventListener('click', (e) => {
      e.preventDefault();
      menuCategories.classList.toggle('active');
      shopAllLink.classList.toggle('active');
      const backBtn = menuCategories.querySelector('.back-btn');
      if (backBtn) backBtn.style.display = 'flex';
    });

    const backBtn = menuCategories.querySelector('.back-btn');
    backBtn?.addEventListener('click', () => {
      menuCategories.classList.remove('active');
      shopAllLink.classList.remove('active');
      document.querySelectorAll('.category').forEach(cat => {
        cat.classList.remove('active');
        const list = cat.querySelector('.product-list');
        if (list) list.style.display = 'none';
      });
    });

    // Mở/đóng danh sách con
    document.querySelectorAll('.category').forEach(category => {
      const header = category.querySelector('.category-header');
      const list = category.querySelector('.product-list');
      if (header && list) {
        header.addEventListener('click', (e) => {
          e.preventDefault();
          category.classList.toggle('active');
          list.style.display = category.classList.contains('active') ? 'block' : 'none';
        });
      }
    });
  }

  /* =============== Filter Dropdown (chuẩn .filter-dropdown) =============== */
  const filterToggle = document.getElementById('filter-toggle');
  const filterMenu = document.getElementById('filter-menu');
  const filterDropdown = document.getElementById('filterDropdown');

  if (filterToggle && filterMenu && filterDropdown) {
    // bật/tắt menu
    filterToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      filterMenu.classList.toggle('show');
      filterToggle.setAttribute('aria-expanded', filterMenu.classList.contains('show') ? 'true' : 'false');
    });

    // click ra ngoài để đóng
    document.addEventListener('click', (e) => {
      if (!filterDropdown.contains(e.target)) {
        filterMenu.classList.remove('show');
        filterToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // ESC để đóng
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        filterMenu.classList.remove('show');
        filterToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Chọn category
    filterMenu.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-btn');
      if (!btn) return;
      filterMenu.querySelectorAll('.category-btn').forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      filterMenu.classList.remove('show');
      filterToggle.setAttribute('aria-expanded', 'false');
      // TODO: gọi hàm filter sản phẩm theo btn.dataset.category nếu cần
    });
  }

  /* =============== Load More (ONE CLICK = SHOW ALL) =============== */
  const grid = document.getElementById('products');
  const loadMoreBtn = document.getElementById('load-more-button');

  if (grid && loadMoreBtn) {
    // 1) Ẩn từ sản phẩm thứ 5 trở đi lúc đầu
    const cards = Array.from(grid.querySelectorAll('.product-card'));
    cards.forEach((c, i) => {
      if (i >= 4) c.classList.add('is-hidden');
      else c.classList.remove('is-hidden');
    });
    loadMoreBtn.textContent = 'Click Here To See All ✿';
    loadMoreBtn.removeAttribute('disabled');
    loadMoreBtn.setAttribute('aria-disabled', 'false');

    // 2) XÓA mọi listener cũ có thể đã gắn (nếu file bị import nhiều lần)
    const clone = loadMoreBtn.cloneNode(true);
    loadMoreBtn.parentNode.replaceChild(clone, loadMoreBtn);
    const btn = document.getElementById('load-more-button');

    // 3) Gắn 1 listener duy nhất: mở hết & khóa nút
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.product-card.is-hidden')
        .forEach(card => card.classList.remove('is-hidden'));

      btn.textContent = 'All items shown';
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
      // Nếu muốn ẩn hẳn nút sau khi mở hết:
      // btn.closest('.load-more')?.remove();
    }, { once: true });
  }

  /* =============== Smooth scroll cho .btn-explore (nếu có) =============== */
  const exploreBtn = document.querySelector('.btn-explore');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = exploreBtn.getAttribute('href');
      const target = targetId ? document.querySelector(targetId) : null;
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  }
});
// ---------------------- /script.js ----------------------
