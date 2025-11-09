document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('signinForm');
  const emailEl = document.getElementById('email');
  const passEl = document.getElementById('password');
  const saveIdEl = document.getElementById('saveId');
  const keepEl = document.getElementById('keepSignedIn');

  async function safeFetchJSON(path) {
    try {
      const res = await fetch(path, { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }

  const oauthCfg = await safeFetchJSON('/auth/oauth.config.json');
  const routesCfg = await safeFetchJSON('/auth/routes.json');
  const usersData = await safeFetchJSON('/auth/users.json');

  // Prefill saved email if available
  try {
    const saved = localStorage.getItem('auth.savedEmail');
    if (saved) emailEl.value = saved;
  } catch {}

  function isValidEmail(v) {
    return /.+@.+\..+/.test(String(v || '').trim());
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (emailEl.value || '').trim();
    const password = (passEl.value || '').trim();
    const keep = !!keepEl.checked;
    const saveId = !!saveIdEl.checked;

    // Minimal validation
    if (!isValidEmail(email)) {
      emailEl.focus();
      alert('Please enter a valid email.');
      return;
    }
    if (!password) {
      passEl.focus();
      alert('Please enter your password.');
      return;
    }

    // Dataset validation if available
    if (Array.isArray(usersData)) {
      const found = usersData.find(u => String(u.email).toLowerCase() === email.toLowerCase());
      if (found && String(found.password) !== String(password)) {
        passEl.focus();
        alert('Incorrect password.');
        return;
      }
    }

    // Persist preferences via Auth utility
    try {
      if (saveId) localStorage.setItem('auth.savedEmail', email);
      else localStorage.removeItem('auth.savedEmail');
      if (window.Auth && typeof Auth.setLogin === 'function') {
        Auth.setLogin({ email, keepSignedIn: keep });
      } else {
        localStorage.setItem('user.keepSignedIn', keep ? 'true' : 'false');
        localStorage.setItem('user.isLoggedIn', 'true');
        localStorage.setItem('user.email', email);
        if (!localStorage.getItem('user.firstLoginDone')) localStorage.setItem('user.firstLoginDone', 'true');
      }
    } catch {}

    // Redirect to Home page after successful sign-in
    window.location.href = '/1.homepage/html/landingpage.html';
  });

  // Social buttons: OAuth if configured, otherwise demo sign-in
  const googleBtn = document.getElementById('continueGoogle');
  const appleBtn = document.getElementById('continueApple');
  function socialLogin(provider) {
    try {
      localStorage.setItem('user.isLoggedIn', 'true');
      localStorage.setItem('user.provider', provider);
      localStorage.setItem('user.firstLoginDone', 'true');
    } catch {}
    window.location.href = '/1.homepage/html/landingpage.html';
  }
  if (googleBtn) googleBtn.addEventListener('click', (e) => {
    try { e.preventDefault(); } catch {}
    // Prefer localStorage settings if present
    const gLocal = {
      client_id: localStorage.getItem('oauth.google.client_id') || '',
      redirect_uri: localStorage.getItem('oauth.google.redirect_uri') || ''
    };
    const g = (gLocal.client_id && gLocal.redirect_uri) ? gLocal : (oauthCfg && oauthCfg.google);
    if (g && g.client_id && g.redirect_uri) {
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.searchParams.set('client_id', g.client_id);
      url.searchParams.set('redirect_uri', new URL(g.redirect_uri, window.location.origin).toString());
      url.searchParams.set('response_type', g.response_type || 'token');
      url.searchParams.set('scope', g.scope || 'openid email profile');
      if (g.state) url.searchParams.set('state', g.state);
      window.location.href = url.toString();
    } else {
      // Demo login if OAuth not configured
      if (window.Auth && typeof Auth.setLogin === 'function') Auth.setLogin({ provider: 'google' });
      else socialLogin('google');
      window.location.href = '/1.homepage/html/landingpage.html';
    }
  });
  if (appleBtn) appleBtn.addEventListener('click', (e) => {
    try { e.preventDefault(); } catch {}
    const aLocal = {
      client_id: localStorage.getItem('oauth.apple.client_id') || '',
      redirect_uri: localStorage.getItem('oauth.apple.redirect_uri') || ''
    };
    const a = (aLocal.client_id && aLocal.redirect_uri) ? aLocal : (oauthCfg && oauthCfg.apple);
    if (a && a.client_id && a.redirect_uri) {
      const url = new URL('https://appleid.apple.com/auth/authorize');
      url.searchParams.set('client_id', a.client_id);
      url.searchParams.set('redirect_uri', new URL(a.redirect_uri, window.location.origin).toString());
      url.searchParams.set('response_type', a.response_type || 'code id_token');
      url.searchParams.set('scope', a.scope || 'name email');
      if (a.state) url.searchParams.set('state', a.state);
      window.location.href = url.toString();
    } else {
      if (window.Auth && typeof Auth.setLogin === 'function') Auth.setLogin({ provider: 'apple' });
      else socialLogin('apple');
      window.location.href = '/1.homepage/html/landingpage.html';
    }
  });

  // Links placeholders
  const signupEmail = document.getElementById('signupEmail');
  const forgotPassword = document.getElementById('forgotPassword');
  if (signupEmail) signupEmail.addEventListener('click', (e) => {
    e.preventDefault();
    const href = routesCfg && routesCfg.signupEmail;
    if (href && href !== '#') window.location.href = href; else alert('Sign up flow coming soon.');
  });
  if (forgotPassword) forgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    const href = routesCfg && routesCfg.forgotPassword;
    if (href && href !== '#') window.location.href = href; else alert('Password reset flow coming soon.');
  });
});
