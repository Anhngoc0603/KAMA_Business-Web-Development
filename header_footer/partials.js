// Unified header/footer injection using header_footer as single source
// Looks for #site-header/#header-placeholder and #site-footer/#footer-placeholder
// Computes relative base automatically and loads header script once.
(function() {
  async function inject() {
    try {
      const path = window.location.pathname.replace(/^\/+/, '');
      const segments = path.split('/').filter(Boolean);
      const depth = Math.max(0, segments.length - 1);
      const base = '../'.repeat(depth);

      const headerEl = document.querySelector('#site-header') || document.querySelector('#header-placeholder');
      const footerEl = document.querySelector('#site-footer') || document.querySelector('#footer-placeholder');

      const headerUrl = base + 'header_footer/header.html';
      const footerUrl = base + 'header_footer/footer.html';

      const [headerHTML, footerHTML] = await Promise.all([
        fetch(headerUrl).then(r => r.ok ? r.text() : Promise.reject(new Error('Header HTTP ' + r.status))).catch(() => null),
        fetch(footerUrl).then(r => r.ok ? r.text() : Promise.reject(new Error('Footer HTTP ' + r.status))).catch(() => null)
      ]);

      if (headerEl && headerHTML) headerEl.innerHTML = headerHTML;
      if (footerEl && footerHTML) footerEl.innerHTML = footerHTML;

      // Đặt biến CSS theo chiều cao thực tế của header/footer để body tự đệm
      // Giúp header/footer cố định không che nội dung khi cuộn/chuyển mục
      try {
        const injectedHeader = document.querySelector('header');
        const injectedFooter = document.querySelector('.footer');
        if (injectedHeader) {
          const h = injectedHeader.offsetHeight || 0;
          document.documentElement.style.setProperty('--site-header-height', h + 'px');
          // Ép body luôn đẩy nội dung xuống bên dưới header trên mọi trang
          document.body.style.setProperty('padding-top', h + 'px', 'important');
          // Cải thiện behavior khi scroll tới anchor/fragment
          document.documentElement.style.setProperty('scroll-padding-top', h + 'px');
        }
        // Footer không cố định: đảm bảo không có padding-bottom dư thừa
        document.body.style.setProperty('padding-bottom', '0px', 'important');
      } catch (e) {
        // Không chặn luồng nếu lỗi đo kích thước
        console.warn('Header/Footer sizing warning:', e);
      }

      // Ensure header behavior script loads once
      if (!document.querySelector('script[data-header-footer-script]')) {
        const s = document.createElement('script');
        s.src = base + 'header_footer/script.js';
        s.defer = true;
        s.setAttribute('data-header-footer-script', 'true');
        document.head.appendChild(s);
      }
    } catch (err) {
      console.error('injectHeaderFooter error:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', inject);
  // expose for manual call if needed
  window.injectHeaderFooter = inject;
})();
