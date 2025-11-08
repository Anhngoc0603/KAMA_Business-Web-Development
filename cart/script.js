document.addEventListener('DOMContentLoaded', function() {
  // ===== STATE =====
  // Đọc dữ liệu giỏ hàng thống nhất từ key 'cart', fallback từ 'cartItems' nếu có dữ liệu cũ
  let cartItems = [];
  const storedCart = localStorage.getItem('cart');
  const legacyCart = localStorage.getItem('cartItems');
  if (storedCart) {
    try {
      cartItems = JSON.parse(storedCart) || [];
    } catch (_) { cartItems = []; }
  } else if (legacyCart) {
    try {
      cartItems = JSON.parse(legacyCart) || [];
      // migrate sang key mới
      localStorage.setItem('cart', legacyCart);
      localStorage.removeItem('cartItems');
    } catch (_) { cartItems = []; }
  }
  let engravingName = JSON.parse(localStorage.getItem('engravingName')) || null;
  let discountPercent = JSON.parse(localStorage.getItem('discountPercent')) || 0;
  // Hỗ trợ giảm giá cố định (ví dụ LOYAL5 = $5)
  let discountFixed = JSON.parse(localStorage.getItem('discountFixed')) || 0;

  const ENGRAVING_FEE = 5; // $5
  const SHIPPING_FEE = 25;  // $25
  const FREE_SHIPPING_THRESHOLD = 80; // $80
  // Discount configuration flags
  // - APPLY_PERCENT_FIRST: when true, apply percentage discount before fixed amount; otherwise fixed first
  // - ALLOW_FIXED_OVER_PERCENT: when true, fixed discount can exceed remaining after percentage; otherwise capped to avoid negative total
  // - SHOW_SAVEUP_NEGATIVE: when true, render Save up as a negative number (e.g., - $12.50)
  const APPLY_PERCENT_FIRST = true;
  const ALLOW_FIXED_OVER_PERCENT = false;
  const SHOW_SAVEUP_NEGATIVE = true;

  // ===== ELEMENTS =====
  const provinceSelect = document.getElementById("province");
  const districtSelect = document.getElementById("district");
  const cartItemsEl = document.getElementById("cartItems");
  const emptyCartEl = document.getElementById("emptyCart");
  const subtotalEl = document.getElementById("subtotal");
  const shippingFeeEl = document.getElementById("shippingFee");
  const totalEl = document.getElementById("total");
  const discountRow = document.getElementById("discountRow");
  const discountEl = document.getElementById("discount");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const addEngravingBtn = document.getElementById("addEngravingBtn");
  const engraveNameInput = document.getElementById("engraveNameInput");
  const engravingDisplay = document.getElementById("engravingDisplay");
  const engravedNameEl = document.getElementById("engravedName");
  const removeEngravingBtn = document.getElementById("removeEngravingBtn");
  const engravingFeeRow = document.getElementById("engravingFeeRow");
  const engravingFeeEl = document.getElementById("engravingFee");
  const couponInput = document.getElementById("couponInput");
  const applyCouponBtn = document.getElementById("applyCouponBtn");
  const couponMessage = document.getElementById("couponMessage");
  const eligibleCouponsEl = document.getElementById("eligibleCoupons");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const progressBar = document.getElementById("progressBar");
  const freeShipLeftEl = document.getElementById('freeShipLeft');
  const itemCountTextEl = document.getElementById('itemCountText');
  const removeAllBtn = document.getElementById('removeAllBtn');
  // Upsell modal elements
  const upsellModal = document.getElementById('upsellModal');
  const upsellList = document.getElementById('upsellList');
  const upsellProceedBtn = document.getElementById('upsellProceedBtn');
  const upsellCloseBtn = document.getElementById('upsellCloseBtn');
  const upsellLeftAmountEl = document.getElementById('upsellLeftAmount');

  // ===== HELPER FUNCTIONS =====
  const formatCurrency = price => '$' + Number(price || 0).toFixed(2);

  function pickRandom(arr, count) {
    const copy = [...arr];
    const picked = [];
    while (copy.length && picked.length < count) {
      const idx = Math.floor(Math.random() * copy.length);
      picked.push(copy.splice(idx, 1)[0]);
    }
    return picked;
  }

  // ==== USER SEGMENT HELPERS ====
  function getUserProfile() {
    const firstLoginDone = JSON.parse(localStorage.getItem('user.firstLoginDone') || 'false');
    const orderCount = Number(localStorage.getItem('user.orderCount') || '0');
    const birthMonth = Number(localStorage.getItem('user.birthMonth') || '0'); // 1..12
    const lifetimeSpend = Number(localStorage.getItem('user.lifetimeSpend') || '0');
    return { firstLoginDone, orderCount, birthMonth, lifetimeSpend };
  }

  function setFirstLoginDone() {
    localStorage.setItem('user.firstLoginDone', 'true');
  }

  function evaluateCoupon(code) {
    const nowMonth = new Date().getMonth() + 1; // 1..12
    const profile = getUserProfile();
    const upper = (code || '').trim().toUpperCase();
    // Trả về { valid: boolean, type: 'percent'|'amount', value: number, message }
    if (upper === 'WELCOME10') {
      if (!profile.firstLoginDone) {
        return { valid: true, type: 'percent', value: 10, message: '✅ 10% for first login' };
      }
      return { valid: false, message: '❌ Chỉ áp dụng lần đăng nhập đầu tiên.' };
    }
    if (upper === 'FIRSTBUY15') {
      if (profile.orderCount === 0) {
        return { valid: true, type: 'percent', value: 15, message: '✅ 15% for first purchase' };
      }
      return { valid: false, message: '❌ Chỉ áp dụng cho đơn hàng đầu tiên.' };
    }
    if (upper === 'BDAY20') {
      if (profile.birthMonth && profile.birthMonth === nowMonth) {
        return { valid: true, type: 'percent', value: 20, message: '✅ 20% trong tháng sinh nhật' };
      }
      return { valid: false, message: '❌ Mã chỉ áp dụng trong tháng sinh nhật.' };
    }
    if (upper === 'LOYAL5') {
      if (profile.lifetimeSpend >= 100) {
        return { valid: true, type: 'amount', value: 5, message: '✅ $5 cho khách thân thiết (>=$100)' };
      }
      return { valid: false, message: '❌ Cần tổng chi tiêu ≥ $100 để áp dụng.' };
    }
    // Giữ lại mã cũ nếu có (NEW15 demo)
    if (upper === 'NEW15') {
      return { valid: true, type: 'percent', value: 15, message: "✅ 15% discount applied" };
    }
    return { valid: false, message: '❌ Mã không hợp lệ hoặc đã hết hạn.' };
  }

  const showMessage = (message, type = 'info') => {
    const colors = {
      success: '#16a34a',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1000;
      animation: slideInRight 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };
    
  // Thêm CSS cho animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // ===== PROVINCE / DISTRICT DATA =====
  const PROVINCE_DISTRICTS = {
    "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Đống Đa", "Hai Bà Trưng", "Cầu Giấy", "Tây Hồ", "Thanh Xuân", "Hà Đông", "Nam Từ Liêm", "Sóc Sơn"],
    "Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 5", "Quận 7", "Quận 10", "Tân Bình", "Bình Thạnh", "Gò Vấp", "Thủ Đức", "Bình Chánh"],
    "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ"],
    "Hải Phòng": ["Hồng Bàng", "Ngô Quyền", "Lê Chân", "Kiến An", "Dương Kinh", "Đồ Sơn", "Cát Hải"],
    "Cần Thơ": ["Ninh Kiều", "Cái Răng", "Bình Thủy", "Ô Môn", "Thốt Nốt", "Phong Điền"],
    "An Giang": ["Long Xuyên", "Châu Đốc", "Châu Thành"],
    "Bà Rịa - Vũng Tàu": ["Vũng Tàu", "Bà Rịa", "Phú Mỹ", "Xuyên Mộc"],
    "Bắc Giang": ["Bắc Giang", "Hiệp Hòa", "Lạng Giang"],
    "Bắc Kạn": ["Bắc Kạn", "Chợ Đồn", "Ba Bể"],
    "Bạc Liêu": ["Bạc Liêu", "Giá Rai", "Hồng Dân"],
    "Bắc Ninh": ["Bắc Ninh", "Từ Sơn", "Yên Phong"],
    "Bến Tre": ["Bến Tre", "Châu Thành", "Mỏ Cày Nam"],
    "Bình Định": ["Quy Nhơn", "An Nhơn", "Hoài Nhơn"],
    "Bình Dương": ["Thủ Dầu Một", "Dĩ An", "Thuận An", "Tân Uyên"],
    "Bình Phước": ["Đồng Xoài", "Phước Long", "Chơn Thành"],
    "Bình Thuận": ["Phan Thiết", "La Gi", "Hàm Thuận Bắc"],
    "Cà Mau": ["Cà Mau", "U Minh", "Năm Căn"],
    "Cao Bằng": ["Cao Bằng", "Bảo Lạc", "Hòa An"],
    "Đắk Lắk": ["Buôn Ma Thuột", "Buôn Hồ", "Cư M'gar"],
    "Đắk Nông": ["Gia Nghĩa", "Cư Jút", "Đắk Mil"],
    "Điện Biên": ["Điện Biên Phủ", "Mường Lay", "Điện Biên Đông"],
    "Đồng Nai": ["Biên Hòa", "Long Khánh", "Trảng Bom", "Long Thành"],
    "Đồng Tháp": ["Cao Lãnh", "Sa Đéc", "Hồng Ngự"],
    "Gia Lai": ["Pleiku", "An Khê", "Ayun Pa"],
    "Hà Giang": ["Hà Giang", "Đồng Văn", "Mèo Vạc"],
    "Hà Nam": ["Phủ Lý", "Duy Tiên", "Kim Bảng"],
    "Hà Tĩnh": ["Hà Tĩnh", "Hồng Lĩnh", "Kỳ Anh"],
    "Hải Dương": ["Hải Dương", "Chí Linh", "Kinh Môn"],
    "Hậu Giang": ["Vị Thanh", "Ngã Bảy", "Châu Thành"],
    "Hòa Bình": ["Hòa Bình", "Lương Sơn", "Mai Châu"],
    "Hưng Yên": ["Hưng Yên", "Mỹ Hào", "Văn Giang"],
    "Khánh Hòa": ["Nha Trang", "Cam Ranh", "Ninh Hòa", "Vạn Ninh"],
    "Kiên Giang": ["Rạch Giá", "Hà Tiên", "Phú Quốc", "Châu Thành"],
    "Kon Tum": ["Kon Tum", "Đắk Hà", "Ngọc Hồi"],
    "Lai Châu": ["Lai Châu", "Tam Đường", "Mường Tè"],
    "Lâm Đồng": ["Đà Lạt", "Bảo Lộc", "Đức Trọng", "Lạc Dương"],
    "Lạng Sơn": ["Lạng Sơn", "Cao Lộc", "Hữu Lũng"],
    "Lào Cai": ["Lào Cai", "Sa Pa", "Bảo Thắng"],
    "Long An": ["Tân An", "Kiến Tường", "Đức Hòa"],
    "Nam Định": ["Nam Định", "Hải Hậu", "Nghĩa Hưng"],
    "Nghệ An": ["Vinh", "Cửa Lò", "Hoàng Mai", "Diễn Châu"],
    "Ninh Bình": ["Ninh Bình", "Tam Điệp", "Hoa Lư"],
    "Ninh Thuận": ["Phan Rang - Tháp Chàm", "Ninh Hải", "Thuận Bắc"],
    "Phú Thọ": ["Việt Trì", "Phú Thọ", "Lâm Thao"],
    "Phú Yên": ["Tuy Hòa", "Sông Cầu", "Đông Hòa"],
    "Quảng Bình": ["Đồng Hới", "Ba Đồn", "Bố Trạch"],
    "Quảng Nam": ["Tam Kỳ", "Hội An", "Điện Bàn"],
    "Quảng Ngãi": ["Quảng Ngãi", "Đức Phổ", "Lý Sơn"],
    "Quảng Ninh": ["Hạ Long", "Cẩm Phả", "Uông Bí", "Móng Cái"],
    "Quảng Trị": ["Đông Hà", "Quảng Trị", "Gio Linh"],
    "Sóc Trăng": ["Sóc Trăng", "Vĩnh Châu", "Ngã Năm"],
    "Sơn La": ["Sơn La", "Mộc Châu", "Mai Sơn"],
    "Tây Ninh": ["Tây Ninh", "Trảng Bàng", "Hòa Thành"],
    "Thái Bình": ["Thái Bình", "Kiến Xương", "Thái Thụy"],
    "Thái Nguyên": ["Thái Nguyên", "Sông Công", "Phổ Yên"],
    "Thanh Hóa": ["Thanh Hóa", "Sầm Sơn", "Bỉm Sơn", "Nghi Sơn"],
    "Thừa Thiên Huế": ["Huế", "Hương Thủy", "Hương Trà"],
    "Tiền Giang": ["Mỹ Tho", "Gò Công", "Cái Bè"],
    "Trà Vinh": ["Trà Vinh", "Duyên Hải", "Càng Long"],
    "Tuyên Quang": ["Tuyên Quang", "Chiêm Hóa", "Hàm Yên"],
    "Vĩnh Long": ["Vĩnh Long", "Bình Minh", "Long Hồ"],
    "Vĩnh Phúc": ["Vĩnh Yên", "Phúc Yên", "Bình Xuyên"],
    "Yên Bái": ["Yên Bái", "Nghĩa Lộ", "Văn Chấn"]
  };

  // ===== INIT DROPDOWN, TÍNH TOÁN, RENDER CART, ETC. =====
  
  function initProvinceDropdown() {
    provinceSelect.innerHTML = '<option value="">Select Province/City</option>';
    districtSelect.innerHTML = '<option value="">Select District</option>';

    Object.keys(PROVINCE_DISTRICTS).sort().forEach(province => {
      const option = document.createElement("option");
      option.value = province;
      option.textContent = province;
      provinceSelect.appendChild(option);
    });
  }

  function isSaleItem(item) {
    const price = Number(item.price || 0);
    const original = Number(item.originalPrice || 0);
    return (
      (original && original > price) ||
      item.isOnSale === true ||
      item.sale === true ||
      item.onSale === true
    );
  }

  function calculateTotals() {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const engravingFee = engravingName ? ENGRAVING_FEE : 0;
    const subPlusEngraving = subtotal + engravingFee;
    const shipping = subPlusEngraving > 0 && subPlusEngraving < FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
    // Apply discounts on full subtotal with configurable order and capping
    const percentValue = Math.max(Number(discountPercent) || 0, 0);
    const fixedValue = Math.max(Number(discountFixed) || 0, 0);
    let percentDeduction = 0;
    let fixedDeduction = 0;
    if (APPLY_PERCENT_FIRST) {
      percentDeduction = Math.round((subtotal * percentValue / 100) * 100) / 100;
      const remaining = Math.max(subtotal - percentDeduction, 0);
      fixedDeduction = ALLOW_FIXED_OVER_PERCENT ? fixedValue : Math.min(fixedValue, remaining);
    } else {
      fixedDeduction = fixedValue;
      const remainingForPercent = Math.max(subtotal - fixedDeduction, 0);
      percentDeduction = Math.round((remainingForPercent * percentValue / 100) * 100) / 100;
    }
    const discountAmount = Math.round((percentDeduction + fixedDeduction) * 100) / 100;
    const total = Math.round((subPlusEngraving - discountAmount + shipping) * 100) / 100;

    return { subtotal, engravingFee, subPlusEngraving, shipping, discountAmount, total };
  }
  
  function renderCart() {
    cartItemsEl.innerHTML = "";
    // Chuẩn hoá cấu trúc qty/quantity trước khi render
    cartItems = cartItems.map(item => ({
      ...item,
      quantity: typeof item.quantity === 'number' ? item.quantity : (typeof item.qty === 'number' ? item.qty : 1)
    }));

    if (cartItems.length === 0) {
      emptyCartEl.style.display = "block";
      subtotalEl.textContent = formatCurrency(0);
      shippingFeeEl.textContent = formatCurrency(0);
      totalEl.textContent = formatCurrency(0);
      engravingFeeRow.style.display = "none";
      discountRow.style.display = "none";
      progressBar.style.width = '0%';
      if (itemCountTextEl) itemCountTextEl.textContent = '0 items';
      return;
    }

    emptyCartEl.style.display = "none";
    if (itemCountTextEl) itemCountTextEl.textContent = `${cartItems.length} item${cartItems.length>1?'s':''}`;

    // Tạo danh sách đường dẫn ảnh fallback để đảm bảo hiển thị đúng
    const resolveImageCandidates = (p) => {
      const logo = '/header_footer/images/LOGO.png';
      if (!p) return [logo];
      // URL tuyệt đối hoặc data URI
      if (/^(https?:\/\/|data:|\/)/.test(p)) return [p];
      // ../images/... → thường từ Sale/view_product
      if (p.startsWith('../images/')) {
        const file = p.replace(/^\.\.\/images\//, '');
        return [
          '/Sale/images/' + file,
          '/categories/images/' + file,
          '/Best_Sellers/images/' + file,
          logo
        ];
      }
      // ./images/... hoặc images/...
      if (p.startsWith('./images/')) {
        const file = p.replace(/^\.\/images\//, '');
        return [
          '/Best_Sellers/images/' + file,
          '/categories/images/' + file,
          '/Sale/images/' + file,
          logo
        ];
      }
      if (p.startsWith('images/')) {
        const file = p.replace(/^images\//, '');
        return [
          '/Sale/images/' + file,
          '/categories/images/' + file,
          '/Best_Sellers/images/' + file,
          logo
        ];
      }
      return [p, logo];
    };

    cartItems.forEach(item => {
      const div = document.createElement("div");
      div.className = "cart-item";
      const rawImg = item.image || (Array.isArray(item.images) ? item.images[0] : '') || '/header_footer/images/LOGO.png';
      const imgCandidates = resolveImageCandidates(rawImg);
      const shade = item.selectedShade || item.color || item.variant || '';
      const shadeLabel = shade ? `<div class="cart-item-meta">Shade/Color: ${shade}</div>` : '';

      div.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          ${shadeLabel}
          <div class="cart-item-price-qty">${formatCurrency(item.price)} × ${item.quantity}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" data-id="${item.id}" data-change="-1">-</button>
          <span style="margin:0 10px; font-weight:600;">${item.quantity}</span>
          <button class="qty-btn" data-id="${item.id}" data-change="1">+</button>
        </div>
      `;
      cartItemsEl.appendChild(div);

      // Ảnh với fallback tuần tự
      const imgEl = document.createElement('img');
      imgEl.className = 'cart-item-img';
      imgEl.alt = item.name;
      let idx = 0;
      const tryNext = () => {
        if (idx >= imgCandidates.length) return;
        imgEl.src = imgCandidates[idx++];
      };
      imgEl.addEventListener('error', tryNext);
      tryNext();
      div.insertBefore(imgEl, div.firstChild);
    });

    updateTotals();
  }

  function changeQuantity(id, change) {
    const item = cartItems.find(i => String(i.id) === String(id));
    if (item) {
      const prevQty = item.quantity;
      item.quantity += change;
      
      if (item.quantity <= 0) {
        cartItems = cartItems.filter(i => String(i.id) !== String(id));
        showMessage(`Removed ${item.name} from cart.`, "warning");
      } else if (change > 0) {
        showMessage(`Added one more ${item.name}!`, "success");
      } else if (prevQty > 1) {
        showMessage(`Reduced quantity of ${item.name}.`, "info");
      }
      
      renderCart();
      saveToLocalStorage();
    }
  }

  function updateTotals() {
    const { subtotal, engravingFee, subPlusEngraving, shipping, discountAmount, total } = calculateTotals();

    subtotalEl.textContent = formatCurrency(subtotal);

    if (engravingName) {
      engravingFeeEl.textContent = formatCurrency(engravingFee);
      engravingFeeRow.style.display = "flex";
    } else {
      engravingFeeRow.style.display = "none";
    }

    shippingFeeEl.textContent = shipping === 0 && subPlusEngraving > 0 ? "Free" : formatCurrency(shipping);

    // Always show Save up row; render negative sign if configured
    discountRow.style.display = "flex";
    if (SHOW_SAVEUP_NEGATIVE && discountAmount > 0) {
      discountEl.textContent = '- ' + formatCurrency(discountAmount);
    } else {
      discountEl.textContent = formatCurrency(discountAmount);
    }
    // Toggle color classes based on saving amount
    if (discountAmount > 0) {
      discountEl.classList.add('saveup-positive');
      discountEl.classList.remove('saveup-zero');
    } else {
      discountEl.classList.add('saveup-zero');
      discountEl.classList.remove('saveup-positive');
    }

    totalEl.textContent = formatCurrency(total);

    const progressPercent = Math.min((subPlusEngraving / FREE_SHIPPING_THRESHOLD) * 100, 100);
    progressBar.style.width = `${progressPercent}%`;
    if (freeShipLeftEl) {
      const leftAmount = Math.max(FREE_SHIPPING_THRESHOLD - subPlusEngraving, 0);
      freeShipLeftEl.textContent = formatCurrency(leftAmount);
    }

    // Update eligible coupon suggestions
    updateEligibleCoupons();
  }

  function updateEligibleCoupons() {
    if (!eligibleCouponsEl) return;
    const codes = ["WELCOME10", "FIRSTBUY15", "BDAY20", "LOYAL5"];
    const suggestions = [];
    codes.forEach(code => {
      const res = evaluateCoupon(code);
      if (res.valid) {
        suggestions.push({ code, message: res.message });
      }
    });
    if (suggestions.length === 0) {
      eligibleCouponsEl.innerHTML = "";
      return;
    }
    eligibleCouponsEl.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
        <span style="font-size:13px; color:#6B4C3B; opacity:0.8;">Mã phù hợp:</span>
        ${suggestions.map(s => `
          <button data-code="${s.code}" style="padding:6px 10px; border:none; border-radius:16px; background:#E6A6B0; color:#fff; cursor:pointer; font-size:13px;">${s.code}</button>
        `).join("")}
      </div>
    `;
    eligibleCouponsEl.querySelectorAll('button[data-code]').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        couponInput.value = code;
        applyCouponBtn.click();
      });
    });
  }

  // ===== UPSELL MODAL =====
  async function renderUpsellSuggestions() {
    if (!upsellList) return;
    // Update left-to-free-shipping text
    const { subPlusEngraving } = calculateTotals();
    const left = Math.max(FREE_SHIPPING_THRESHOLD - subPlusEngraving, 0);
    if (upsellLeftAmountEl) upsellLeftAmountEl.textContent = formatCurrency(left);
    // Clarify message when already eligible for free shipping
    const upsellSubEl = document.querySelector('.upsell-sub');
    if (upsellSubEl) {
      if (left <= 0) {
        if (!upsellSubEl.dataset.originalHtml) {
          upsellSubEl.dataset.originalHtml = upsellSubEl.innerHTML;
        }
        upsellSubEl.textContent = 'You already qualify for Free Shipping.';
      } else if (upsellSubEl.dataset.originalHtml) {
        upsellSubEl.innerHTML = upsellSubEl.dataset.originalHtml;
        if (upsellLeftAmountEl) upsellLeftAmountEl.textContent = formatCurrency(left);
      }
    }

    try {
      const res = await fetch('../Best_Sellers/full.json');
      const data = await res.json();
      const products = data.products || [];
      const samples = pickRandom(products, 3);
      upsellList.innerHTML = samples.map(p => {
        const imgRel = (Array.isArray(p.images) && p.images[0]) ? p.images[0] : '/header_footer/images/LOGO.png';
        const imgPath = imgRel.startsWith('./') ? ('../Best_Sellers' + imgRel.slice(1)) : ('../Best_Sellers/' + imgRel.replace(/^\/+/, ''));
        return `
          <div class="upsell-card">
            <img src="${imgPath}" alt="${p.name}" onerror="this.src='/header_footer/images/LOGO.png'" />
            <div class="upsell-info">
              <div class="upsell-name">${p.name}</div>
              <div class="upsell-price">${formatCurrency(p.price)}</div>
            </div>
            <button class="upsell-add" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-img="${imgPath}">Add</button>
          </div>
        `;
      }).join('');

      upsellList.querySelectorAll('.upsell-add').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = Number(btn.getAttribute('data-id'));
          const name = btn.getAttribute('data-name');
          const price = Number(btn.getAttribute('data-price'));
          const image = btn.getAttribute('data-img');
          const existing = cartItems.find(i => i.id === id);
          if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
          } else {
            cartItems.push({ id, name, price, quantity: 1, image });
          }
          renderCart();
          try { localStorage.setItem('cart', JSON.stringify(cartItems)); } catch (_) {}
          renderUpsellSuggestions();
          showMessage('+1 item in cart', 'success');
          if (typeof window.showAddToCartMessage === 'function') {
            window.showAddToCartMessage();
          }
        });
      });
    } catch (e) {
      upsellList.innerHTML = '<p style="padding:12px;">Unable to load suggestions.</p>';
    }
  }

  function openUpsellModal() {
    if (!upsellModal) return performCheckout();
    upsellModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderUpsellSuggestions();
  }

  function closeUpsellModal() {
    if (!upsellModal) return;
    upsellModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ===== INITIALIZE =====
  function initialize() {
    // Load from localStorage and debug initial state
    console.log('Initial cart from localStorage:', JSON.parse(localStorage.getItem('cart')) || []);
    const savedCart = localStorage.getItem('cart');
    const savedEngraving = localStorage.getItem('engravingName');
    const savedDiscount = localStorage.getItem('discountPercent');
    const savedShipping = localStorage.getItem('shippingInfo');

    if (savedCart) {
      try { cartItems = JSON.parse(savedCart) || []; } catch (_) {}
    }
    if (savedEngraving) engravingName = JSON.parse(savedEngraving);
    if (savedDiscount) discountPercent = JSON.parse(savedDiscount);
    if (savedShipping) {
      const shippingInfo = JSON.parse(savedShipping);
      document.getElementById('fullname').value = shippingInfo.fullname || '';
      document.getElementById('phone').value = shippingInfo.phone || '';
      document.getElementById('address').value = shippingInfo.address || '';
      provinceSelect.value = shippingInfo.province || '';
      if (shippingInfo.province) {
        const districts = PROVINCE_DISTRICTS[shippingInfo.province] || [];
        districtSelect.innerHTML = '<option value="">Select District</option>';
        districts.sort().forEach(d => {
          const option = document.createElement('option');
          option.value = d;
          option.textContent = d;
          districtSelect.appendChild(option);
        });
        districtSelect.disabled = districts.length === 0;
        districtSelect.value = shippingInfo.district || '';
      }
    }

    // Save to localStorage function
    function saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      localStorage.setItem('engravingName', JSON.stringify(engravingName));
      localStorage.setItem('discountPercent', JSON.stringify(discountPercent));
      localStorage.setItem('discountFixed', JSON.stringify(discountFixed));
      const shippingInfo = {
        fullname: document.getElementById('fullname')?.value.trim() || '',
        phone: document.getElementById('phone')?.value.trim() || '',
        province: provinceSelect.value || '',
        district: districtSelect.value || '',
        address: document.getElementById('address')?.value.trim() || '',
      };
      localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
    }

    initProvinceDropdown();
    engravingDisplay.style.display = engravingName ? 'flex' : 'none';
    engravedNameEl.textContent = engravingName || '';
    engravingFeeRow.style.display = engravingName ? 'flex' : 'none';
    // Always show Save up row at init; will update content via updateTotals
    discountRow.style.display = 'flex';
    couponMessage.classList.add('hidden');

    // Event Listeners
    cartItemsEl.addEventListener('click', function(e) {
      if (e.target.classList.contains('qty-btn')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        const change = parseInt(e.target.getAttribute('data-change'));
        changeQuantity(id, change);
        saveToLocalStorage();
      }
    });

    provinceSelect.addEventListener('change', function() {
      districtSelect.innerHTML = '<option value="">Select District</option>';
      const districts = PROVINCE_DISTRICTS[this.value] || [];
      districts.sort().forEach(d => {
        const option = document.createElement('option');
        option.value = d;
        option.textContent = d;
        districtSelect.appendChild(option);
      });
      districtSelect.disabled = districts.length === 0;
      updateTotals();
      saveToLocalStorage();
    });

    districtSelect.addEventListener('change', function() {
      updateTotals();
      saveToLocalStorage();
    });

    addEngravingBtn.addEventListener('click', function() {
      const name = engraveNameInput.value.trim();
      if (!name) return showMessage('Please enter a name for engraving!', 'error');
      engravingName = name;
      engravedNameEl.textContent = name;
      engravingDisplay.style.display = 'flex';
      engraveNameInput.value = '';
      updateTotals();
      saveToLocalStorage();
      showMessage(`Engraving service added for "${name}"!`, 'success');
    });

    removeEngravingBtn.addEventListener('click', function() {
      engravingName = null;
      engravingDisplay.style.display = 'none';
      updateTotals();
      saveToLocalStorage();
      showMessage('Engraving service removed.', 'warning');
    });

    applyCouponBtn.addEventListener('click', function() {
      const code = couponInput.value.trim().toUpperCase();
      const result = evaluateCoupon(code);
      if (result.valid) {
        if (result.type === 'percent') {
          discountPercent = result.value;
          discountFixed = 0;
        } else {
          discountPercent = 0;
          discountFixed = result.value;
        }
        couponMessage.textContent = result.message;
        couponMessage.style.color = '#16a34a';
        showMessage(`Coupon '${code}' applied successfully!`, 'success');
        // Đánh dấu lần đăng nhập đầu tiên sau khi dùng WELCOME10
        if (code === 'WELCOME10') setFirstLoginDone();
      } else {
        discountPercent = 0;
        discountFixed = 0;
        couponMessage.textContent = result.message;
        couponMessage.style.color = '#ef4444';
        showMessage(result.message, 'error');
      }
      couponMessage.classList.remove('hidden');
      updateTotals();
      saveToLocalStorage();
    });

    clearCartBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear the entire cart?')) {
        cartItems = [];
        engravingName = null;
        engravingDisplay.style.display = 'none';
        discountPercent = 0;
        discountFixed = 0;
        couponMessage.classList.add('hidden');
        couponInput.value = '';
        localStorage.removeItem('cart');
        localStorage.removeItem('engravingName');
        localStorage.removeItem('discountPercent');
        localStorage.removeItem('discountFixed');
        localStorage.removeItem('shippingInfo');
        renderCart();
        showMessage('Cart cleared successfully!', 'success');
      }
    });

    if (upsellCloseBtn) {
      upsellCloseBtn.addEventListener('click', () => closeUpsellModal());
    }

    if (removeAllBtn) {
      removeAllBtn.addEventListener('click', function() {
        clearCartBtn.click();
      });
    }

    function performCheckout(skipValidation = false) {
      const fullname = document.getElementById('fullname')?.value.trim();
      const phone = document.getElementById('phone')?.value.trim();
      const province = provinceSelect.value;
      const district = districtSelect.value;
      const address = document.getElementById('address')?.value.trim();

      if (!skipValidation) {
        if (cartItems.length === 0) return showMessage('Your cart is empty!', 'error');
        if (!fullname) return showMessage('Please enter full name!', 'error');
        if (!phone) return showMessage('Please enter phone number!', 'error');
        if (!province) return showMessage('Please select a province/city!', 'error');
        if (!district) return showMessage('Please select a district!', 'error');
        if (!address) return showMessage('Please enter detailed address!', 'error');
      }

      saveToLocalStorage();

      const truckOverlay = document.getElementById('truckAnimation');
      truckOverlay.classList.remove('hidden');
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        if (typeof window.navigateToRoot === 'function') {
          window.navigateToRoot('/checkout/checkout.html');
        } else {
          // Fallback: điều hướng tương đối từ trang cart sang checkout (hoạt động cả http và file://)
          const target = new URL('../checkout/checkout.html', window.location.href);
          window.location.href = target.href;
        }
      }, 1800);
    }

    checkoutBtn.addEventListener('click', function() {
      // Always show upsell modal first per desired flow
      openUpsellModal();
    });

    if (upsellProceedBtn) {
      upsellProceedBtn.addEventListener('click', function() {
        console.log('[Cart] Upsell proceed clicked');
        closeUpsellModal();
        // Bỏ qua kiểm tra form ở cart; thu thập thông tin tại trang checkout
        performCheckout(true);
      });
    }


    renderCart();

    // Toggle Shipping panel via top bar "Change"
    const toggleShippingPanelBtn = document.getElementById('toggleShippingPanel');
    const shippingPanel = document.getElementById('shippingPanel');
    if (toggleShippingPanelBtn && shippingPanel) {
      toggleShippingPanelBtn.addEventListener('click', () => {
        const isHidden = shippingPanel.style.display === 'none' || shippingPanel.style.display === '';
        shippingPanel.style.display = isHidden ? 'block' : 'none';
        // Scroll into view when opening
        if (!isHidden) return;
        setTimeout(() => shippingPanel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      });
    }
  }

  // BẮT ĐẦU CHẠY
  initialize();
});
