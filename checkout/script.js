document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Checkout page is starting up...');

  // Đồng bộ với Cart
  const FREE_SHIPPING_THRESHOLD_USD = 50; // giống Cart
  const SHIPPING_FEE_USD = 3; // giống Cart
  const ENGRAVING_FEE_USD = 5; // giống Cart
  // Discount configuration flags (match Cart)
  const APPLY_PERCENT_FIRST = true;
  const ALLOW_FIXED_OVER_PERCENT = false;
  const SHOW_SAVEUP_NEGATIVE = true;

  const formatCurrency = v => {
    if (isNaN(v) || v === null) return '$0.00';
    return v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const generateFakeQRCode = (method, amount) => {
    const data = `Pay ${method}: ${amount.toFixed(2)} USD. Order ID: ${orderData.orderId}`;
    return `https://quickchart.io/qr?text=${encodeURIComponent(data)}&size=150`;
  };

  // Load data từ localStorage (đồng bộ key với Cart)
  let orderData = {
    orderId: `ORD${Date.now()}`,
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    engravingName: JSON.parse(localStorage.getItem('engravingName')) || null,
    discountPercent: JSON.parse(localStorage.getItem('discountPercent')) || 0,
    discountFixed: JSON.parse(localStorage.getItem('discountFixed')) || 0,
    shippingInfo: JSON.parse(localStorage.getItem('shippingInfo')) || null,
  };

  // Hàm kiểm tra sản phẩm đang sale (đồng bộ với Cart)
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

  // Calculate totals
  function calculateTotals() {
    const subtotal = orderData.cart.reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0);
    const engravingFee = orderData.engravingName ? ENGRAVING_FEE_USD : 0;
    const subPlusEngraving = subtotal + engravingFee;
    const shipping = subPlusEngraving > 0 && subPlusEngraving < FREE_SHIPPING_THRESHOLD_USD ? SHIPPING_FEE_USD : 0;
    // Discount: áp dụng trên toàn bộ subtotal với thứ tự/capping cấu hình
    const percentValue = Math.max(Number(orderData.discountPercent) || 0, 0);
    const fixedValue = Math.max(Number(orderData.discountFixed) || 0, 0);
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

    orderData.subtotal = subtotal;
    orderData.engravingFee = engravingFee;
    orderData.shipping = shipping;
    orderData.discountAmount = discountAmount;
    orderData.total = total;
  }

  // ==== USER SEGMENT HELPERS (ported from Cart) ====
  function getUserProfile() {
    const firstLoginDone = JSON.parse(localStorage.getItem('user.firstLoginDone') || 'false');
    const orderCount = Number(localStorage.getItem('user.orderCount') || '0');
    const birthMonth = Number(localStorage.getItem('user.birthMonth') || '0');
    const lifetimeSpend = Number(localStorage.getItem('user.lifetimeSpend') || '0');
    return { firstLoginDone, orderCount, birthMonth, lifetimeSpend };
  }

  function setFirstLoginDone() {
    localStorage.setItem('user.firstLoginDone', 'true');
  }

  function evaluateCoupon(code) {
    const nowMonth = new Date().getMonth() + 1;
    const profile = getUserProfile();
    const upper = (code || '').trim().toUpperCase();
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
    if (upper === 'NEW15') {
      return { valid: true, type: 'percent', value: 15, message: '✅ 15% discount applied' };
    }
    return { valid: false, message: '❌ Mã không hợp lệ hoặc đã hết hạn.' };
  }

  // Elements
  const elements = {
    cartItemsEl: document.getElementById('cartItems'),
    emptyCartEl: document.getElementById('emptyCart'),
    subtotalEl: document.getElementById('subtotal'),
    shippingFeeEl: document.getElementById('shippingFee'),
    totalEl: document.getElementById('total'),
    discountEl: document.getElementById('discount'),
    engravingFeeEl: document.getElementById('engravingFee'),
    shippingDisplay: document.getElementById('shippingDisplay'),
    noShippingInfo: document.getElementById('noShippingInfo'),
    engravingInfo: document.getElementById('engravingInfo'),
    engravedNameCheckout: document.getElementById('engravedNameCheckout'),
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
    confirmOrderBtn: document.getElementById('confirmOrderBtn'),
    overlay: document.getElementById('overlay'),
    successPopup: document.getElementById('successPopup'),
    closePopupBtn: document.getElementById('closePopupBtn'),
    orderIdEl: document.getElementById('orderId'),
    qrMomo: document.getElementById('qrMomo'),
    qrZalo: document.getElementById('qrZalo'),
    qrBank: document.getElementById('qrBank'),
    qrCod: document.getElementById('qrCod'),
    couponInput: document.getElementById('couponInputCheckout'),
    applyCouponBtn: document.getElementById('applyCouponBtnCheckout'),
    couponMessage: document.getElementById('couponMessageCheckout'),
    agreeAll: document.getElementById('agreeAll'),
    // Shipping form
    shippingForm: document.getElementById('shippingForm'),
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    addressLine: document.getElementById('addressLine'),
    aptSuite: document.getElementById('aptSuite'),
    city: document.getElementById('city'),
    state: document.getElementById('state'),
    zip: document.getElementById('zip'),
    defaultAddress: document.getElementById('defaultAddress'),
    saveShippingBtn: document.getElementById('saveShippingBtn'),
    // Contact info
    mobileNumber: document.getElementById('mobileNumber'),
    emailAddress: document.getElementById('emailAddress'),
    // Country & carrier
    country: document.getElementById('country'),
    carrierLabel: document.getElementById('carrierLabel'),
    // Layout helpers
    leftScroll: document.querySelector('.left-scroll'),
    rightSidebar: document.querySelector('.right-column .summary-section'),
  };

  const showMessage = (message, type = 'info') => {
    const colors = { success: '#16a34a', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: ${colors[type]}; color: white;
      padding: 12px 20px; border-radius: 8px; z-index: 1000; animation: slideInRight 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  function initializeCheckout() {
    console.log('🔧 Initializing checkout...');
    calculateTotals();
    if (!orderData.cart || orderData.cart.length === 0) {
      showNoOrderData();
      return;
    }
    renderCart();
    displayShippingInfo();
    displayEngravingInfo();
    updateTotals();
    setupEventListeners();
    handlePaymentChange();
    updateCarrierByCountry();
    syncLeftScrollHeight();
    showMessage('Checkout data loaded successfully!', 'success');
  }

  function showNoOrderData() {
    if (elements.emptyCartEl) elements.emptyCartEl.classList.remove('hidden');
    if (elements.shippingDisplay) elements.shippingDisplay.classList.add('hidden');
    if (elements.engravingInfo) elements.engravingInfo.classList.add('hidden');
    if (elements.noShippingInfo) elements.noShippingInfo.classList.remove('hidden');
    if (elements.confirmOrderBtn) {
      elements.confirmOrderBtn.disabled = true;
      elements.confirmOrderBtn.textContent = 'No Order Data';
      elements.confirmOrderBtn.style.background = '#ccc';
    }
    showMessage('No order found! Please return to the cart.', 'error');
  }

  function renderCart() {
    if (!elements.cartItemsEl) return;
    elements.cartItemsEl.innerHTML = '';
    if (!orderData.cart || orderData.cart.length === 0) {
      if (elements.emptyCartEl) elements.emptyCartEl.classList.remove('hidden');
      return;
    }
    if (elements.emptyCartEl) elements.emptyCartEl.classList.add('hidden');
    orderData.cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name || 'Product'}</div>
          <div class="cart-item-price-qty">${formatCurrency(item.price || 0)} x ${item.quantity || 0}</div>
        </div>
        <div class="cart-item-controls">
          <span style="font-weight: 600; color: #6B4C3B;">
            ${formatCurrency((item.price || 0) * (item.quantity || 0))}
          </span>
        </div>
      `;
      elements.cartItemsEl.appendChild(div);
    });
  }

  function displayShippingInfo() {
    // Luôn hiển thị form để khách tự điền trực tiếp
    if (elements.shippingForm) elements.shippingForm.classList.remove('hidden');
    if (elements.noShippingInfo) elements.noShippingInfo.classList.add('hidden');
    // Nếu đã có thông tin, chỉ cập nhật phần tóm tắt nhưng vẫn giữ form hiển thị
    if (orderData.shippingInfo && elements.shippingDisplay) {
      const info = orderData.shippingInfo;
      const setTextContent = (id, text) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text || 'N/A';
      };
      setTextContent('displayFullname', info.fullname);
      setTextContent('displayPhone', info.phone);
      setTextContent('displayProvince', info.province);
      setTextContent('displayDistrict', info.district);
      setTextContent('displayAddress', info.address);
      // Mặc định: giữ phần tóm tắt ẩn để giao diện giống ảnh
      elements.shippingDisplay.classList.add('hidden');
    }
    syncLeftScrollHeight();
  }

  function displayEngravingInfo() {
    if (!elements.engravingInfo || !elements.engravedNameCheckout) return;
    if (orderData.engravingName && orderData.engravingFee > 0) {
      elements.engravedNameCheckout.textContent = orderData.engravingName;
      elements.engravingInfo.classList.remove('hidden');
    } else {
      elements.engravingInfo.classList.add('hidden');
    }
  }

  function updateTotals() {
    if (!orderData) return;
    const subtotal = orderData.subtotal || 0;
    const engravingFee = orderData.engravingFee || 0;
    const shipping = orderData.shipping || 0;
    const discountAmount = orderData.discountAmount || 0;
    const total = orderData.total || 0;
    const subPlusEngravingUSD = subtotal + engravingFee;
    const freeShippingText = 'Free';

    const updateElement = (element, value) => {
      if (element) element.textContent = value;
    };

    updateElement(elements.subtotalEl, formatCurrency(subtotal));
    updateElement(elements.engravingFeeEl, formatCurrency(engravingFee));
    updateElement(elements.shippingFeeEl, shipping === 0 ? freeShippingText : formatCurrency(shipping));
    // Save up: hiển thị số âm nếu cấu hình, vẫn đổi màu theo số tiền
    if (elements.discountEl) {
      elements.discountEl.classList.remove('saveup-positive', 'saveup-zero');
      const hasSaving = Number(discountAmount) > 0;
      elements.discountEl.classList.add(hasSaving ? 'saveup-positive' : 'saveup-zero');
      if (SHOW_SAVEUP_NEGATIVE && hasSaving) {
        updateElement(elements.discountEl, '- ' + formatCurrency(discountAmount));
      } else {
        updateElement(elements.discountEl, formatCurrency(discountAmount));
      }
    }
    updateElement(elements.totalEl, formatCurrency(total));

    if (elements.progressBar) {
      const progressPercent = Math.min((subPlusEngravingUSD / FREE_SHIPPING_THRESHOLD_USD) * 100, 100);
      elements.progressBar.style.width = `${progressPercent}%`;
    }

    if (elements.progressText) {
      if (shipping === 0 && (subtotal + engravingFee) > 0) {
        elements.progressText.textContent = "🎉 You've qualified for Free Shipping!";
        elements.progressText.style.color = '#16a34a';
      } else {
        const neededUSD = FREE_SHIPPING_THRESHOLD_USD - subPlusEngravingUSD;
        elements.progressText.textContent = `Add ${formatCurrency(neededUSD)} for free shipping`;
        elements.progressText.style.color = '#A0726A';
      }
    }
  }

  function handlePaymentChange() {
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    [elements.qrMomo, elements.qrZalo, elements.qrBank, elements.qrCod].forEach(el => {
      if (el) el.classList.add('hidden');
    });

    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    if (!selectedPayment) return;

    const method = selectedPayment.value;
    const totalAmount = orderData.total || 0;

    let qrCodeElement;
    let qrContainer;
    let message = '';

    switch (method) {
      case 'momo':
        qrContainer = elements.qrMomo;
        qrCodeElement = `<img src="${generateFakeQRCode('Momo', totalAmount)}" alt="Momo QR Code" width="150" height="150"/>`;
        message = `Scan the QR code to pay ${formatCurrency(totalAmount)}. Account: 039755xxxx.`;
        break;
      case 'zalo':
        qrContainer = elements.qrZalo;
        qrCodeElement = `<img src="${generateFakeQRCode('ZaloPay', totalAmount)}" alt="ZaloPay QR Code" width="150" height="150"/>`;
        message = `Scan the QR code to pay ${formatCurrency(totalAmount)}. Account: 039755xxxx.`;
        break;
      case 'bank':
        qrContainer = elements.qrBank;
        qrCodeElement = `<img src="${generateFakeQRCode('BankTransfer', totalAmount)}" alt="Bank Transfer QR Code" width="150" height="150"/>`;
        message = `Transfer ${formatCurrency(totalAmount)} to ACB Bank, Account: 123456789. Content: ${orderData.orderId}`;
        break;
      case 'cod':
        qrContainer = elements.qrCod;
        qrCodeElement = 'N/A';
        message = `You will pay ${formatCurrency(totalAmount)} to the delivery person upon arrival.`;
        break;
    }

    if (qrContainer) {
      qrContainer.innerHTML = `
        ${qrCodeElement !== 'N/A' ? `<div style="text-align: center; margin-bottom: 10px;">${qrCodeElement}</div>` : ''}
        <p style="font-size: 0.9em; text-align: center; color: #A0726A;">${message}</p>
      `;
      qrContainer.classList.remove('hidden');
    }
  }

  function setupEventListeners() {
    if (elements.confirmOrderBtn) {
      elements.confirmOrderBtn.addEventListener('click', confirmOrder);
    }
    if (elements.closePopupBtn) {
      elements.closePopupBtn.addEventListener('click', closePopup);
    }
    if (elements.overlay) {
      elements.overlay.addEventListener('click', closePopup);
    }
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
      radio.addEventListener('change', handlePaymentChange);
    });
    if (elements.applyCouponBtn && elements.couponInput && elements.couponMessage) {
      elements.applyCouponBtn.addEventListener('click', function() {
        const code = elements.couponInput.value.trim().toUpperCase();
        const result = evaluateCoupon(code);
        if (result.valid) {
          if (result.type === 'percent') {
            orderData.discountPercent = result.value;
            orderData.discountFixed = 0;
          } else {
            orderData.discountPercent = 0;
            orderData.discountFixed = result.value;
          }
          elements.couponMessage.textContent = result.message;
          elements.couponMessage.style.color = '#16a34a';
          showMessage(`Coupon '${code}' applied successfully!`, 'success');
          if (code === 'WELCOME10') setFirstLoginDone();
        } else {
          orderData.discountPercent = 0;
          orderData.discountFixed = 0;
          elements.couponMessage.textContent = result.message;
          elements.couponMessage.style.color = '#ef4444';
          showMessage(result.message, 'error');
        }
        elements.couponMessage.classList.remove('hidden');
        calculateTotals();
        updateTotals();
        localStorage.setItem('discountPercent', JSON.stringify(orderData.discountPercent));
        localStorage.setItem('discountFixed', JSON.stringify(orderData.discountFixed));
        syncLeftScrollHeight();
      });
    }

    // Gate Place Order by Agree to All
    if (elements.agreeAll && elements.confirmOrderBtn) {
      const syncPlaceOrderState = () => {
        elements.confirmOrderBtn.disabled = !elements.agreeAll.checked;
      };
      elements.agreeAll.addEventListener('change', syncPlaceOrderState);
      // Initial sync to honor default unchecked state
      syncPlaceOrderState();
    }

    // Contact info persistence
    if (elements.mobileNumber) {
      const storedMobile = localStorage.getItem('contactMobile') || '';
      elements.mobileNumber.value = storedMobile;
      elements.mobileNumber.addEventListener('input', e => {
        localStorage.setItem('contactMobile', e.target.value);
      });
    }
    if (elements.emailAddress) {
      const storedEmail = localStorage.getItem('contactEmail') || '';
      elements.emailAddress.value = storedEmail;
      elements.emailAddress.addEventListener('input', e => {
        localStorage.setItem('contactEmail', e.target.value);
      });
    }

    // Country change -> update carrier
    if (elements.country) {
      elements.country.addEventListener('change', () => {
        updateCarrierByCountry();
      });
    }

    // Uppercase State/Province live
    if (elements.state) {
      elements.state.addEventListener('input', e => {
        e.target.value = (e.target.value || '').toUpperCase();
      });
    }

    // Sync left column scroll height on resize
    window.addEventListener('resize', syncLeftScrollHeight);

    // Shipping form: Save & Continue
    if (elements.saveShippingBtn) {
      elements.saveShippingBtn.addEventListener('click', function() {
        const first = (elements.firstName?.value || '').trim();
        const last = (elements.lastName?.value || '').trim();
        const address1 = (elements.addressLine?.value || '').trim();
        const apt = (elements.aptSuite?.value || '').trim();
        const city = (elements.city?.value || '').trim();
        const state = (elements.state?.value || '').trim();
        const zip = (elements.zip?.value || '').trim();
        const isDefault = !!elements.defaultAddress?.checked;
        const countryVal = (elements.country?.value || 'VN');

        if (!first || !last || !address1 || !city || !state || !zip) {
          showMessage('Please fill all required fields (*) in Shipping Address!', 'error');
          return;
        }

        // Country-specific Zip/Postal validation
        const isUS = countryVal === 'US';
        const isVN = countryVal === 'VN';
        let zipValid = true;
        if (isUS) {
          zipValid = /^\d{5}(-\d{4})?$/.test(zip);
          if (!zipValid) {
            showMessage('US Zip must be 5 digits or 5-4 (e.g., 12345 or 12345-6789).', 'error');
            return;
          }
        } else if (isVN) {
          zipValid = /^\d{6}$/.test(zip);
          if (!zipValid) {
            showMessage('VN Postal Code phải gồm 6 chữ số.', 'error');
            return;
          }
        }

        const shippingInfo = {
          fullname: `${first} ${last}`.trim(),
          address: apt ? `${address1}, ${apt}` : address1,
          district: city,
          province: state.toUpperCase(),
          zip,
          country: countryVal === 'US' ? 'United States' : 'Vietnam',
          default: isDefault,
          phone: JSON.parse(localStorage.getItem('contactMobile') || 'null') || ''
        };
        orderData.shippingInfo = shippingInfo;
        localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
        showMessage('Shipping address saved. You can continue.', 'success');
        // Sau khi lưu: vẫn giữ form hiển thị; cho phép xem tóm tắt nếu muốn
        if (elements.shippingDisplay) {
          elements.shippingDisplay.classList.remove('hidden');
        }
        displayShippingInfo();
        syncLeftScrollHeight();
      });
    }
  }

  function confirmOrder() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    if (!paymentMethod) {
      showMessage('Please select a payment method!', 'error');
      return;
    }

    const orderId = orderData.orderId || `ORD${Date.now()}`;
    if (elements.orderIdEl) elements.orderIdEl.textContent = orderId;

    if (elements.overlay) elements.overlay.classList.remove('hidden');
    if (elements.successPopup) elements.successPopup.classList.remove('hidden');

    localStorage.clear(); // Clear localStorage after order confirmation
    showMessage('Order confirmed successfully!', 'success');
  }

  function closePopup() {
    if (elements.overlay) elements.overlay.classList.add('hidden');
    if (elements.successPopup) elements.successPopup.classList.add('hidden');
    setTimeout(() => {
      window.location.href = '../../cart/cart.html';
    }, 1000);
  }

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

  initializeCheckout();
  // Helpers
  function updateCarrierByCountry() {
    const val = elements.country?.value || 'VN';
    if (elements.carrierLabel) {
      elements.carrierLabel.textContent = val === 'US' ? 'USPS / UPS' : 'LX Pantos';
    }
    const label = document.getElementById('countryLabelText');
    if (label) {
      label.textContent = val === 'US' ? 'UNITED STATES' : 'VIETNAM';
    }
  }
  function syncLeftScrollHeight() {
    const sidebar = elements.rightSidebar || document.querySelector('.right-column .summary-section');
    const scroller = elements.leftScroll || document.querySelector('.left-scroll');
    if (sidebar && scroller) {
      const h = sidebar.offsetHeight;
      scroller.style.maxHeight = `${h}px`;
      scroller.style.overflowY = 'auto';
    }
  }
});
