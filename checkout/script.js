document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Checkout page is starting up...');

  const FREE_SHIPPING_THRESHOLD_USD = 100;

  const formatCurrency = v => {
    if (isNaN(v) || v === null) return '$0.00';
    return v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const generateFakeQRCode = (method, amount) => {
    const data = `Pay ${method}: ${amount.toFixed(2)} USD. Order ID: ${orderData.orderId}`;
    return `https://quickchart.io/qr?text=${encodeURIComponent(data)}&size=150`;
  };

  // Load data from localStorage
  let orderData = {
    orderId: `ORD${Date.now()}`,
    cart: JSON.parse(localStorage.getItem('cartItems')) || [],
    engravingName: JSON.parse(localStorage.getItem('engravingName')) || null,
    discountPercent: JSON.parse(localStorage.getItem('discountPercent')) || 0,
    shippingInfo: JSON.parse(localStorage.getItem('shippingInfo')) || null,
  };

  // Calculate totals
  function calculateTotals() {
    const subtotal = orderData.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const engravingFee = orderData.engravingName ? 5.00 : 0;
    const subPlusEngraving = subtotal + engravingFee;
    const shipping = subPlusEngraving > 0 && subPlusEngraving < FREE_SHIPPING_THRESHOLD_USD ? 3.00 : 0;
    const discountAmount = Math.round((subPlusEngraving * orderData.discountPercent / 100) * 100) / 100;
    const total = Math.round((subPlusEngraving - discountAmount + shipping) * 100) / 100;

    orderData.subtotal = subtotal;
    orderData.engravingFee = engravingFee;
    orderData.shipping = shipping;
    orderData.discountAmount = discountAmount;
    orderData.total = total;
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
    if (!orderData.shippingInfo) {
      if (elements.shippingDisplay) elements.shippingDisplay.classList.add('hidden');
      if (elements.noShippingInfo) elements.noShippingInfo.classList.remove('hidden');
      return;
    }
    if (elements.shippingDisplay) {
      elements.shippingDisplay.classList.remove('hidden');
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
    }
    if (elements.noShippingInfo) elements.noShippingInfo.classList.add('hidden');
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
    updateElement(elements.discountEl, `-${formatCurrency(discountAmount)}`);
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
});