document.addEventListener('DOMContentLoaded', () => {
  console.log('👤 Account page init');

  // Read basic info from localStorage (fallbacks provided)
  const name = localStorage.getItem('user.name') || 'Huỳnh Ý';
  const couponsCount = Number(localStorage.getItem('user.couponsCount') || '0') || 0;
  const toNextAmount = Number(localStorage.getItem('user.toNextTierAmount') || '1') || 1;
  const nextTier = localStorage.getItem('user.nextTier') || 'PINK OLIVE';
  const tierName = localStorage.getItem('user.tierName') || 'BABY OLIVE';

  const els = {
    accountName: document.getElementById('accountName'),
    couponCount: document.getElementById('couponCount'),
    pointsTotal: document.getElementById('pointsTotal'),
    toNextAmount: document.getElementById('toNextAmount'),
    nextTier: document.getElementById('nextTier'),
    tierName: document.getElementById('tierName'),
  };
  // Coupons count label inside Coupons section
  const couponCountLabelEl = document.getElementById('couponCountLabel');
  const membershipModalEl = document.getElementById('membershipModal');
  const closeMembershipModalBtn = document.getElementById('closeMembershipModal');

  if (els.accountName) {
    // Show "Username's Account" after the user's name
    els.accountName.textContent = `${name}'s Account`;
  }
  if (els.couponCount) els.couponCount.textContent = String(couponsCount);
  if (couponCountLabelEl) couponCountLabelEl.textContent = String(couponsCount);
  if (els.toNextAmount) els.toNextAmount.textContent = String(toNextAmount);
  if (els.nextTier) els.nextTier.textContent = nextTier;
  if (els.tierName) els.tierName.textContent = tierName;

  const updatePointsFromReviews = () => {
    const total = (loadMyReviews() || []).reduce((sum, r) => sum + (Number(r.pointsAwarded || 0) || 0), 0);
    localStorage.setItem('user.pointsTotal', String(total));
    if (els.pointsTotal) els.pointsTotal.textContent = total.toFixed(2);
  };

  let editingIndex = null;
  const canEditReview = (r) => {
    try {
      const created = new Date(r.createdAt);
      const now = new Date();
      const diffMs = now - created;
      return diffMs <= 24 * 60 * 60 * 1000; // 24h
    } catch { return false; }
  };

  // Optional: mock stats, can be wired to real data later
  const stats = {
    completed: Number(localStorage.getItem('order.completed') || '0'),
    preparing: Number(localStorage.getItem('order.preparing') || '0'),
    transit: Number(localStorage.getItem('order.transit') || '0'),
    delivered: Number(localStorage.getItem('order.delivered') || '0'),
    cancelRefund: Number(localStorage.getItem('order.cancelRefund') || '0'),
  };
  const byId = id => document.getElementById(id);
  byId('statCompleted').textContent = stats.completed;
  byId('statPreparing').textContent = stats.preparing;
  byId('statTransit').textContent = stats.transit;
  byId('statDelivered').textContent = stats.delivered;
  byId('statCancelRefund').textContent = stats.cancelRefund;

  // ---------- Beauty Profile: chips UI, link by email, prefill from quiz ----------
  const bpNodes = {
    skinTone: byId('bpSkinTone'),
    skinType: byId('bpSkinTypeTags'),
    skinConcerns: byId('bpSkinConcerns'),
    hairColor: byId('bpHairColor'),
    hairType: byId('bpHairType'),
    hairConcerns: byId('bpHairConcerns'),
    eyeColor: byId('bpEyeColor'),
    consent: byId('bpConsent'),
    editBtn: byId('bpEditBtn'),
    saveBtn: byId('bpSaveBtn'),
    cancelBtn: byId('bpCancelBtn'),
    saveStatus: byId('bpSaveStatus')
  };

  const getCurrentEmail = () => {
    try {
      if (window.Auth && typeof Auth.getUser === 'function') {
        const u = Auth.getUser();
        if (u && u.email) return String(u.email).toLowerCase();
      }
    } catch {}
    const e = localStorage.getItem('user.email');
    return e ? String(e).toLowerCase() : null;
  };
  const keyForEmail = (email) => email ? `beauty.profile:${email}` : 'beauty.profile';

  const readBeautyProfileEmail = () => {
    const email = getCurrentEmail();
    const key = keyForEmail(email);
    try {
      const raw = localStorage.getItem(key) || localStorage.getItem('beauty.profile');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  };
  const writeBeautyProfileEmail = (profile) => {
    const email = getCurrentEmail();
    const key = keyForEmail(email);
    try { localStorage.setItem(key, JSON.stringify(profile || {})); } catch {}
    // Keep global for backward compatibility
    try { localStorage.setItem('beauty.profile', JSON.stringify(profile || {})); } catch {}
    window.dispatchEvent(new CustomEvent('beautyProfileSaved', { detail: profile }));
  };

  // Ensure Beauty Profile section exists only when requested
  function refreshBPRefs() {
    bpNodes.skinTone = byId('bpSkinTone');
    bpNodes.skinType = byId('bpSkinTypeTags');
    bpNodes.skinConcerns = byId('bpSkinConcerns');
    bpNodes.hairColor = byId('bpHairColor');
    bpNodes.hairType = byId('bpHairType');
    bpNodes.hairConcerns = byId('bpHairConcerns');
    bpNodes.eyeColor = byId('bpEyeColor');
    bpNodes.consent = byId('bpConsent');
    bpNodes.editBtn = byId('bpEditBtn');
    bpNodes.saveBtn = byId('bpSaveBtn');
    bpNodes.cancelBtn = byId('bpCancelBtn');
    bpNodes.saveStatus = byId('bpSaveStatus');
  }

  function ensureBeautyProfileSection() {
    let host = document.getElementById('beauty-profile');
    if (!host) {
      const main = document.querySelector('.account-main');
      if (!main) return;
      const section = document.createElement('section');
      section.className = 'glass-section hidden';
      section.id = 'beauty-profile';
      section.innerHTML = `
        <div class="section-header">
          <h2 class="section-title">Beauty Profile</h2>
          <div class="bp-actions">
            <button id="bpEditBtn" class="btn" type="button">Edit</button>
            <button id="bpSaveBtn" class="btn primary" type="button" disabled>Save</button>
            <button id="bpCancelBtn" class="btn" type="button" disabled>Cancel</button>
            <div id="bpSaveStatus" class="save-status"></div>
          </div>
        </div>
        <div class="bp-row">
          <div class="bp-group"><div class="bp-label">Skin Tone</div><div id="bpSkinTone" class="bp-tags"></div></div>
          <div class="bp-group"><div class="bp-label">Skin Type</div><div id="bpSkinTypeTags" class="bp-tags"></div></div>
          <div class="bp-group full"><div class="bp-label">Skin Concerns</div><div id="bpSkinConcerns" class="bp-tags"></div></div>
          <div class="bp-group"><div class="bp-label">Hair Color</div><div id="bpHairColor" class="bp-tags"></div></div>
          <div class="bp-group"><div class="bp-label">Hair Type</div><div id="bpHairType" class="bp-tags"></div></div>
          <div class="bp-group full"><div class="bp-label">Hair Concerns</div><div id="bpHairConcerns" class="bp-tags"></div></div>
          <div class="bp-group"><div class="bp-label">Eye Color</div><div id="bpEyeColor" class="bp-tags"></div></div>
          <div class="bp-group"><label><input type="checkbox" id="bpConsent" /> Allow personalization</label></div>
        </div>
      `;
      main.appendChild(section);
      host = section;
    }

    // Refresh references to the dynamically inserted nodes
    refreshBPRefs();

    // Render tag options for the newly inserted hosts
    renderTags(bpNodes.skinTone, OPT.skinTone, false);
    renderTags(bpNodes.skinType, OPT.skinType, false);
    renderTags(bpNodes.skinConcerns, OPT.skinConcerns, true);
    renderTags(bpNodes.hairColor, OPT.hairColor, false);
    renderTags(bpNodes.hairType, OPT.hairType, false);
    renderTags(bpNodes.hairConcerns, OPT.hairConcerns, true);
    renderTags(bpNodes.eyeColor, OPT.eyeColor, false);

    // Prefill from saved profile (email-aware)
    const saved = readBeautyProfileEmail();
    if (saved) applyPrefill(saved);
    setEditMode(false);

    // Wire action buttons once
    if (bpNodes.editBtn && !bpNodes.editBtn._bound) {
      bpNodes.editBtn.addEventListener('click', () => { originalBP = Object.assign({}, collectFromUI()); setEditMode(true); });
      bpNodes.editBtn._bound = true;
    }
    if (bpNodes.saveBtn && !bpNodes.saveBtn._bound) {
      bpNodes.saveBtn.addEventListener('click', saveBP);
      bpNodes.saveBtn._bound = true;
    }
    if (bpNodes.cancelBtn && !bpNodes.cancelBtn._bound) {
      bpNodes.cancelBtn.addEventListener('click', cancelEdit);
      bpNodes.cancelBtn._bound = true;
    }
  }

  // Options (superset để khớp hình + quiz)
  const OPT = {
    skinTone: ['Porcelain','Fair','Light','Medium','Tan','Olive','Deep','Dark','Ebony'],
    skinType: ['Oily','Dry','Normal','Combination','Sensitive'],
    skinConcerns: ['Acne','Oiliness','Dryness','Sensitivity','Redness','Dark Spots','Pores','Dullness','Fine Lines','Moisturising','Puffiness','Scarring','Sculpting','Slimming','Soothing','Stress','Stretch Marks','Sun Care','Visible Pores','Well-aging','Fine Dust Removal'],
    hairColor: ['Blonde','Brown','Black','Red','Grey'],
    hairType: ['Straight','Wavy','Curly','Coily','Colored','Dry','Fine','Frizzy','Greying','Hair loss','Thinning','Weakened'],
    hairConcerns: ['Anti-Dandruff','Anti-Frizz','Balancing','Color Protection','Damage Repair','Hair Growth','Heat Protection','Hydrating','Purifying','Scalp Treatment','Shine','Thickening','Volumizing','Breakage','Dry Scalp','Oily Scalp','Split Ends','Color Care'],
    eyeColor: ['Blue','Brown','Green','Grey','Black']
  };

  let bpEditMode = false;
  let currentBP = { skinTone:null, skinType:null, skinConcerns:[], hairColor:null, hairType:null, hairConcerns:[], eyeColor:null, consent:false };
  let originalBP = null;

  function renderTags(host, options, multiple=false) {
    if (!host) return;
    host.innerHTML = '';
    options.forEach(opt => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'bp-tag';
      el.textContent = opt;
      el.dataset.value = opt;
      el.disabled = !bpEditMode;
      el.addEventListener('click', () => {
        if (!bpEditMode) return;
        if (multiple) {
          const arr = host._selected || [];
          const idx = arr.indexOf(opt);
          if (idx >= 0) arr.splice(idx,1); else arr.push(opt);
          host._selected = arr;
          el.classList.toggle('selected');
        } else {
          // single: clear others
          host.querySelectorAll('.bp-tag').forEach(b => b.classList.remove('selected'));
          el.classList.add('selected');
          host._selected = [opt];
        }
      });
      host.appendChild(el);
    });
  }

  function applyPrefill(bp){
    if (!bp) return;
    // Set selections visually
    const setSelected = (host, values) => {
      if (!host) return;
      const arr = Array.isArray(values) ? values : (values ? [values] : []);
      host._selected = arr.slice();
      host.querySelectorAll('.bp-tag').forEach(b => {
        const v = b.dataset.value;
        if (arr.includes(v)) b.classList.add('selected'); else b.classList.remove('selected');
      });
    };
    setSelected(bpNodes.skinTone, bp.skinTone);
    setSelected(bpNodes.skinType, bp.skinType);
    setSelected(bpNodes.skinConcerns, bp.skinConcerns || []);
    setSelected(bpNodes.hairColor, bp.hairColor);
    setSelected(bpNodes.hairType, bp.hairType);
    setSelected(bpNodes.hairConcerns, bp.hairConcerns || []);
    setSelected(bpNodes.eyeColor, bp.eyeColor);
    if (bpNodes.consent) bpNodes.consent.checked = !!bp.consent;
    currentBP = {
      skinTone: bp.skinTone || null,
      skinType: bp.skinType || null,
      skinConcerns: Array.isArray(bp.skinConcerns) ? bp.skinConcerns.slice() : [],
      hairColor: bp.hairColor || null,
      hairType: bp.hairType || null,
      hairConcerns: Array.isArray(bp.hairConcerns) ? bp.hairConcerns.slice() : [],
      eyeColor: bp.eyeColor || null,
      consent: !!bp.consent
    };
  }

  function collectFromUI(){
    const getSingle = (host) => host && Array.isArray(host._selected) ? (host._selected[0] || null) : null;
    const getMulti = (host) => host && Array.isArray(host._selected) ? host._selected.slice() : [];
    return {
      skinTone: getSingle(bpNodes.skinTone),
      skinType: getSingle(bpNodes.skinType),
      skinConcerns: getMulti(bpNodes.skinConcerns),
      hairColor: getSingle(bpNodes.hairColor),
      hairType: getSingle(bpNodes.hairType),
      hairConcerns: getMulti(bpNodes.hairConcerns),
      eyeColor: getSingle(bpNodes.eyeColor),
      consent: !!(bpNodes.consent && bpNodes.consent.checked)
    };
  }

  function setEditMode(on){
    bpEditMode = !!on;
    [bpNodes.skinTone,bpNodes.skinType,bpNodes.skinConcerns,bpNodes.hairColor,bpNodes.hairType,bpNodes.hairConcerns,bpNodes.eyeColor].forEach(host => {
      if (!host) return;
      host.querySelectorAll('.bp-tag').forEach(b => { b.disabled = !bpEditMode; });
    });
    if (bpNodes.saveBtn) bpNodes.saveBtn.disabled = !bpEditMode;
    if (bpNodes.cancelBtn) bpNodes.cancelBtn.disabled = !bpEditMode;
  }

  function saveBP(){
    const next = collectFromUI();
    writeBeautyProfileEmail(next);
    applyPrefill(next);
    setEditMode(false);
    if (bpNodes.saveStatus) {
      bpNodes.saveStatus.textContent = 'Profile saved.';
      setTimeout(() => { bpNodes.saveStatus && (bpNodes.saveStatus.textContent = ''); }, 2000);
    }
  }

  function cancelEdit(){
    if (originalBP) applyPrefill(originalBP);
    setEditMode(false);
  }

  // Render tags
  renderTags(bpNodes.skinTone, OPT.skinTone, false);
  renderTags(bpNodes.skinType, OPT.skinType, false);
  renderTags(bpNodes.skinConcerns, OPT.skinConcerns, true);
  renderTags(bpNodes.hairColor, OPT.hairColor, false);
  renderTags(bpNodes.hairType, OPT.hairType, false);
  renderTags(bpNodes.hairConcerns, OPT.hairConcerns, true);
  renderTags(bpNodes.eyeColor, OPT.eyeColor, false);

  // Prefill from email-specific or quiz global
  const initial = readBeautyProfileEmail() || {};
  // If quiz saved globally, map keys
  const quizRaw = (() => { try { return JSON.parse(localStorage.getItem('beauty.profile')||'null'); } catch { return null; } })();
  const base = Object.assign({}, quizRaw || {}, initial || {});
  applyPrefill(base);
  setEditMode(false);
  originalBP = Object.assign({}, currentBP);

  // Events
  if (bpNodes.editBtn) bpNodes.editBtn.addEventListener('click', () => { originalBP = Object.assign({}, collectFromUI()); setEditMode(true); });
  if (bpNodes.saveBtn) bpNodes.saveBtn.addEventListener('click', saveBP);
  if (bpNodes.cancelBtn) bpNodes.cancelBtn.addEventListener('click', cancelEdit);

  // React to quiz updates in real-time
  window.addEventListener('beautyProfileSaved', (e) => {
    const p = (e && e.detail) || readBeautyProfileEmail();
    if (p) { applyPrefill(p); originalBP = Object.assign({}, p); }
  });

  // Sidebar interactions: active state + hide sections when viewing Track Orders
  const sidebarLinks = document.querySelectorAll('.account-sidebar a[href="#"]');
  const trackSection = document.getElementById('trackOrdersSection');
  const benefitsSection = document.getElementById('benefitsSection');
  const wishListSection = document.getElementById('wishListSection');
  const membershipCardSection = document.querySelector('.membership-card');
  const couponsSection = document.getElementById('couponsSection');
  const reviewsSection = document.getElementById('reviewsSection');
  const reviewsWritableEl = document.getElementById('reviewsWritable');
  const reviewsMineEl = document.getElementById('reviewsMine');
  const writableListEl = document.getElementById('writableList');
  const myReviewsListEl = document.getElementById('myReviewsList');
  const myReviewsEmptyEl = document.getElementById('myReviewsEmpty');
  const browseBtns = document.querySelectorAll('#reviewsSection .browse-btn');
  const tabs = document.querySelectorAll('#reviewsSection .tab');
  const accountInfoSection = document.getElementById('accountInfoSection');
  const beautyProfileSection = document.getElementById('beauty-profile');
  const aiForm = document.getElementById('accountInfoForm');
  const aiEls = {
    first: document.getElementById('ai_first'),
    last: document.getElementById('ai_last'),
    email: document.getElementById('ai_email'),
    password: document.getElementById('ai_password'),
    age: document.getElementById('ai_age'),
    lang: document.getElementById('ai_lang'),
    birthMonth: document.getElementById('ai_birth_month'),
    birthDay: document.getElementById('ai_birth_day'),
    gender: document.getElementById('ai_gender'),
    referrer: document.getElementById('ai_referrer'),
    marketing: document.getElementById('ai_marketing'),
    marketingEmail: document.getElementById('ai_marketing_email'),
    marketingPush: document.getElementById('ai_marketing_push'),
    saveBtn: document.getElementById('saveAccountInfo'),
    resetBtn: document.getElementById('resetAccountInfo'),
  };
const reviewFormEl = document.getElementById('reviewForm');
const reviewProductEl = document.getElementById('reviewProduct');
const reviewTypeEl = document.getElementById('reviewType');
const reviewTextEl = document.getElementById('reviewText');
const reviewMediaFileEl = document.getElementById('reviewMediaFile');
const submitReviewBtn = document.getElementById('submitReview');
const cancelReviewBtn = document.getElementById('cancelReview');
  const reviewPointsHintEl = document.getElementById('reviewPointsHint');
  const statsGrid = document.querySelector('#trackOrdersSection .stats-grid');
  const sectionTitleEl = document.querySelector('#trackOrdersSection .section-title');

  // Helper: always hide Beauty Profile unless specifically requested
  const hideBeautyProfile = () => {
    const bpEl = document.getElementById('beauty-profile');
    if (bpEl) bpEl.classList.add('hidden');
  };

  // ------- Wishlist helpers & rendering -------
  const readWishlist = () => {
    try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); } catch { return []; }
  };
  const writeWishlist = (list) => {
    localStorage.setItem('wishlist', JSON.stringify(list));
    if (typeof window.updateWishlistCount === 'function') {
      try { window.updateWishlistCount(); } catch (_) {}
    }
  };
  const removeFromWishlist = (id) => {
    const list = readWishlist();
    const idx = list.findIndex(x => String(x.id) === String(id));
    if (idx >= 0) {
      list.splice(idx, 1);
      writeWishlist(list);
      renderWishlist();
    }
  };
  const safeAddToCart = (prod) => {
    if (typeof window.addToCart === 'function') {
      try { window.addToCart(prod); return; } catch (_) {}
    }
    // Fallback local add-to-cart
    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('cart')) || []; } catch (_) { cart = []; }
    const existing = cart.find(i => String(i.id) === String(prod.id));
    if (existing) {
      existing.quantity = (parseInt(existing.quantity) || 0) + 1;
    } else {
      cart.push({ id: prod.id, name: prod.name, price: prod.price, image: prod.image, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof window.updateCartCount === 'function') {
      try { window.updateCartCount(); } catch (_) {}
    }
  };

  const renderWishlist = () => {
    const section = document.getElementById('wishListSection');
    if (!section) return;
    const emptyEl = section.querySelector('.wishlist-empty');
    let grid = section.querySelector('.wishlist-grid');
    const items = readWishlist();
    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'wishlist-grid';
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(220px, 1fr))';
      grid.style.gap = '16px';
      section.appendChild(grid);
    }
    grid.innerHTML = '';
    if (!items.length) {
      if (emptyEl) emptyEl.style.display = '';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    const normalizeImgPath = (src) => {
      let s = String(src || '');
      if (!s) return s;
      // Leave data URLs and http(s) untouched
      if (/^(data:|https?:)/i.test(s)) return s;
      // If starts with './', resolve under categories
      if (s.startsWith('./')) s = '/categories' + s.slice(1);
      // If relative without leading '/', anchor under categories
      else if (!s.startsWith('/')) s = '/categories/' + s;
      // Collapse duplicate '/categories/' segments
      s = s.replace(/\/(?:categories\/)+/i, '/categories/');
      return s;
    };

    items.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'wishlist-card';
      card.style.border = '1px solid var(--border-color, #333)';
      card.style.borderRadius = '10px';
      card.style.padding = '12px';
      card.style.background = 'rgba(255,255,255,0.03)';

      const img = document.createElement('img');
      const fromCategories = (typeof resolveProductThumb === 'function') ? resolveProductThumb(p.id) : '';
      let fallback = String(p.image || '');
      const chosen = fromCategories || fallback;
      img.src = normalizeImgPath(chosen);
      img.alt = p.name || 'Product';
      // Fallback if the chosen src fails to load
      img.onerror = () => {
        try {
          const catSrc = (typeof resolveProductThumb === 'function') ? resolveProductThumb(p.id) : '';
          const fb = normalizeImgPath(p.image || '');
          const next = normalizeImgPath(catSrc || fb || '/header_footer/images/LOGO.png');
          if (img.src !== next) img.src = next;
        } catch (_) {
          if (img.src !== '/header_footer/images/LOGO.png') img.src = '/header_footer/images/LOGO.png';
        }
      };
      img.style.width = '100%';
      img.style.height = '160px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '8px';

      const title = document.createElement('div');
      title.textContent = p.name || '';
      title.style.marginTop = '8px';
      title.style.fontWeight = '600';

      const meta = document.createElement('div');
      meta.textContent = `${p.brand ? p.brand + ' • ' : ''}${formatMoney(p.price)}`;
      meta.style.color = 'var(--color-text-medium)';
      meta.style.fontSize = '14px';
      meta.style.marginTop = '4px';

      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '8px';
      actions.style.marginTop = '10px';

      const moveBtn = document.createElement('button');
      moveBtn.className = 'btn primary';
      moveBtn.textContent = 'Move to Cart';
      moveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        safeAddToCart({ id: p.id, name: p.name, price: p.price, image: p.image });
        removeFromWishlist(p.id);
      });

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        removeFromWishlist(p.id);
      });

      actions.appendChild(moveBtn);
      actions.appendChild(removeBtn);

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(actions);
      grid.appendChild(card);
    });
  };

  const showHomeSections = () => {
    // Home view: show membership card, benefits, and wish list; hide track orders
    if (membershipCardSection) membershipCardSection.classList.remove('hidden');
    if (benefitsSection) benefitsSection.classList.remove('hidden');
    if (wishListSection) wishListSection.classList.remove('hidden');
    if (trackSection) trackSection.classList.add('hidden');
    hideBeautyProfile();
  };

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // Active link visual state
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Handle Track Orders view
      const view = link.dataset.view;
      if (view === 'track-orders' && trackSection) {
        // Hide the two sections below
        if (benefitsSection) benefitsSection.classList.add('hidden');
        if (wishListSection) wishListSection.classList.add('hidden');
        hideBeautyProfile();
        // Show track orders section
        if (trackSection) trackSection.classList.remove('hidden');
        // Keep membership card visible on Track Orders
        if (membershipCardSection) membershipCardSection.classList.remove('hidden');
        // Show stats grid and orders table; hide refunds table; set title
        if (statsGrid) statsGrid.classList.remove('hidden');
        if (ordersTableEl) ordersTableEl.classList.remove('hidden');
        if (refundsTableEl) refundsTableEl.classList.add('hidden');
        if (sectionTitleEl) sectionTitleEl.textContent = 'Track Orders';
        // Scroll to the orders section
        trackSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Handle Cancellation History view
      if (view === 'cancel-history' && trackSection) {
        // Hide non-essential sections
        if (benefitsSection) benefitsSection.classList.add('hidden');
        if (wishListSection) wishListSection.classList.add('hidden');
        hideBeautyProfile();
        // Show membership card and track section container
        if (membershipCardSection) membershipCardSection.classList.remove('hidden');
        trackSection.classList.remove('hidden');
        // Hide stats grid, show refunds table, hide orders table
        if (statsGrid) statsGrid.classList.add('hidden');
        if (ordersTableEl) ordersTableEl.classList.add('hidden');
        if (refundsTableEl) refundsTableEl.classList.remove('hidden');
        if (sectionTitleEl) sectionTitleEl.textContent = 'Cancellation History';
        // Set status to Cancel/Refund for consistency and apply current filters
        if (statusSelect) statusSelect.value = 'cancelRefund';
        applyFilters();
        // Scroll to the section
        trackSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Handle Wish List view: only show membership and Wish List
      if (view === 'wish-list') {
        if (membershipCardSection) membershipCardSection.classList.remove('hidden');
        if (wishListSection) wishListSection.classList.remove('hidden');
        if (trackSection) trackSection.classList.add('hidden');
        if (benefitsSection) benefitsSection.classList.add('hidden');
        hideBeautyProfile();
        renderWishlist();
        wishListSection && wishListSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Handle Coupons view: show Membership Card and Coupons section only
      if (view === 'coupons') {
        if (membershipCardSection) membershipCardSection.classList.remove('hidden');
        if (couponsSection) couponsSection.classList.remove('hidden');
        if (trackSection) trackSection.classList.add('hidden');
        if (benefitsSection) benefitsSection.classList.add('hidden');
        if (wishListSection) wishListSection.classList.add('hidden');
        if (reviewsSection) reviewsSection.classList.add('hidden');
        hideBeautyProfile();
        couponsSection && couponsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Handle Reviews view: show Membership Card and Reviews section only
      if (view === 'reviews') {
        if (membershipCardSection) membershipCardSection.classList.remove('hidden');
        if (reviewsSection) reviewsSection.classList.remove('hidden');
        if (trackSection) trackSection.classList.add('hidden');
        if (benefitsSection) benefitsSection.classList.add('hidden');
        if (wishListSection) wishListSection.classList.add('hidden');
        if (couponsSection) couponsSection.classList.add('hidden');
        if (accountInfoSection) accountInfoSection.classList.add('hidden');
        hideBeautyProfile();
        // Default to Writable tab
        tabs.forEach(t => t.classList.remove('active'));
        const writableTab = document.querySelector('#reviewsSection .tab[data-tab="writable"]');
        writableTab && writableTab.classList.add('active');
        if (reviewsWritableEl) reviewsWritableEl.classList.remove('hidden');
        if (reviewsMineEl) reviewsMineEl.classList.add('hidden');
        if (reviewFormEl) reviewFormEl.classList.add('hidden');
        reviewsSection && reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Handle Account Information view
      if (view === 'account-info') {
        if (membershipCardSection) membershipCardSection.classList.remove('hidden');
        if (accountInfoSection) accountInfoSection.classList.remove('hidden');
        if (trackSection) trackSection.classList.add('hidden');
        if (benefitsSection) benefitsSection.classList.add('hidden');
        if (wishListSection) wishListSection.classList.add('hidden');
        if (couponsSection) couponsSection.classList.add('hidden');
        if (reviewsSection) reviewsSection.classList.add('hidden');
        hideBeautyProfile();
        // Prefill form on open
        prefillAccountInfoForm(loadCurrentProfile());
        accountInfoSection && accountInfoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Clicking on Account title returns to Account home (no sections)
  if (els.accountName) {
    els.accountName.style.cursor = 'pointer';
    els.accountName.addEventListener('click', (e) => {
      e.preventDefault();
      // Clear active state in sidebar
      sidebarLinks.forEach(l => l.classList.remove('active'));
      // Show home sections as requested
      showHomeSections();
      renderWishlist();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- Orders data: load, render, filter, and update stats ----------
const ordersUrl = '/admin/orders.json';
const productsUrl = '/categories/full.json';
  const refundsUrl = '/admin/refunds.json';
  const customersUrl = '/admin/customers.json';
  const tableBody = document.querySelector('#ordersTable tbody');
  const refundsBody = document.querySelector('#refundsTable tbody');
  const ordersTableEl = document.getElementById('ordersTable');
  const refundsTableEl = document.getElementById('refundsTable');
  const statusSelect = document.getElementById('filterStatus');
  const dateStartEl = document.getElementById('dateStart');
  const dateEndEl = document.getElementById('dateEnd');
  const searchBtn = document.getElementById('searchOrders');
  const rangeBtns = document.querySelectorAll('.range-btn');
  // Coupons UI elements
  const couponInputEl = document.getElementById('couponInput');
  const registerCouponBtn = document.getElementById('registerCoupon');
  // Reviews state
  let currentReviewTarget = null; // { orderId, productName }
  let resolveProductThumb = (id) => '';

  let orders = [];
  let refunds = [];
  let customers = [];
  let currentCustomerId = null;

  // -------- Currency config & formatter --------
  const currencyCfg = {
    code: (localStorage.getItem('settings.currency') || 'USD').toUpperCase(),
    usdToVnd: Number(localStorage.getItem('settings.usdToVndRate') || '25000') || 25000
  };
  const formatMoney = (amount) => {
    const n = Number(amount || 0);
    if (currencyCfg.code === 'VND') {
      const vnd = Math.round(n * currencyCfg.usdToVnd);
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(vnd);
    }
    return `US$ ${n.toFixed(2)}`;
  };

  const normalizeStatus = (s) => {
    const t = String(s || '').toLowerCase();
    if (t === 'processing') return 'preparing';
    if (t === 'shipped') return 'transit';
    if (t === 'delivered') return 'delivered';
    // treat pending as purchase completed
    if (t === 'pending') return 'completed';
    return 'completed';
  };

  // Initial wishlist render on load
  renderWishlist();

  // -------- Reviews helpers & rendering --------
  const loadMyReviews = () => {
    try { return JSON.parse(localStorage.getItem('user.reviews') || '[]') || []; } catch { return []; }
  };

  // Deep link: support URL navigation to sections (track-orders, cancel-history, wish-list, coupons, reviews, benefits)
  function applyAccountDeepLink() {
    try {
      const params = new URLSearchParams(window.location.search);
      const hash = (window.location.hash || '').replace(/^#/, '');
      const view = params.get('view') || hash || '';

      const setActiveSidebar = (dataView) => {
        sidebarLinks.forEach(l => l.classList.toggle('active', l.dataset.view === dataView));
      };

      // Reset to home before switching
      const showOnly = (opts) => {
        // Hide all
        if (trackSection) trackSection.classList.add('hidden');
        if (benefitsSection) benefitsSection.classList.add('hidden');
        if (wishListSection) wishListSection.classList.add('hidden');
        if (couponsSection) couponsSection.classList.add('hidden');
        if (reviewsSection) reviewsSection.classList.add('hidden');
        if (accountInfoSection) accountInfoSection.classList.add('hidden');
        {
          const bpEl = document.getElementById('beauty-profile');
          if (bpEl) bpEl.classList.add('hidden');
        }
        // Always show membership card by default on section views
        if (membershipCardSection) membershipCardSection.classList.remove('hidden');
        // Apply options
        opts.track && trackSection && trackSection.classList.remove('hidden');
        opts.benefits && benefitsSection && benefitsSection.classList.remove('hidden');
        opts.wish && wishListSection && wishListSection.classList.remove('hidden');
        opts.coupons && couponsSection && couponsSection.classList.remove('hidden');
        opts.reviews && reviewsSection && reviewsSection.classList.remove('hidden');
        opts.accountInfo && accountInfoSection && accountInfoSection.classList.remove('hidden');
        if (opts.beauty) {
          const bpEl2 = document.getElementById('beauty-profile');
          if (bpEl2) bpEl2.classList.remove('hidden');
        }
        // Tables visibility for track/cancel history
        if (opts.trackCancel) {
          if (statsGrid) statsGrid.classList.add('hidden');
          if (ordersTableEl) ordersTableEl.classList.add('hidden');
          if (refundsTableEl) refundsTableEl.classList.remove('hidden');
          if (sectionTitleEl) sectionTitleEl.textContent = 'Cancellation History';
          if (statusSelect) statusSelect.value = 'cancelRefund';
          typeof applyFilters === 'function' && applyFilters();
        } else if (opts.track) {
          if (statsGrid) statsGrid.classList.remove('hidden');
          if (ordersTableEl) ordersTableEl.classList.remove('hidden');
          if (refundsTableEl) refundsTableEl.classList.add('hidden');
          if (sectionTitleEl) sectionTitleEl.textContent = 'Track Orders';
        }
      };

      switch (view) {
        case 'track-orders':
        case 'orders':
          setActiveSidebar('track-orders');
          showOnly({ track: true });
          trackSection && trackSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        case 'cancel-history':
          setActiveSidebar('cancel-history');
          showOnly({ track: true, trackCancel: true });
          trackSection && trackSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        case 'wish-list':
          setActiveSidebar('wish-list');
          showOnly({ wish: true });
          // Ensure wishlist is rendered after potential data loads
          renderWishlist();
          wishListSection && wishListSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        case 'coupons':
          setActiveSidebar('coupons');
          showOnly({ coupons: true });
          couponsSection && couponsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        case 'reviews':
          setActiveSidebar('reviews');
          showOnly({ reviews: true });
          // Default to Writable tab
          const tabsR = document.querySelectorAll('#reviewsSection .tab');
          tabsR.forEach(t => t.classList.remove('active'));
          const writableTab = document.querySelector('#reviewsSection .tab[data-tab="writable"]');
          writableTab && writableTab.classList.add('active');
          reviewsWritableEl && reviewsWritableEl.classList.remove('hidden');
          reviewsMineEl && reviewsMineEl.classList.add('hidden');
          reviewFormEl && reviewFormEl.classList.add('hidden');
          reviewsSection && reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        case 'beauty-profile':
          // Create the section lazily when the link/hash is used
          ensureBeautyProfileSection();
          // Show Membership Card + Beauty Profile only
          showOnly({ beauty: true });
          {
            const bpEl3 = document.getElementById('beauty-profile');
            bpEl3 && bpEl3.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          break;
        case 'benefits':
          // Show Membership Card + Benefits only
          sidebarLinks.forEach(l => l.classList.remove('active'));
          showOnly({ benefits: true });
          benefitsSection && benefitsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        case 'account-info':
          setActiveSidebar('account-info');
          showOnly({ accountInfo: true });
          prefillAccountInfoForm(loadCurrentProfile());
          accountInfoSection && accountInfoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        default:
          // Account home
          sidebarLinks.forEach(l => l.classList.remove('active'));
          showHomeSections();
          break;
      }
    } catch (err) {
      console.warn('applyAccountDeepLink warning:', err);
    }
  }

  applyAccountDeepLink();
  window.addEventListener('hashchange', applyAccountDeepLink);
  window.addEventListener('popstate', applyAccountDeepLink);
  const saveMyReviews = (list) => {
    localStorage.setItem('user.reviews', JSON.stringify(list || []));
  };
  const pointsForType = (t) => t === 'text' ? 0.15 : 0.3;
const deriveWritableReviews = () => {
    const myReviews = loadMyReviews();
    const reviewedKey = new Set(myReviews.map(r => `${r.orderId}::${r.productName}`));
    const scopeOrders = currentCustomerId ? orders.filter(o => o.customerId === currentCustomerId) : orders.slice();
    const deliveredOrders = scopeOrders.filter(o => normalizeStatus(o.status) === 'delivered');
    const items = [];
    deliveredOrders.forEach(o => {
      const prods = (o.items || o.products || []).filter(isProductItem);
      prods.forEach(it => {
        const key = `${o.id}::${it.name}`;
        if (!reviewedKey.has(key)) {
          items.push({ orderId: o.id, productName: it.name, productId: it.productId, orderDate: o.createdAt || o.orderDate || '' });
        }
      });
    });
    return items;
  };
const renderWritableList = (items, getThumb) => {
    getThumb = getThumb || resolveProductThumb;
    if (!writableListEl) return;
    writableListEl.innerHTML = '';
    if (!items.length) {
      const div = document.createElement('div');
      div.className = 'reviews-empty';
      div.innerHTML = `<p>No writable reviews at the moment.</p>`;
      writableListEl.appendChild(div);
      return;
    }
    items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'review-item';
      const thumb = getThumb ? getThumb(it.productId) : '';
      row.innerHTML = `
        ${thumb ? `<div class="thumb-wrap"><img class="review-thumb" src="${thumb}" alt="thumb"></div>` : ''}
        <div>
          <div class="title">${it.productName}</div>
          <div class="meta">Order #${it.orderId} • ${it.orderDate || '-'}</div>
        </div>
        <div class="actions"><button class="btn primary write-btn">Write Review</button></div>
      `;
      const btn = row.querySelector('.write-btn');
      btn.addEventListener('click', () => {
        currentReviewTarget = it;
        if (reviewProductEl) reviewProductEl.value = it.productName;
        if (reviewTypeEl) reviewTypeEl.value = 'text';
        if (reviewTextEl) reviewTextEl.value = '';
        if (reviewMediaFileEl) reviewMediaFileEl.value = '';
        if (reviewPointsHintEl) reviewPointsHintEl.textContent = `Estimated reward: ${pointsForType('text')} P`;
        if (reviewFormEl) reviewFormEl.classList.remove('hidden');
      });
      writableListEl.appendChild(row);
    });
  };
const renderMyReviews = (getThumb) => {
    getThumb = getThumb || resolveProductThumb;
    if (!myReviewsListEl || !myReviewsEmptyEl) return;
    const list = loadMyReviews();
    myReviewsListEl.innerHTML = '';
    if (!list.length) {
      myReviewsEmptyEl.classList.remove('hidden');
      return;
    }
    myReviewsEmptyEl.classList.add('hidden');
    list.forEach(r => {
      const row = document.createElement('div');
      row.className = 'review-item';
      const mediaHtml = r.mediaDataUrl ? (
        (String(r.mediaMimeType || '').startsWith('video'))
          ? `<video class="review-thumb" src="${r.mediaDataUrl}" controls></video>`
          : `<img class="review-thumb" src="${r.mediaDataUrl}" alt="uploaded" />`
      ) : (getThumb && r.productId ? `<img class="review-thumb" src="${getThumb(r.productId)}" alt="thumb" />` : '');
      row.innerHTML = `
        ${mediaHtml ? `<div class="thumb-wrap">${mediaHtml}</div>` : ''}
        <div>
          <div class="title">${r.productName}</div>
          <div class="meta">Order #${r.orderId} • ${r.createdAt || '-'} • ${r.type} • ${r.pointsAwarded} P</div>
        </div>
        <div class="actions">
          ${canEditReview(r) ? `<button class="btn edit-btn">Edit</button>` : ''}
          <button class="btn delete-btn">Delete</button>
        </div>
      `;
      const editBtn = row.querySelector('.edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          editingIndex = list.findIndex(x => x.orderId === r.orderId && x.productName === r.productName && x.createdAt === r.createdAt);
          currentReviewTarget = { orderId: r.orderId, productName: r.productName, productId: r.productId };
          if (reviewProductEl) reviewProductEl.value = r.productName;
          if (reviewTypeEl) reviewTypeEl.value = r.type || 'text';
          if (reviewTextEl) reviewTextEl.value = r.contentText || '';
          if (reviewMediaFileEl) reviewMediaFileEl.value = '';
          if (reviewPointsHintEl) reviewPointsHintEl.textContent = `Estimated reward: ${pointsForType(reviewTypeEl.value)} P`;
          if (reviewFormEl) reviewFormEl.classList.remove('hidden');
        });
      }
      row.querySelector('.delete-btn').addEventListener('click', () => {
        const after = loadMyReviews().filter(x => !(x.orderId === r.orderId && x.productName === r.productName));
        saveMyReviews(after);
        renderMyReviews();
        renderWritableList(deriveWritableReviews());
        updatePointsFromReviews();
      });
      myReviewsListEl.appendChild(row);
    });
    updatePointsFromReviews();
  };

  // Tabs switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const which = tab.dataset.tab;
      if (which === 'writable') {
        reviewsWritableEl && reviewsWritableEl.classList.remove('hidden');
        reviewsMineEl && reviewsMineEl.classList.add('hidden');
      } else {
        reviewsMineEl && reviewsMineEl.classList.remove('hidden');
        reviewsWritableEl && reviewsWritableEl.classList.add('hidden');
        reviewFormEl && reviewFormEl.classList.add('hidden');
        renderMyReviews();
      }
    });
  });

  // Review form actions
  if (submitReviewBtn) submitReviewBtn.addEventListener('click', async () => {
    if (!currentReviewTarget) return;
    const type = (reviewTypeEl && reviewTypeEl.value) || 'text';
    const text = (reviewTextEl && reviewTextEl.value) || '';
    let mediaDataUrl = '';
    let mediaMimeType = '';
    const file = reviewMediaFileEl && reviewMediaFileEl.files && reviewMediaFileEl.files[0];
    if (file) {
      mediaMimeType = file.type || '';
      mediaDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.readAsDataURL(file);
      });
    }
    const points = pointsForType(type);
    const list = loadMyReviews();
    if (editingIndex != null && editingIndex >= 0 && editingIndex < list.length && canEditReview(list[editingIndex])) {
      const target = list[editingIndex];
      target.type = type;
      target.contentText = text;
      if (mediaDataUrl) { target.mediaDataUrl = mediaDataUrl; target.mediaMimeType = mediaMimeType; }
      target.pointsAwarded = points;
      saveMyReviews(list);
    } else {
      const newReview = {
        orderId: currentReviewTarget.orderId,
        productName: currentReviewTarget.productName,
        productId: currentReviewTarget.productId,
        type,
        contentText: text,
        mediaDataUrl,
        mediaMimeType,
        pointsAwarded: points,
        createdAt: new Date().toISOString()
      };
      list.push(newReview);
      saveMyReviews(list);
    }
    // Reset UI
    currentReviewTarget = null;
    editingIndex = null;
    if (reviewFormEl) reviewFormEl.classList.add('hidden');
    renderWritableList(deriveWritableReviews());
    renderMyReviews();
    // Switch to My Reviews tab to show result
    const mineTab = document.querySelector('#reviewsSection .tab[data-tab="mine"]');
    tabs.forEach(t => t.classList.remove('active'));
    mineTab && mineTab.classList.add('active');
    reviewsMineEl && reviewsMineEl.classList.remove('hidden');
    reviewsWritableEl && reviewsWritableEl.classList.add('hidden');
  });
  if (cancelReviewBtn) cancelReviewBtn.addEventListener('click', () => {
    currentReviewTarget = null;
    if (reviewFormEl) reviewFormEl.classList.add('hidden');
  });
  if (reviewTypeEl) reviewTypeEl.addEventListener('change', () => {
    const type = reviewTypeEl.value;
    if (reviewPointsHintEl) reviewPointsHintEl.textContent = `Estimated reward: ${pointsForType(type)} P`;
  });
  // Browse products navigation
  browseBtns.forEach(btn => btn.addEventListener('click', () => {
    window.location.href = '/Best_Sellers/bestseller.html';
  }));

  // ---------- Account Information: load, prefill, save ----------
  const isValidEmail = (v) => /.+@.+\..+/.test(String(v||'').trim());
  const isValidPassword = (p) => !p || (typeof p === 'string' && p.length >= 8 && p.length <= 16);
  let currentProfileEmail = null;

  const readRegisteredUsers = () => {
    try { return JSON.parse(localStorage.getItem('auth.registeredUsers') || '[]') || []; } catch { return []; }
  };
  const writeRegisteredUsers = (list) => {
    localStorage.setItem('auth.registeredUsers', JSON.stringify(list || []));
  };
  const loadCurrentProfile = () => {
    const user = (window.Auth && typeof Auth.getUser === 'function') ? Auth.getUser() : {
      email: localStorage.getItem('user.email'),
      name: localStorage.getItem('user.name'),
    };
    const email = user && user.email;
    currentProfileEmail = email || null;
    const list = readRegisteredUsers();
    const match = email ? list.find(p => String(p.email).toLowerCase() === String(email).toLowerCase()) : null;
    if (match) return match;
    // Fallback profile from localStorage
    const nameLs = localStorage.getItem('user.name') || '';
    const [firstName='', lastName=''] = String(nameLs).split(' ');
    return {
      firstName, lastName,
      name: nameLs || `${firstName} ${lastName}`.trim(),
      email: email || '',
      password: '',
      ageGroup: localStorage.getItem('user.ageGroup') || '',
      language: localStorage.getItem('user.language') || '',
      birthMonth: Number(localStorage.getItem('user.birthMonth') || '0') || null,
      birthDay: Number(localStorage.getItem('user.birthDay') || '0') || null,
      gender: localStorage.getItem('user.gender') || '',
      referrer: localStorage.getItem('user.referrer') || '',
      marketing: {
        consent: localStorage.getItem('user.marketing.consent') === 'true',
        email: localStorage.getItem('user.marketing.email') === 'true',
        push: localStorage.getItem('user.marketing.push') === 'true',
      }
    };
  };
  const prefillAccountInfoForm = (profile) => {
    if (!aiForm || !profile) return;
    if (aiEls.first) aiEls.first.value = profile.firstName || '';
    if (aiEls.last) aiEls.last.value = profile.lastName || '';
    if (aiEls.email) aiEls.email.value = profile.email || '';
    if (aiEls.password) aiEls.password.value = '';
    if (aiEls.age) aiEls.age.value = profile.ageGroup || '';
    if (aiEls.lang) aiEls.lang.value = profile.language || '';
    if (aiEls.birthMonth) aiEls.birthMonth.value = profile.birthMonth || '';
    if (aiEls.birthDay) aiEls.birthDay.value = profile.birthDay || '';
    if (aiEls.gender) aiEls.gender.value = profile.gender || '';
    if (aiEls.referrer) aiEls.referrer.value = profile.referrer || '';
    if (aiEls.marketing) aiEls.marketing.checked = !!(profile.marketing && profile.marketing.consent);
    if (aiEls.marketingEmail) aiEls.marketingEmail.checked = !!(profile.marketing && profile.marketing.email);
    if (aiEls.marketingPush) aiEls.marketingPush.checked = !!(profile.marketing && profile.marketing.push);
  };

  const saveAccountInfo = () => {
    const first = (aiEls.first && aiEls.first.value || '').trim();
    const last = (aiEls.last && aiEls.last.value || '').trim();
    const email = (aiEls.email && aiEls.email.value || '').trim();
    const newPass = (aiEls.password && aiEls.password.value || '').trim();
    const age = (aiEls.age && aiEls.age.value || '').trim();
    const lang = (aiEls.lang && aiEls.lang.value || '').trim();
    const bMonth = aiEls.birthMonth && aiEls.birthMonth.value ? Number(aiEls.birthMonth.value) : null;
    const bDay = aiEls.birthDay && aiEls.birthDay.value ? Number(aiEls.birthDay.value) : null;
    const gender = (aiEls.gender && aiEls.gender.value || '').trim();
    const ref = (aiEls.referrer && aiEls.referrer.value || '').trim();
    const mkConsent = !!(aiEls.marketing && aiEls.marketing.checked);
    const mkEmail = !!(aiEls.marketingEmail && aiEls.marketingEmail.checked);
    const mkPush = !!(aiEls.marketingPush && aiEls.marketingPush.checked);

    if (!first) { aiEls.first && aiEls.first.focus(); alert('Please enter your first name.'); return; }
    if (!last) { aiEls.last && aiEls.last.focus(); alert('Please enter your last name.'); return; }
    if (!isValidEmail(email)) { aiEls.email && aiEls.email.focus(); alert('Please enter a valid email.'); return; }
    if (!isValidPassword(newPass)) { aiEls.password && aiEls.password.focus(); alert('Password must be 8–16 characters if provided.'); return; }
    if (!age) { aiEls.age && aiEls.age.focus(); alert('Please select your age group.'); return; }
    if (!lang) { aiEls.lang && aiEls.lang.focus(); alert('Please select your language.'); return; }

    const list = readRegisteredUsers();
    let profile = null;
    let idx = -1;
    if (currentProfileEmail) {
      idx = list.findIndex(p => String(p.email).toLowerCase() === String(currentProfileEmail).toLowerCase());
      if (idx >= 0) profile = list[idx];
    }
    if (!profile) {
      // Create if not exists
      profile = {};
      idx = list.length;
      list.push(profile);
    }

    profile.firstName = first;
    profile.lastName = last;
    profile.name = `${first} ${last}`.trim();
    profile.email = email;
    if (newPass) profile.password = newPass;
    profile.ageGroup = age;
    profile.language = lang;
    profile.birthMonth = bMonth;
    profile.birthDay = bDay;
    profile.gender = gender || null;
    profile.referrer = ref || null;
    profile.marketing = { consent: mkConsent, email: mkEmail, push: mkPush };

    writeRegisteredUsers(list);

    // Update auth + header name
    try {
      if (window.Auth && typeof Auth.setLogin === 'function') {
        Auth.setLogin({ email, name: profile.name, keepSignedIn: true });
      } else {
        localStorage.setItem('user.isLoggedIn', 'true');
        localStorage.setItem('user.email', email);
        localStorage.setItem('user.name', profile.name);
      }
    } catch {}

    // Update display name
    if (els.accountName) els.accountName.textContent = `${profile.name}'s Account`;
    alert('Account information updated.');
    currentProfileEmail = email;
    prefillAccountInfoForm(profile);
  };

  if (aiEls.saveBtn) aiEls.saveBtn.addEventListener('click', saveAccountInfo);
  if (aiEls.resetBtn) aiEls.resetBtn.addEventListener('click', () => prefillAccountInfoForm(loadCurrentProfile()));

  const displayStatusLabel = (norm) => {
    switch (norm) {
      case 'preparing': return 'Preparing Shipment';
      case 'transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'completed': return 'Purchase Completed';
      default: return 'Purchase Completed';
    }
  };

  const isProductItem = (item) => typeof item.productId !== 'undefined' || /foundation|palette|blush|primer|concealer|rouge|ysl|dior|chanel|gucci|pat mcgrath/i.test(item.name || '');

  // Tìm quyền review theo productId: chỉ cho phép nếu thuộc đơn hàng Delivered của khách hiện tại
  const ensureReviewEligibility = (productId) => {
    if (!productId) return null;
    const pid = String(productId);
    const scopeOrders = currentCustomerId ? orders.filter(o => o.customerId === currentCustomerId) : orders.slice();
    const deliveredOrders = scopeOrders.filter(o => normalizeStatus(o.status) === 'delivered');
    for (const o of deliveredOrders) {
      const prods = (o.items || o.products || []).filter(isProductItem);
      for (const it of prods) {
        if (String(it.productId) === pid) {
          return { orderId: o.id, productName: it.name, productId: it.productId, orderDate: o.createdAt || o.orderDate || '' };
        }
      }
    }
    return null;
  };

  const renderRows = (rows) => {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (!rows.length) {
      const tr = document.createElement('tr');
      tr.className = 'no-orders';
      const td = document.createElement('td');
      td.colSpan = 6;
      td.textContent = 'No orders found.';
      tr.appendChild(td);
      tableBody.appendChild(tr);
      return;
    }

    rows.forEach(o => {
      const tr = document.createElement('tr');

      const orderDate = o.createdAt || o.orderDate || '';
      const quantity = (o.items || o.products || []).reduce((sum, it) => sum + (isProductItem(it) ? Number(it.qty || it.quantity || 0) : 0), 0);
      const productNames = (o.items || o.products || []).filter(isProductItem).map(it => it.name).join(', ');
      const amount = typeof o.total !== 'undefined' ? o.total : o.totalAmount;
      const statusNorm = normalizeStatus(o.status);

      tr.innerHTML = `
        <td>${orderDate}</td>
        <td>${productNames || '-'}</td>
        <td>${quantity}</td>
        <td>${amount != null ? formatMoney(amount) : '-'}</td>
        <td>${displayStatusLabel(statusNorm)}</td>
        <td><a href="#" class="view-more">Details</a></td>
      `;
      tableBody.appendChild(tr);
    });
  };

  const renderRefundRows = (rows) => {
    if (!refundsBody) return;
    refundsBody.innerHTML = '';
    if (!rows.length) {
      const tr = document.createElement('tr');
      tr.className = 'no-orders';
      const td = document.createElement('td');
      td.colSpan = 6;
      td.textContent = 'No cancel/refund requests.';
      tr.appendChild(td);
      refundsBody.appendChild(tr);
      return;
    }

    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.id}</td>
        <td>${r.orderId}</td>
        <td>${r.reason || '-'}</td>
        <td>${r.status}</td>
        <td>${r.createdAt || '-'}</td>
        <td>${r.resolvedAt || '-'}</td>
      `;
      refundsBody.appendChild(tr);
    });
  };

  const withinRange = (dateStr, startStr, endStr) => {
    if (!startStr && !endStr) return true;
    const d = new Date(dateStr);
    if (startStr) {
      const s = new Date(startStr);
      if (d < s) return false;
    }
    if (endStr) {
      // include the whole end day
      const e = new Date(endStr);
      e.setHours(23,59,59,999);
      if (d > e) return false;
    }
    return true;
  };

  const applyFilters = () => {
    const statusVal = (statusSelect && statusSelect.value) || 'all';
    const startVal = dateStartEl && dateStartEl.value;
    const endVal = dateEndEl && dateEndEl.value;
    // scope to customer if available
    const scopeOrders = currentCustomerId ? orders.filter(o => o.customerId === currentCustomerId) : orders.slice();

    if (statusVal === 'cancelRefund') {
      // Show refunds table, hide orders table
      if (ordersTableEl) ordersTableEl.classList.add('hidden');
      if (refundsTableEl) refundsTableEl.classList.remove('hidden');

      // Join refunds with orders for customer scoping
      let scopeRefunds = refunds.slice();
      if (currentCustomerId) {
        const orderIdsForCustomer = new Set(scopeOrders.map(o => o.id));
        scopeRefunds = scopeRefunds.filter(r => orderIdsForCustomer.has(r.orderId));
      }
      const filteredRefunds = scopeRefunds.filter(r => withinRange(r.createdAt, startVal, endVal));
      renderRefundRows(filteredRefunds);
    } else {
      // Show orders table, hide refunds table
      if (refundsTableEl) refundsTableEl.classList.add('hidden');
      if (ordersTableEl) ordersTableEl.classList.remove('hidden');

      let filtered = scopeOrders;
      if (statusVal !== 'all') {
        filtered = filtered.filter(o => normalizeStatus(o.status) === statusVal);
      }
      filtered = filtered.filter(o => withinRange(o.createdAt || o.orderDate, startVal, endVal));
      renderRows(filtered);
    }
  };

  const setQuickRange = (code) => {
    const today = new Date();
    const end = new Date(today);
    let start = new Date(today);
    switch (code) {
      case '1w': start.setDate(start.getDate() - 7); break;
      case '1m': start.setMonth(start.getMonth() - 1); break;
      case '3m': start.setMonth(start.getMonth() - 3); break;
      case '6m': start.setMonth(start.getMonth() - 6); break;
      default: start.setMonth(start.getMonth() - 1);
    }
    const toISO = d => d.toISOString().slice(0,10);
    if (dateStartEl) dateStartEl.value = toISO(start);
    if (dateEndEl) dateEndEl.value = toISO(end);
  };

  const updateStats = () => {
    // scope to customer if available
    const scopeOrders = currentCustomerId ? orders.filter(o => o.customerId === currentCustomerId) : orders;
    const completed = scopeOrders.filter(o => !!(o.paidAt)).length; // paid orders
    const preparing = scopeOrders.filter(o => normalizeStatus(o.status) === 'preparing').length;
    const transit = scopeOrders.filter(o => normalizeStatus(o.status) === 'transit').length;
    const delivered = scopeOrders.filter(o => normalizeStatus(o.status) === 'delivered').length;
    let scopeRefunds = refunds;
    if (currentCustomerId) {
      const orderIdsForCustomer = new Set(scopeOrders.map(o => o.id));
      scopeRefunds = scopeRefunds.filter(r => orderIdsForCustomer.has(r.orderId));
    }
    const cancelRefund = scopeRefunds.length;

    byId('statCompleted').textContent = completed;
    byId('statPreparing').textContent = preparing;
    byId('statTransit').textContent = transit;
    byId('statDelivered').textContent = delivered;
    byId('statCancelRefund').textContent = cancelRefund;
  };

  const initFilters = () => {
    const hideNonOrderSections = () => {
      if (benefitsSection) benefitsSection.classList.add('hidden');
      if (wishListSection) wishListSection.classList.add('hidden');
    };

    if (searchBtn) searchBtn.addEventListener('click', () => {
      hideNonOrderSections();
      applyFilters();
    });
    if (statusSelect) statusSelect.addEventListener('change', applyFilters);
    rangeBtns.forEach(btn => btn.addEventListener('click', () => {
      // Chỉ đặt khoảng ngày nhanh; người dùng bấm Search để áp dụng lọc
      setQuickRange(btn.dataset.range);
    }));

    // Enter trong input ngày sẽ kích hoạt Search
    const handleEnter = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        hideNonOrderSections();
        applyFilters();
      }
    };
    if (dateStartEl) dateStartEl.addEventListener('keydown', handleEnter);
    if (dateEndEl) dateEndEl.addEventListener('keydown', handleEnter);
  };

  const boot = async () => {
    try {
      const results = await Promise.allSettled([
        fetch(ordersUrl),
        fetch(refundsUrl),
        fetch(customersUrl),
        fetch(productsUrl)
      ]);
      const toJson = async (res) => {
        try {
          if (!res || !res.ok) return null;
          return await res.json();
        } catch { return null; }
      };
      const ordersData = results[0].status === 'fulfilled' ? await toJson(results[0].value) : null;
      const refundsData = results[1].status === 'fulfilled' ? await toJson(results[1].value) : null;
      const customersData = results[2].status === 'fulfilled' ? await toJson(results[2].value) : null;
      const productsData = results[3].status === 'fulfilled' ? await toJson(results[3].value) : null;
      orders = Array.isArray(ordersData) ? ordersData : [];
      refunds = Array.isArray(refundsData) ? refundsData : [];
      customers = Array.isArray(customersData) ? customersData : [];

      let productIndex = {};
      try {
        const arr = (productsData && productsData.products) || [];
        arr.forEach(p => {
          const firstImg = (p.images && p.images[0]) || '';
          let normalized = '';
          if (firstImg) {
            if (firstImg.startsWith('http')) {
              normalized = firstImg;
            } else if (firstImg.startsWith('/')) {
              // Already absolute; keep as-is to avoid double prefix
              normalized = firstImg;
            } else if (firstImg.startsWith('./')) {
              normalized = `/categories${firstImg.slice(1)}`;
            } else {
              normalized = `/categories/${firstImg}`;
            }
          }
          productIndex[String(p.id)] = normalized;
        });
      } catch {}

      const getProductThumb = (id) => productIndex[String(id)] || '';
      resolveProductThumb = getProductThumb;

      // Determine current customer from localStorage
      const storedCustomerId = localStorage.getItem('user.customerId');
      const storedEmail = localStorage.getItem('user.email');
      if (storedCustomerId) {
        currentCustomerId = storedCustomerId;
      } else if (storedEmail && Array.isArray(customers)) {
        const match = customers.find(c => String(c.email).toLowerCase() === String(storedEmail).toLowerCase());
        if (match) currentCustomerId = match.id;
      }

      initFilters();
      setQuickRange('1m');
      updateStats();
      applyFilters();
      // Prepare reviews lists after data loads
      renderWritableList(deriveWritableReviews());
      renderMyReviews();
      // Re-render wishlist now that product thumbnails are available
      renderWishlist();
      updatePointsFromReviews();

      // Deep-link: nếu view=reviews & có productId, kiểm tra quyền và mở form nếu hợp lệ
      try {
        const params = new URLSearchParams(window.location.search || '');
        const viewParam = String(params.get('view') || '').toLowerCase();
        const tabParam = String(params.get('tab') || 'writable').toLowerCase();
        if (viewParam === 'reviews') {
          setActiveSidebar('reviews');
          showOnly({ reviews: true });
          const tabsR = document.querySelectorAll('#reviewsSection .tab');
          tabsR.forEach(t => t.classList.remove('active'));
          const targetTab = document.querySelector(`#reviewsSection .tab[data-tab="${tabParam === 'mine' ? 'mine' : 'writable'}"]`);
          targetTab && targetTab.classList.add('active');
          if (tabParam === 'mine') {
            reviewsMineEl && reviewsMineEl.classList.remove('hidden');
            reviewsWritableEl && reviewsWritableEl.classList.add('hidden');
            reviewFormEl && reviewFormEl.classList.add('hidden');
            renderMyReviews();
          } else {
            reviewsWritableEl && reviewsWritableEl.classList.remove('hidden');
            reviewsMineEl && reviewsMineEl.classList.add('hidden');
            reviewFormEl && reviewFormEl.classList.add('hidden');
          }

          const pid = params.get('productId');
          if (pid) {
            const eligible = ensureReviewEligibility(pid);
            if (eligible) {
              currentReviewTarget = eligible;
              if (reviewProductEl) reviewProductEl.value = eligible.productName;
              if (reviewTypeEl) reviewTypeEl.value = 'text';
              if (reviewTextEl) reviewTextEl.value = '';
              if (reviewMediaFileEl) reviewMediaFileEl.value = '';
              if (reviewPointsHintEl) reviewPointsHintEl.textContent = `Estimated reward: ${pointsForType('text')} P`;
              reviewFormEl && reviewFormEl.classList.remove('hidden');
              reviewFormEl && reviewFormEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              // Hiển thị cảnh báo nhẹ ở phần Writable
              const bannerHost = document.getElementById('reviewsWritable');
              if (bannerHost) {
                const warn = document.createElement('div');
                warn.className = 'review-banner';
                warn.innerHTML = '<div class="banner-emoji">🔒</div><div class="banner-text">Chỉ có thể viết đánh giá cho sản phẩm bạn đã mua (đã giao).</div>';
                bannerHost.insertBefore(warn, bannerHost.firstChild);
              }
              reviewFormEl && reviewFormEl.classList.add('hidden');
            }
          }
          reviewsSection && reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (e) {
        console.warn('Review deep-link handling warning:', e);
      }
    } catch (err) {
      console.error('Failed to load orders/refunds:', err);
      renderRows([]);
    }
  };

  boot();

  // Coupons: simple local registration handler (demo)
  if (registerCouponBtn) {
    registerCouponBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const code = (couponInputEl && couponInputEl.value || '').trim();
      const isValid = /^[0-9]{10,35}$/.test(code);
      if (!isValid) {
        alert('Vui lòng nhập mã hợp lệ gồm 10~35 chữ số (không dấu gạch).');
        return;
      }
      const current = Number(localStorage.getItem('user.couponsCount') || '0') || 0;
      const next = current + 1;
      localStorage.setItem('user.couponsCount', String(next));
      if (els.couponCount) els.couponCount.textContent = String(next);
      if (couponCountLabelEl) couponCountLabelEl.textContent = String(next);
      alert('Đã đăng ký coupon (demo).');
      if (couponInputEl) couponInputEl.value = '';
    });
  }
});
