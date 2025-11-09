document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const els = {
    first: document.getElementById('su_first'),
    last: document.getElementById('su_last'),
    email: document.getElementById('su_email'),
    pass1: document.getElementById('su_password'),
    pass2: document.getElementById('su_password2'),
    age: document.getElementById('su_age'),
    lang: document.getElementById('su_lang'),
    birthMonth: document.getElementById('su_birth_month'),
    birthDay: document.getElementById('su_birth_day'),
    gender: document.getElementById('su_gender'),
    referrer: document.getElementById('su_referrer'),
    agreeAll: document.getElementById('agree_all'),
    agreeTerms: document.getElementById('agree_terms'),
    agreeInfoReq: document.getElementById('agree_info_req'),
    agreeInfoOpt: document.getElementById('agree_info_opt'),
    agreeMarketing: document.getElementById('agree_marketing'),
    agreeMarketingEmail: document.getElementById('agree_marketing_email'),
    agreeMarketingPush: document.getElementById('agree_marketing_push'),
  };

  function isValidEmail(v){ return /.+@.+\..+/.test(String(v||'').trim()); }
  function isValidPassword(p){ return typeof p === 'string' && p.length >= 8 && p.length <= 16; }

  // Master agreement toggles all
  if (els.agreeAll) {
    els.agreeAll.addEventListener('change', () => {
      const checked = els.agreeAll.checked;
      ['agreeTerms','agreeInfoReq','agreeInfoOpt','agreeMarketing','agreeMarketingEmail','agreeMarketingPush']
        .forEach(key => { if (els[key]) els[key].checked = checked; });
    });
  }
  // If marketing unchecked, uncheck sub-options
  if (els.agreeMarketing) {
    els.agreeMarketing.addEventListener('change', () => {
      if (!els.agreeMarketing.checked) {
        if (els.agreeMarketingEmail) els.agreeMarketingEmail.checked = false;
        if (els.agreeMarketingPush) els.agreeMarketingPush.checked = false;
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const first = (els.first?.value||'').trim();
    const last = (els.last?.value||'').trim();
    const email = (els.email?.value||'').trim();
    const p1 = (els.pass1?.value||'').trim();
    const p2 = (els.pass2?.value||'').trim();
    const age = (els.age?.value||'').trim();
    const lang = (els.lang?.value||'').trim();

    if(!first){ els.first.focus(); alert('Please enter your first name.'); return; }
    if(!last){ els.last.focus(); alert('Please enter your last name.'); return; }
    if(!isValidEmail(email)) { els.email.focus(); alert('Please enter a valid email.'); return; }
    if(!isValidPassword(p1)) { els.pass1.focus(); alert('Password must be 8–16 characters.'); return; }
    if(p1 !== p2) { els.pass2.focus(); alert('Passwords do not match.'); return; }
    if(!age){ els.age.focus(); alert('Please select your age group.'); return; }
    if(!lang){ els.lang.focus(); alert('Please select your language.'); return; }
    if(!els.agreeTerms?.checked){ alert('Please agree to Terms of Use.'); return; }
    if(!els.agreeInfoReq?.checked){ alert('Please agree to collection/use of personal information (Required).'); return; }

    // Build profile object for demo persistence
    const profile = {
      firstName: first,
      lastName: last,
      name: `${first} ${last}`.trim(),
      email,
      password: p1,
      ageGroup: age,
      language: lang,
      birthMonth: Number(els.birthMonth?.value || '0') || null,
      birthDay: Number(els.birthDay?.value || '0') || null,
      gender: (els.gender?.value||'').trim() || null,
      referrer: (els.referrer?.value||'').trim() || null,
      marketing: {
        consent: !!(els.agreeMarketing?.checked),
        email: !!(els.agreeMarketingEmail?.checked),
        push: !!(els.agreeMarketingPush?.checked)
      },
      createdAt: Date.now()
    };

    try {
      const list = JSON.parse(localStorage.getItem('auth.registeredUsers') || '[]');
      list.push(profile);
      localStorage.setItem('auth.registeredUsers', JSON.stringify(list));
      localStorage.setItem('user.firstSignupDone', 'true');
    } catch {}

    // Auto-login ngay sau khi tạo tài khoản (qua Auth utility nếu có)
    try {
      if (window.Auth && typeof Auth.setLogin === 'function') {
        Auth.setLogin({ email, name: profile.name, keepSignedIn: true });
      } else {
        localStorage.setItem('user.isLoggedIn', 'true');
        localStorage.setItem('user.email', email);
        localStorage.setItem('user.name', profile.name);
        if (profile.birthMonth) localStorage.setItem('user.birthMonth', String(profile.birthMonth));
        localStorage.setItem('user.firstLoginDone', 'true');
      }
    } catch {}
    window.location.href = '/account/index.html';
  });
});

