// Lightweight auth state utility to keep login across pages consistent
// Exposes: Auth.getUser(), Auth.setLogin(), Auth.logout(), Auth.isLoggedIn(), Auth.requireAuth()
(function() {
  const KEYS = {
    isLoggedIn: 'user.isLoggedIn',
    email: 'user.email',
    name: 'user.name',
    provider: 'user.provider',
    keepSignedIn: 'user.keepSignedIn',
    savedEmail: 'auth.savedEmail',
    firstLoginDone: 'user.firstLoginDone',
    firstSignupDone: 'user.firstSignupDone'
  };

  function getUser() {
    try {
      return {
        isLoggedIn: localStorage.getItem(KEYS.isLoggedIn) === 'true',
        email: localStorage.getItem(KEYS.email) || null,
        name: localStorage.getItem(KEYS.name) || null,
        provider: localStorage.getItem(KEYS.provider) || null,
        keepSignedIn: localStorage.getItem(KEYS.keepSignedIn) === 'true'
      };
    } catch { return { isLoggedIn: false }; }
  }

  function setLogin(opts) {
    const { email, name, provider, keepSignedIn } = (opts || {});
    try {
      localStorage.setItem(KEYS.isLoggedIn, 'true');
      if (email) localStorage.setItem(KEYS.email, String(email));
      if (name) localStorage.setItem(KEYS.name, String(name));
      if (provider) localStorage.setItem(KEYS.provider, String(provider));
      localStorage.setItem(KEYS.keepSignedIn, keepSignedIn ? 'true' : 'false');
      // Mark first login
      if (!localStorage.getItem(KEYS.firstLoginDone)) {
        localStorage.setItem(KEYS.firstLoginDone, 'true');
      }
      dispatchAuthChange();
    } catch {}
  }

  function logout() {
    try {
      const saved = localStorage.getItem(KEYS.savedEmail);
      // Clear user keys
      [KEYS.isLoggedIn, KEYS.email, KEYS.name, KEYS.provider, KEYS.keepSignedIn, KEYS.firstLoginDone]
        .forEach(k => localStorage.removeItem(k));
      // Preserve saved email if any
      if (saved) localStorage.setItem(KEYS.savedEmail, saved);
      dispatchAuthChange();
    } catch {}
  }

  function isLoggedIn() { return getUser().isLoggedIn; }

  function requireAuth(loginPath) {
    try {
      if (!isLoggedIn()) {
        const target = loginPath || '/auth/login.html';
        window.location.href = target;
      }
    } catch {}
  }

  function dispatchAuthChange() {
    try {
      document.dispatchEvent(new CustomEvent('auth:change', { detail: getUser() }));
    } catch {}
  }

  try { window.Auth = { getUser, setLogin, logout, isLoggedIn, requireAuth }; } catch {}
})();

