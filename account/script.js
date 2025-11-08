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

  const showHomeSections = () => {
    // Home view: show membership card, benefits, and wish list; hide track orders
    if (membershipCardSection) membershipCardSection.classList.remove('hidden');
    if (benefitsSection) benefitsSection.classList.remove('hidden');
    if (wishListSection) wishListSection.classList.remove('hidden');
    if (trackSection) trackSection.classList.add('hidden');
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
        // Default to Writable tab
        tabs.forEach(t => t.classList.remove('active'));
        const writableTab = document.querySelector('#reviewsSection .tab[data-tab="writable"]');
        writableTab && writableTab.classList.add('active');
        if (reviewsWritableEl) reviewsWritableEl.classList.remove('hidden');
        if (reviewsMineEl) reviewsMineEl.classList.add('hidden');
        if (reviewFormEl) reviewFormEl.classList.add('hidden');
        reviewsSection && reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        // Always show membership card by default on section views
        if (membershipCardSection) membershipCardSection.classList.remove('hidden');
        // Apply options
        opts.track && trackSection && trackSection.classList.remove('hidden');
        opts.benefits && benefitsSection && benefitsSection.classList.remove('hidden');
        opts.wish && wishListSection && wishListSection.classList.remove('hidden');
        opts.coupons && couponsSection && couponsSection.classList.remove('hidden');
        opts.reviews && reviewsSection && reviewsSection.classList.remove('hidden');
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
        case 'benefits':
          // Show Membership Card + Benefits only
          sidebarLinks.forEach(l => l.classList.remove('active'));
          showOnly({ benefits: true });
          benefitsSection && benefitsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      const [ordersRes, refundsRes, customersRes, productsRes] = await Promise.all([
        fetch(ordersUrl),
        fetch(refundsUrl),
        fetch(customersUrl),
        fetch(productsUrl)
      ]);
      orders = await ordersRes.json();
      refunds = await refundsRes.json();
      customers = await customersRes.json();
      const productsData = await productsRes.json();

      let productIndex = {};
      try {
        const arr = (productsData && productsData.products) || [];
        arr.forEach(p => {
          const firstImg = (p.images && p.images[0]) || '';
          const normalized = firstImg.startsWith('./') ? `/categories${firstImg.slice(1)}` : `/categories/${firstImg}`;
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
