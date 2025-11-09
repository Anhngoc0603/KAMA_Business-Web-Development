document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('oauthForm');
  const gId = document.getElementById('google_client_id');
  const gRed = document.getElementById('google_redirect');
  const aId = document.getElementById('apple_client_id');
  const aRed = document.getElementById('apple_redirect');

  // Prefill from localStorage if present
  try {
    gId.value = localStorage.getItem('oauth.google.client_id') || '';
    gRed.value = localStorage.getItem('oauth.google.redirect_uri') || 'http://localhost:5500/account/index.html';
    aId.value = localStorage.getItem('oauth.apple.client_id') || '';
    aRed.value = localStorage.getItem('oauth.apple.redirect_uri') || 'http://localhost:5500/account/index.html';
  } catch {}

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('oauth.google.client_id', (gId.value||'').trim());
      localStorage.setItem('oauth.google.redirect_uri', (gRed.value||'').trim());
      localStorage.setItem('oauth.apple.client_id', (aId.value||'').trim());
      localStorage.setItem('oauth.apple.redirect_uri', (aRed.value||'').trim());
      alert('Saved! OAuth settings updated.');
    } catch { alert('Save failed: localStorage not available.'); }
  });
});

