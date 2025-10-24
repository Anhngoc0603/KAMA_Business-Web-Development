document.addEventListener('DOMContentLoaded', function() {
  // ===== STATE =====
  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  let engravingName = JSON.parse(localStorage.getItem('engravingName')) || null;
  let discountPercent = JSON.parse(localStorage.getItem('discountPercent')) || 0;

  const ENGRAVING_FEE = 5; // $5
  const SHIPPING_FEE = 3;  // $3
  const FREE_SHIPPING_THRESHOLD = 50; // $50

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
  const clearCartBtn = document.getElementById("clearCartBtn");
  const progressBar = document.getElementById("progressBar");

  // ===== HELPER FUNCTIONS =====
  const formatCurrency = price => '$' + price.toFixed(2);

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

  function calculateTotals() {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const engravingFee = engravingName ? ENGRAVING_FEE : 0;
    const subPlusEngraving = subtotal + engravingFee;
    const shipping = subPlusEngraving > 0 && subPlusEngraving < FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
    const discountAmount = Math.round((subPlusEngraving * discountPercent / 100) * 100) / 100;
    const total = Math.round((subPlusEngraving - discountAmount + shipping) * 100) / 100;

    return { subtotal, engravingFee, subPlusEngraving, shipping, discountAmount, total };
  }
  
  function renderCart() {
    cartItemsEl.innerHTML = "";

    if (cartItems.length === 0) {
      emptyCartEl.style.display = "block";
      subtotalEl.textContent = formatCurrency(0);
      shippingFeeEl.textContent = formatCurrency(0);
      totalEl.textContent = formatCurrency(0);
      engravingFeeRow.style.display = "none";
      discountRow.style.display = "none";
      progressBar.style.width = '0%';
      return;
    }

    emptyCartEl.style.display = "none";

    cartItems.forEach(item => {
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatCurrency(item.price)} x ${item.quantity}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" data-id="${item.id}" data-change="-1">-</button>
          <span style="margin:0 10px; font-weight:600;">${item.quantity}</span>
          <button class="qty-btn" data-id="${item.id}" data-change="1">+</button>
        </div>
      `;
      cartItemsEl.appendChild(div);
    });

    updateTotals();
  }

  function changeQuantity(id, change) {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      const prevQty = item.quantity;
      item.quantity += change;
      
      if (item.quantity <= 0) {
        cartItems = cartItems.filter(i => i.id !== id);
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

    if (discountPercent > 0) {
      discountRow.style.display = "flex";
      discountEl.textContent = `-${formatCurrency(discountAmount)}`;
    } else {
      discountRow.style.display = "none";
    }

    totalEl.textContent = formatCurrency(total);

    const progressPercent = Math.min((subPlusEngraving / FREE_SHIPPING_THRESHOLD) * 100, 100);
    progressBar.style.width = `${progressPercent}%`;
  }

  // ===== INITIALIZE =====
  function initialize() {
    // Load from localStorage and debug initial state
    console.log('Initial cartItems from localStorage:', JSON.parse(localStorage.getItem('cartItems')) || []);
    const savedCart = localStorage.getItem('cartItems');
    const savedEngraving = localStorage.getItem('engravingName');
    const savedDiscount = localStorage.getItem('discountPercent');
    const savedShipping = localStorage.getItem('shippingInfo');

    if (savedCart) cartItems = JSON.parse(savedCart);
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
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      localStorage.setItem('engravingName', JSON.stringify(engravingName));
      localStorage.setItem('discountPercent', JSON.stringify(discountPercent));
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
    discountRow.style.display = discountPercent > 0 ? 'flex' : 'none';
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
      if (code === 'NEW15') {
        discountPercent = 15;
        couponMessage.textContent = '✅ 15% discount applied';
        couponMessage.style.color = '#16a34a';
        showMessage("Coupon 'NEW15' applied successfully!", 'success');
      } else {
        discountPercent = 0;
        couponMessage.textContent = '❌ Invalid coupon code';
        couponMessage.style.color = '#ef4444';
        showMessage('Invalid coupon or code expired.', 'error');
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
        couponMessage.classList.add('hidden');
        couponInput.value = '';
        localStorage.clear();
        renderCart();
        showMessage('Cart cleared successfully!', 'success');
      }
    });

    checkoutBtn.addEventListener('click', function() {
      const fullname = document.getElementById('fullname')?.value.trim();
      const phone = document.getElementById('phone')?.value.trim();
      const province = provinceSelect.value;
      const district = districtSelect.value;
      const address = document.getElementById('address')?.value.trim();

      if (cartItems.length === 0) return showMessage('Your cart is empty!', 'error');
      if (!fullname) return showMessage('Please enter full name!', 'error');
      if (!phone) return showMessage('Please enter phone number!', 'error');
      if (!province) return showMessage('Please select a province/city!', 'error');
      if (!district) return showMessage('Please select a district!', 'error');
      if (!address) return showMessage('Please enter detailed address!', 'error');

      saveToLocalStorage();
      showMessage('Redirecting to checkout...', 'info');
      setTimeout(() => {
        window.location.href = '../checkout/checkout.html';
      }, 1000);
    });

    renderCart();
  }

  // BẮT ĐẦU CHẠY
  initialize();
});