// KAMA Beauty Quiz - Fullscreen, single-question flow
(function(){
  const state = {
    stepIndex: 0,
    // Streamlined to match sample: 5 steps shown in progress
    steps: ['skinType','skinConcerns','hairType','hairConcerns','loading','results'],
    profile: {
      skinTone: null,
      skinType: null,
      skinConcerns: [],
      hairColor: null,
      hairType: null,
      hairConcerns: [],
      eyeColor: null,
    },
    products: [],
  };

  const tones = {
    skin: [
      {key:'Porcelain', color:'#f3e1d9'},
      {key:'Fair', color:'#ead0c2'},
      {key:'Light', color:'#d9b4a0'},
      {key:'Medium', color:'#c79879'},
      {key:'Tan', color:'#ae7a58'},
      {key:'Deep', color:'#8a5638'},
    ],
    hair: [
      {key:'Blonde', color:'#f4e3b4'},
      {key:'Brown', color:'#8b5e3c'},
      {key:'Black', color:'#2b2b2b'},
      {key:'Red', color:'#a13a2a'},
      {key:'Grey', color:'#bfbfbf'},
    ],
    eye: [
      {key:'Brown', color:'#5a3b2e'},
      {key:'Hazel', color:'#8a6e3f'},
      {key:'Green', color:'#6aa86f'},
      {key:'Blue', color:'#73a6d1'},
      {key:'Grey', color:'#9aa3aa'},
    ]
  };

  const typed = {
    skin: [
      {key:'Oily', icon:'💧', tip:'Excess oil, shine, enlarged pores'},
      {key:'Dry', icon:'🌵', tip:'Dehydrated, flaking, tight feeling'},
      {key:'Combination', icon:'🌓', tip:'Oily T-zone, dry cheeks'},
      {key:'Normal', icon:'🙂', tip:'Balanced, minimal fluctuation'},
      {key:'Sensitive', icon:'⚠️', tip:'Reactive, redness, itching'},
    ],
    hair: [
      {key:'Straight', icon:'➖', tip:'Tóc thẳng, mượt'},
      {key:'Wavy', icon:'〰️', tip:'Tóc gợn sóng nhẹ'},
      {key:'Curly', icon:'➿', tip:'Tóc xoăn, lọn rõ'},
      {key:'Coily', icon:'🌀', tip:'Tóc xoăn chặt, sợi nhỏ'},
    ]
  };

  const concerns = {
    skin: ['Acne','Oiliness','Dryness','Sensitivity','Redness','Dark Spots','Pores','Dullness','Fine Lines'],
    hair: ['Frizz','Breakage','Hair Loss','Dry Scalp','Oily Scalp','Split Ends','Color Care']
  };

  // DOM helpers
  const h = {
    overlay:null, modal:null, progressBar:null, progressText:null, progressRose:null, content:null,
    btnPrev:null, btnNext:null, btnStart:null
  };

  function el(html){
    const tmp = document.createElement('div');
    tmp.innerHTML = html.trim();
    return tmp.firstElementChild;
  }

  function mount(hostEl){
    // If hostEl is provided, create framed modal inside host; else create fullscreen overlay modal
    if (hostEl) {
      if (hostEl.querySelector('.bq-modal')) { h.modal = hostEl.querySelector('.bq-modal'); }
      else {
        const modal = el(`
      <div class="bq-modal framed">
        <div class="bq-header">
          <div>
            <div class="bq-title">Discover Your Inner Bloom</div>
            <div class="bq-progress-text" id="bqProgressText">Step 1 of 5</div>
          </div>
          <button class="bq-close" id="bqClose" aria-label="Đóng">×</button>
        </div>
        <div class="bq-content">
          <div class="bq-progress"><div class="bar" id="bqProgressBar"></div><img class="bq-progress-rose" id="bqProgressRose" src="/1.homepage/images/rose2.png" alt="Rose"></div>
          <div id="bqSteps"></div>
        </div>
        <div class="bq-footer">
          <button class="bq-btn secondary" id="bqPrev">Back</button>
          <div>
            <button class="bq-btn secondary" id="bqStart" style="display:none">Start</button>
            <button class="bq-btn primary" id="bqNext">Next Step</button>
          </div>
        </div>
      </div>`);
        hostEl.appendChild(modal);
        h.modal = modal;
      }
      h.overlay = hostEl.closest('.bq-framed-popup');
    } else {
      if (document.querySelector('.beauty-quiz-overlay')) { h.overlay = document.querySelector('.beauty-quiz-overlay'); h.modal = h.overlay.querySelector('.bq-modal'); }
      else {
        const overlay = el(`<div class="beauty-quiz-overlay" role="dialog" aria-modal="true"></div>`);
        const modal = el(`
      <div class="bq-modal">
        <div class="bq-header">
          <div>
            <div class="bq-title">Discover Your Inner Bloom</div>
            <div class="bq-progress-text" id="bqProgressText">Step 1 of 5</div>
          </div>
          <button class="bq-close" id="bqClose" aria-label="Đóng">×</button>
        </div>
        <div class="bq-content">
          <div class="bq-progress"><div class="bar" id="bqProgressBar"></div><img class="bq-progress-rose" id="bqProgressRose" src="/1.homepage/images/rose2.png" alt="Rose"></div>
          <div id="bqSteps"></div>
        </div>
        <div class="bq-footer">
          <button class="bq-btn secondary" id="bqPrev">Back</button>
          <div>
            <button class="bq-btn secondary" id="bqStart" style="display:none">Start</button>
            <button class="bq-btn primary" id="bqNext">Next Step</button>
          </div>
        </div>
      </div>`);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        h.overlay = overlay; h.modal = modal;
      }
    }
h.progressBar = h.modal.querySelector('#bqProgressBar');
h.progressText = h.modal.querySelector('#bqProgressText');
h.progressRose = h.modal.querySelector('#bqProgressRose');
h.content = h.modal.querySelector('#bqSteps');
h.btnPrev = h.modal.querySelector('#bqPrev');
h.btnNext = h.modal.querySelector('#bqNext');
h.btnStart = h.modal.querySelector('#bqStart');
h.modal.querySelector('#bqClose').addEventListener('click', close);

    h.btnPrev.addEventListener('click', prev);
    h.btnNext.addEventListener('click', next);
    h.btnStart.addEventListener('click', () => { state.stepIndex = 1; render(); });
  }

  function open(auto=false, hostEl=null){
    mount(hostEl);
    state.stepIndex = 0;
    if (h.overlay) h.overlay.classList.add('active');
    // only lock scroll for fullscreen mode
    if (h.overlay && h.overlay.classList.contains('beauty-quiz-overlay')) {
      document.body.style.overflow = 'hidden';
    }
    render();
    if (auto) {
      // Optional analytics hook
    }
  }
  function close(){
    if (!h.overlay) return;
    h.overlay.classList.remove('active');
    if (h.overlay.classList.contains('beauty-quiz-overlay')) {
      document.body.style.overflow = '';
    }
    // If running as standalone quiz page, navigate back to homepage
    try {
      const path = window.location.pathname || '';
      if (/^\/quiz\//.test(path)) {
        window.location.href = '/1.homepage/html/landingpage.html#beauty-quiz';
      }
    } catch(_) {}
  }
  function prev(){
    // Go back step-by-step; when reaching Step 1 (welcome), close quiz
    if (state.stepIndex > 1) { state.stepIndex--; render(); }
    else { close(); }
  }
  function next(){
    // guard: require selection for steps that need one
    const step = state.steps[state.stepIndex];
    if (['skinType','hairType'].includes(step)) {
      const requiredKey = step;
      const val = state.profile[requiredKey];
      if (!val) return; // stay until chosen
    }
    if (state.stepIndex < state.steps.length - 1) {
      state.stepIndex++;
      render();
    }
  }

  function progressUpdate(){
    const totalScreens = 5; // show 5 steps as in sample (exclude results)
    const current = Math.min(state.stepIndex + 1, totalScreens);
    const pct = Math.round((current / totalScreens) * 100);
    if (h.progressBar) h.progressBar.style.width = pct + '%';
    // Move rose icon along the track end
    if (h.progressRose) {
      const track = h.modal.querySelector('.bq-progress');
      if (track) {
        const trackW = track.clientWidth;
        const iconW = h.progressRose.offsetWidth || 24;
        const x = (pct / 100) * trackW - iconW / 2;
        const clamped = Math.max(0, Math.min(trackW - iconW, x));
        h.progressRose.style.left = clamped + 'px';
      }
    }
    const text = `Step ${current} of ${totalScreens}`;
    if (h.progressText) h.progressText.textContent = text;
  }

  function stepWelcome(){
    const c = el(`<div class="bq-step active">
      <div class="bq-question">Welcome to KAMA! Take 2 minutes for a perfect match.</div>
      <div class="bq-subtext">Enjoy a full-screen, fast quiz with perks.</div>
    </div>`);
    h.btnPrev.style.display = 'none';
    h.btnNext.style.display = 'none';
    h.btnStart.style.display = 'inline-block';
    return c;
  }

  function optionToneRow(list, key){
    const grid = el(`<div class="bq-options grid-6"></div>`);
    list.forEach(item => {
      const node = el(`<div class="bq-tone" title="${item.key}">
        <div class="bq-tone-dot" style="background:${item.color}"></div>
        <div class="bq-tone-label">${item.key}</div>
      </div>`);
      node.addEventListener('click', () => { state.profile[key] = item.key; render(); });
      if (state.profile[key] === item.key) node.classList.add('selected');
      grid.appendChild(node);
    });
    return grid;
  }

  function optionType(list, key){
    const colClass = list.length >= 5 ? 'grid-5' : 'grid-4';
    const grid = el(`<div class="bq-options ${colClass}"></div>`);
    list.forEach(item => {
      const imgSrc = item.key === 'Oily'
        ? '/1.homepage/images/oily.png'
        : item.key === 'Dry'
          ? '/1.homepage/images/dry.png'
          : item.key === 'Combination'
            ? '/1.homepage/images/combination.png'
          : item.key === 'Normal'
            ? '/1.homepage/images/normal.png'
          : item.key === 'Sensitive'
            ? '/1.homepage/images/sensitive.png'
          : null;
      const isImg = !!imgSrc;
      const iconHtml = isImg
        ? `<img class="icon" src="${imgSrc}" alt="${item.key}">`
        : `${item.icon}`;
      const node = el(`<div class="bq-icon-btn${isImg ? ' only-img' : ''}" title="${item.tip}">
        ${isImg ? iconHtml : `<div class="icon">${iconHtml}</div>`}
        <div class="bq-icon-label">${item.key}</div>
      </div>`);
      node.addEventListener('click', () => { state.profile[key] = item.key; render(); });
      if (state.profile[key] === item.key) node.classList.add('selected');
      grid.appendChild(node);
    });
    return grid;
  }

  function optionTags(list, key){
    const wrap = el(`<div class="bq-options tags-2"></div>`);
    list.forEach(tag => {
      const node = el(`<div class="bq-tag"><span class="check"></span><span>${tag}</span></div>`);
      const selected = (state.profile[key]||[]).includes(tag);
      if (selected) node.classList.add('selected');
      node.addEventListener('click', () => {
        const arr = new Set(state.profile[key]||[]);
        if (arr.has(tag)) arr.delete(tag); else arr.add(tag);
        state.profile[key] = Array.from(arr);
        render();
      });
      wrap.appendChild(node);
    });
    return wrap;
  }

  function stepSkinTone(){
    const c = el(`<div class="bq-step active">
      <div class="bq-question">Skin Tone: What’s your current tone?</div>
      <div class="bq-subtext">Pick the shade closest to your skin right now.</div>
    </div>`);
    c.appendChild(optionToneRow(tones.skin, 'skinTone'));
    h.btnPrev.style.display = '';
    h.btnNext.style.display = '';
    h.btnStart.style.display = 'none';
    h.btnNext.disabled = !state.profile.skinTone;
    return c;
  }
  function stepSkinType(){
    const c = el(`<div class="bq-step active">
      <div class="bq-question">What is your skin type?</div>
      <div class="bq-subtext">Please choose the option that fits best.</div>
    </div>`);
    c.appendChild(optionType(typed.skin, 'skinType'));
    h.btnNext.disabled = !state.profile.skinType;
    return c;
  }
  function stepSkinConcern(){
    const c = el(`<div class="bq-step active">
      <div class="bq-question">Skin concerns (choose all that apply)</div>
      <div class="bq-subtext">Select every topic relevant to your skin.</div>
    </div>`);
    c.appendChild(optionTags(concerns.skin, 'skinConcerns'));
    h.btnNext.disabled = (state.profile.skinConcerns||[]).length === 0;
    return c;
  }
  function stepHairColor(){
    const c = el(`<div class="bq-step active">
      <div class="bq-question">Hair Color: What’s your current hair color?</div>
      <div class="bq-subtext">Choose the closest shade.</div>
    </div>`);
    c.appendChild(optionToneRow(tones.hair, 'hairColor'));
    h.btnNext.disabled = !state.profile.hairColor;
    return c;
  }
  function stepHairType(){
    const c = el(`<div class="bq-step active">
      <div class="bq-question">What is your hair texture?</div>
      <div class="bq-subtext">Please choose the option that fits best.</div>
    </div>`);
    c.appendChild(optionType(typed.hair, 'hairType'));
    h.btnNext.disabled = !state.profile.hairType;
    return c;
  }
  function stepHairConcern(){
    const c = el(`<div class="bq-step active">
      <div class="bq-question">Hair concerns (choose all that apply)</div>
      <div class="bq-subtext">Select every topic relevant to your hair.</div>
    </div>`);
    c.appendChild(optionTags(concerns.hair, 'hairConcerns'));
    h.btnNext.disabled = (state.profile.hairConcerns||[]).length === 0;
    return c;
  }
  function stepEyeColor(){
    const c = el(`<div class="bq-step active">
      <div class="bq-question">Eye Color: What’s your eye color?</div>
      <div class="bq-subtext">Choose the closest shade.</div>
    </div>`);
    c.appendChild(optionToneRow(tones.eye, 'eyeColor'));
    h.btnNext.disabled = !state.profile.eyeColor;
    return c;
  }
  function stepLoading(){
    const c = el(`<div class="bq-step active bq-loading">
      <div>
        <div class="bq-spinner" style="margin:0 auto"></div>
        <div style="text-align:center; margin-top:16px;">Thanks! Matching recommendations tailored for you…</div>
      </div>
    </div>`);
    h.btnPrev.style.display = 'none';
    h.btnNext.style.display = 'none';
    h.btnStart.style.display = 'none';
    // fetch products and API recommendations then proceed
    fetchProducts().then(async () => {
      try {
        const selections = [];
        if (state.profile.skinType) selections.push(state.profile.skinType);
        if (Array.isArray(state.profile.skinConcerns)) selections.push(...state.profile.skinConcerns);
        if (state.profile.hairType) selections.push(state.profile.hairType);
        if (Array.isArray(state.profile.hairConcerns)) selections.push(...state.profile.hairConcerns);
        if ((state.profile.skinConcerns||[]).length) selections.push('Face');
        if ((state.profile.hairConcerns||[]).length) selections.push('Hair');
        const qs = encodeURIComponent(selections.join(','));
        const url = `/api/recommend?selections=${qs}&mode=promo`;
        const resp = await fetch(url);
        state.recommendations = await resp.json();
        // Track interactions
        try {
          fetch('/api/track/interactions', {
            method: 'POST', headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({ source: 'quiz', selections })
          });
        } catch(e){}
      } catch(e){ state.recommendations = null; }
      setTimeout(() => { state.stepIndex = state.steps.indexOf('results'); render(); }, 600);
    });
    return c;
  }
  function stepResults(){
    const c = el(`<div class="bq-step active">
      <div class="bq-question">Based on your selections, these are great matches!</div>
      <div class="bq-subtext">Personalized picks curated from your selections.</div>
    </div>`);
    const grid = el(`<div class="bq-products"></div>`);
    const picks = (state.recommendations && Array.isArray(state.recommendations.results))
      ? state.recommendations.results.slice(0,5)
      : recommendProducts(state.profile, state.products).slice(0,5);
    // Persist top picks to localStorage so Beauty Profile can show them without relying on API
    try {
      const compact = picks.map(p => ({ id: p.id, name: p.name, brand: p.brand, category: p.category }));
      localStorage.setItem('beauty.profile.recs', JSON.stringify(compact));
      try { window.dispatchEvent(new CustomEvent('beautyQuizRecsSaved', { detail: compact })); } catch(_) {}
    } catch(_) {}
    picks.forEach(p => {
      const href = `/categories/view_detail.html?id=${encodeURIComponent(p.id)}`;
      const byId = (Array.isArray(state.products) ? state.products.find(x => String(x.id) === String(p.id)) : null);
      const imgRel = (Array.isArray(p.images) && p.images[0])
        ? p.images[0]
        : (byId && Array.isArray(byId.images) && byId.images[0] ? byId.images[0] : '/header_footer/images/LOGO.png');
      const imgSrc = imgRel.startsWith('./')
        ? ('/categories' + imgRel.slice(1))
        : (imgRel.startsWith('/') ? imgRel : ('/categories/' + imgRel.replace(/^\/+/, '')));
      const brandRelRaw = (p.brandImage || (byId && byId.brandImage) || '').trim();
      const brandSrc = brandRelRaw
        ? (brandRelRaw.startsWith('./') ? ('/categories' + brandRelRaw.slice(1))
          : (brandRelRaw.startsWith('/') ? brandRelRaw : ('/categories/' + brandRelRaw.replace(/^\/+/, ''))))
        : '/header_footer/images/LOGO.png';
      const card = el(`<div class="bq-card">
        <img src="${imgSrc}" alt="${p.name}" onerror="this.onerror=null;this.src='${brandSrc}'">
        <div class="body">
          <div class="title">${p.name}</div>
          <div class="meta">${p.brand || ''} • ${p.category || ''}</div>
          <div class="actions">
            <a class="bq-cta primary" href="${href}">Shop Now</a>
            <a class="bq-cta" href="/account/index.html#beauty-profile">View Beauty Profile</a>
          </div>
        </div>
      </div>`);
      grid.appendChild(card);
    });
    c.appendChild(grid);
    // Save profile immediately on results
    persistProfile();
    awardPoints(20);
    h.btnPrev.style.display = '';
    h.btnNext.textContent = 'Close';
    h.btnNext.style.display = '';
    h.btnNext.disabled = false;
    h.btnNext.onclick = close;
    return c;
  }

  function render(){
    if (!h.content) return;
    h.content.innerHTML = '';
    const step = state.steps[state.stepIndex];
    progressUpdate();
    let node;
    switch(step){
      case 'welcome': node = stepWelcome(); break;
      case 'skinTone': node = stepSkinTone(); break;
      case 'skinType': node = stepSkinType(); break;
      case 'skinConcerns': node = stepSkinConcern(); break;
      case 'hairColor': node = stepHairColor(); break;
      case 'hairType': node = stepHairType(); break;
      case 'hairConcerns': node = stepHairConcern(); break;
      case 'eyeColor': node = stepEyeColor(); break;
      case 'loading': node = stepLoading(); break;
      case 'results': node = stepResults(); break;
      default: node = document.createElement('div'); node.textContent = 'Unknown step';
    }
    h.content.appendChild(node);
  }

  async function fetchProducts(){
    try {
      const resp = await fetch('/categories/full.json');
      const data = await resp.json();
      state.products = Array.isArray(data) ? data : (data.products || []);
    } catch(e){
      state.products = [];
    }
  }

  function recommendProducts(profile, products){
    if (!Array.isArray(products)) return [];
    // Simple heuristics: prioritize Face for skin concerns, Hair for hair concerns; fallback by rating
    const pool = products.filter(p => {
      if (profile.skinConcerns?.length) return (p.category||'').toLowerCase().includes('face');
      if (profile.hairConcerns?.length) return (p.category||'').toLowerCase().includes('hair');
      return true;
    });
    // sort by rating desc if available
    pool.sort((a,b) => (b.rating||0) - (a.rating||0));
    return pool.slice(0,5);
  }

  function persistProfile(){
    const profile = {
      skinTone: state.profile.skinTone,
      skinType: state.profile.skinType,
      skinConcerns: state.profile.skinConcerns,
      hairColor: state.profile.hairColor,
      hairType: state.profile.hairType,
      hairConcerns: state.profile.hairConcerns,
      eyeColor: state.profile.eyeColor,
      consent: true
    };
    try {
      localStorage.setItem('beauty.profile', JSON.stringify(profile));
      localStorage.setItem('beautyQuizCompleted', 'true');
      window.dispatchEvent(new CustomEvent('beautyProfileSaved', {detail: profile}));
    } catch(e){}
    // Track interaction for weighting
    try {
      const selections = [];
      if (profile.skinType) selections.push(profile.skinType);
      if (Array.isArray(profile.skinConcerns)) selections.push(...profile.skinConcerns);
      if (profile.hairType) selections.push(profile.hairType);
      if (Array.isArray(profile.hairConcerns)) selections.push(...profile.hairConcerns);
      fetch('/api/track/interactions', {
        method: 'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ source: 'quiz', selections })
      });
    } catch(e){}
  }

  function awardPoints(n){
    try {
      const curr = parseFloat(localStorage.getItem('points.total')||'0');
      const next = curr + (n||0);
      localStorage.setItem('points.total', String(next));
    } catch(e){}
  }

  // Global API
  window.KamaBeautyQuiz = {
    open,
  };

  // CTA wiring for homepage banner or any element with [data-open-beauty-quiz]
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-open-beauty-quiz]');
    if (target) {
      e.preventDefault();
      const mode = target.getAttribute('data-open-beauty-quiz');
      if (mode === 'framed') {
        const hostEl = document.getElementById('bqFramedHost');
        const popup = document.getElementById('bqFramedPopup');
        if (popup) popup.classList.add('active');
        open(false, hostEl);
      } else {
        open(false);
      }
    }
    if (e.target.closest('.bq-frame-close')) {
      const popup = document.getElementById('bqFramedPopup');
      if (popup) popup.classList.remove('active');
    }
  });

  // Auto-open after signup success if flag present and not yet completed
  window.addEventListener('load', () => {
    try {
      const firstDone = localStorage.getItem('user.firstSignupDone') === 'true';
      const completed = localStorage.getItem('beautyQuizCompleted') === 'true';
      const autoHint = localStorage.getItem('beautyQuiz.autoOpenOnce') === 'true';
      if ((firstDone || autoHint) && !completed) {
        setTimeout(() => open(true), 600);
        localStorage.removeItem('beautyQuiz.autoOpenOnce');
      }
    } catch(e){}
  });
})();
