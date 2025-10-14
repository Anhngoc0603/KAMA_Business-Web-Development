document.addEventListener('DOMContentLoaded', function() {
  console.log("🚀 Checkout page is starting up...");

  // Exchange rate assumption is now only for reference or background calculation, 
  // the display currency will be USD.
  const EXCHANGE_RATE = 25000;
  const FREE_SHIPPING_THRESHOLD_USD = 100;

  // Currency format in USD
  const formatCurrency = v => {
    if (isNaN(v) || v === null) return '$0.00';
    // Hiển thị trực tiếp giá trị USD (loại bỏ nhân EXCHANGE_RATE)
    return v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  // Hàm giả lập tạo mã QR Code (Chỉ tạo một URL hình ảnh giả)
  const generateFakeQRCode = (method, amount) => {
    // Mã QR giả lập sẽ dùng dịch vụ như QuickChart hoặc Google Charts API để tạo URL ảnh
    const data = `Pay ${method}: ${amount.toFixed(2)} USD. Order ID: ${orderData.orderId}`;
    // Sử dụng QuickChart để giả lập tạo QR code
    return `https://quickchart.io/qr?text=${encodeURIComponent(data)}&size=150`;
  };

  // ====================================
  // === FAKE ORDER DATA (15% Discount, Ngk Engraving) ===
  // ====================================
  
  const cartItems = [
    { id: 1, name: "Chanel Rouge Coco Lipstick", price: 45.99, quantity: 1 },
    { id: 2, name: "Yves Saint Laurent Touche Éclat Concealer", price: 49.50, quantity: 2 },
    { id: 3, name: "Dior Backstage Eyeshadow Palette", price: 59.00, quantity: 1 },
    { id: 4, name: "Tom Ford Soleil Bronzer", price: 68.25, quantity: 1 },
    { id: 5, name: "Charlotte Tilbury Airbrush Flawless Foundation", price: 44.00, quantity: 1 }
  ];

  // Calculations (USD)
  const subtotal_USD = 316.24; 
  const engravingFee_USD = 5.00; 
  const subPlusEngraving_USD = subtotal_USD + engravingFee_USD; // 321.24 USD
  
  // Shipping is based on USD threshold
  const shipping_USD = subPlusEngraving_USD >= FREE_SHIPPING_THRESHOLD_USD ? 0.00 : 3.00; // Free shipping
  
  // 15% DISCOUNT
  const discountPercent = 15;
  const discountAmount_USD = Math.round((subPlusEngraving_USD * discountPercent / 100) * 100) / 100; // 48.19 USD
  
  const total_USD = subPlusEngraving_USD - discountAmount_USD + shipping_USD; // 273.05 USD

  const FAKE_ORDER_DATA = {
    orderId: `ORD${Date.now()}`,
    cart: cartItems, 
    engravingName: "Ngk",
    shippingInfo: {
      fullname: "Nguyễn Văn Ngọc Khánh",
      phone: "0397550737",
      province: "Ho Chi Minh City",
      district: "Thủ Đức District",
      address: "702 Hanoi Highway",
    },
    subtotal: subtotal_USD,
    engravingFee: engravingFee_USD, 
    shipping: shipping_USD, 
    discountAmount: discountAmount_USD, 
    total: total_USD 
  };
  
  // *** Thay thế orderData bằng dữ liệu thực tế từ localStorage nếu có (như đã hướng dẫn) ***
  let orderData = FAKE_ORDER_DATA;
  let dataSource = 'Fixed Fake Data (15% Discount, Ngk Engraving)';
  // Loại bỏ FREE_SHIPPING_THRESHOLD_VND, chỉ dùng USD
  

  // Elements (Unchanged IDs)
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
    // NEW: Payment QR containers
    qrMomo: document.getElementById('qrMomo'),
    qrZalo: document.getElementById('qrZalo'),
    qrBank: document.getElementById('qrBank'),
    qrCod: document.getElementById('qrCod')
  };

  // Show message function (ENGLISH MESSAGES - Unchanged)
  const showMessage = (message, type = 'info') => {
    const colors = {
      success: '#16a34a', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6'
    };
    
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

  // Initialization
  function initializeCheckout() {
    console.log("🔧 Initializing checkout...");

    if (!orderData || !orderData.cart || orderData.cart.length === 0) {
      showNoOrderData();
      return;
    }

    renderCart();
    displayShippingInfo();
    displayEngravingInfo();
    updateTotals();
    setupEventListeners();
    // NEW: Set up initial payment view
    handlePaymentChange();
    
    showMessage(`Data loaded successfully from ${dataSource}`, "success");
  }

  function showNoOrderData() {
    // ... (unchanged logic)
    if (elements.emptyCartEl) elements.emptyCartEl.classList.remove('hidden');
    if (elements.shippingDisplay) elements.shippingDisplay.classList.add('hidden');
    if (elements.engravingInfo) elements.engravingInfo.classList.add('hidden');
    if (elements.noShippingInfo) elements.noShippingInfo.classList.remove('hidden');
    
    if (elements.confirmOrderBtn) {
      elements.confirmOrderBtn.disabled = true;
      elements.confirmOrderBtn.textContent = 'No Order Data';
      elements.confirmOrderBtn.style.background = '#ccc';
    }
    
    showMessage("No order found! Please return to the cart.", "error");
  }

  // Render Cart (Cập nhật style để căn chỉnh sản phẩm)
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
      // Đảm bảo cấu trúc này giúp các giá trị thẳng hàng
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

  // ... (displayShippingInfo and displayEngravingInfo - unchanged logic)
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

  // Update Totals
  function updateTotals() {
    if (!orderData) return;

    const subtotal = orderData.subtotal || 0;
    const engravingFee = orderData.engravingFee || 0;
    const shipping = orderData.shipping || 0;
    const discountAmount = orderData.discountAmount || 0;
    const total = orderData.total || 0;
    
    const subPlusEngravingUSD = subtotal + engravingFee;
    const freeShippingText = 'Free';

    // Update amounts
    const updateElement = (element, value) => {
      if (element) element.textContent = value;
    };

    updateElement(elements.subtotalEl, formatCurrency(subtotal));
    updateElement(elements.engravingFeeEl, formatCurrency(engravingFee));
    updateElement(elements.shippingFeeEl, shipping === 0 ? freeShippingText : formatCurrency(shipping));
    updateElement(elements.discountEl, `-${formatCurrency(discountAmount)}`);
    updateElement(elements.totalEl, formatCurrency(total));

    // Update progress (ENGLISH MESSAGES)
    if (elements.progressBar) {
      // Cập nhật dựa trên USD
      const progressPercent = Math.min((subPlusEngravingUSD / FREE_SHIPPING_THRESHOLD_USD) * 100, 100);
      elements.progressBar.style.width = `${progressPercent}%`;
    }

    if (elements.progressText) {
      if (shipping === 0 && (subtotal + engravingFee) > 0) {
        elements.progressText.textContent = "🎉 You've qualified for Free Shipping!";
        elements.progressText.style.color = '#16a34a';
      } else {
        const neededUSD = FREE_SHIPPING_THRESHOLD_USD - (subPlusEngravingUSD);
        // Hiển thị số tiền cần thêm bằng USD
        elements.progressText.textContent = `Add ${formatCurrency(neededUSD)} for free shipping`;
        elements.progressText.style.color = '#A0726A';
      }
    }
  }
    
    // NEW: Hàm xử lý hiển thị QR code
    function handlePaymentChange() {
        const paymentMethods = document.querySelectorAll('input[name="payment"]');
        
        // Hide all QR containers first
        [elements.qrMomo, elements.qrZalo, elements.qrBank, elements.qrCod].forEach(el => {
            if (el) el.classList.add('hidden');
        });

        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        if (!selectedPayment) return;

        const method = selectedPayment.value;
        const totalAmount = orderData.total || 0; // Total USD

        let qrCodeElement;
        let qrContainer;
        let message = '';
        
        switch(method) {
            case 'momo':
                qrContainer = elements.qrMomo;
                qrCodeElement = `<img src="${generateFakeQRCode('Momo', totalAmount)}" alt="Momo QR Code" width="150" height="150"/>`;
                // Hiển thị số tiền bằng USD
                message = `Scan the QR code to pay ${formatCurrency(totalAmount)}. Account: 039755xxxx.`;
                break;
            case 'zalo':
                qrContainer = elements.qrZalo;
                qrCodeElement = `<img src="${generateFakeQRCode('ZaloPay', totalAmount)}" alt="ZaloPay QR Code" width="150" height="150"/>`;
                // Hiển thị số tiền bằng USD
                message = `Scan the QR code to pay ${formatCurrency(totalAmount)}. Account: 039755xxxx.`;
                break;
            case 'bank':
                qrContainer = elements.qrBank;
                qrCodeElement = `<img src="${generateFakeQRCode('BankTransfer', totalAmount)}" alt="Bank Transfer QR Code" width="150" height="150"/>`;
                // Hiển thị số tiền bằng USD
                message = `Transfer ${formatCurrency(totalAmount)} to ACB Bank, Account: 123456789. Content: ${orderData.orderId}`;
                break;
            case 'cod':
                qrContainer = elements.qrCod;
                qrCodeElement = 'N/A'; // COD doesn't need QR
                // Hiển thị số tiền bằng USD
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

  // Event Listeners 
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
    
    // NEW: Listen for changes in payment method
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', handlePaymentChange);
    });
  }

  // Confirm Order
  function confirmOrder() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    if (!paymentMethod) {
      showMessage("Please select a payment method!", "error");
      return;
    }

    const orderId = orderData.orderId || `ORD${Date.now()}`;
    if (elements.orderIdEl) elements.orderIdEl.textContent = orderId;
    
    if (elements.overlay) elements.overlay.classList.remove('hidden');
    if (elements.successPopup) elements.successPopup.classList.remove('hidden');
    
    showMessage("Order confirmed successfully!", "success");
  }

  // Close Popup
  function closePopup() {
    if (elements.overlay) elements.overlay.classList.add('hidden');
    if (elements.successPopup) elements.successPopup.classList.add('hidden');
    
    setTimeout(() => {
      console.log("Closed popup and simulated redirect back to cart page (cart.html).");
    }, 1000);
  }

  // Add CSS for animations (Unchanged)
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

  // Start Checkout
  initializeCheckout();
});