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

