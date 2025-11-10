document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgotForm');
  const emailEl = document.getElementById('fp_email');
  function isValidEmail(v){ return /.+@.+\..+/.test(String(v||'').trim()); }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (emailEl.value||'').trim();
    if(!isValidEmail(email)) { emailEl.focus(); alert('Please enter a valid email.'); return; }
    try {
      localStorage.setItem('auth.lastResetEmail', email);
    } catch {}
    alert('We have sent a reset link to your email (demo).');
    window.location.href = '/auth/login.html';
  });
});

