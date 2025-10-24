document.addEventListener('DOMContentLoaded', () => {
  // State
  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

  // Elements
  const wrapper = document.getElementById('announcementWrapper');
  const slides = document.querySelectorAll('.announcement-slide');
  const nextButton = document.getElementById('next');
  const prevButton = document.getElementById('prev');
  const menuItems = document.querySelectorAll('.menu-top li a');
  const menuCategories = document.querySelector('.menu-categories');
  const decreaseQty = document.getElementById('decrease-qty');
  const increaseQty = document.getElementById('increase-qty');
  const quantityInput = document.getElementById('quantity');
  const thumbnails = document.querySelectorAll('.thumbnail');
  const mainImage = document.getElementById('main-image');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const cartIcon = document.querySelector('.kama-header nav a img[alt="Shopping"]');

  // Announcement Bar
  let index = 0;
  function showSlide(i) {
    if (wrapper) {
      wrapper.style.transform = `translateX(-${i * 100}%)`;
    }
  }
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      index = (index + 1) % slides.length;
      showSlide(index);
    });
  }
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      index = (index - 1 + slides.length) % slides.length;
      showSlide(index);
    });
  }
  setInterval(() => {
    index = (index + 1) % slides.length;
    showSlide(index);
  }, 5000);

  // Menu Toggle
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      if (item.textContent === 'CATEGORIES') {
        menuCategories.classList.toggle('active');
      }
    });
  });

  // Quantity Selector
  if (decreaseQty) {
    decreaseQty.addEventListener('click', () => {
      let qty = parseInt(quantityInput.value);
      if (qty > 1) quantityInput.value = qty - 1;
    });
  }
  if (increaseQty) {
    increaseQty.addEventListener('click', () => {
      let qty = parseInt(quantityInput.value);
      quantityInput.value = qty + 1;
    });
  }

  // Thumbnail Gallery
  if (thumbnails.length && mainImage) {
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', () => {
        mainImage.src = thumbnail.src;
        thumbnails.forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
      });
    });
  }

  // Helper Functions
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
      position: fixed; top: 20px; right: 20px; background: ${colors[type]}; color: white;
      padding: 12px 20px; border-radius: 8px; z-index: 1000; animation: slideInRight 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(toast);
    console.log('Toast added:', toast); // Debug
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        toast.remove();
        console.log('Toast removed:', message);
      }, 300);
    }, 3000);
  };

  // Cart Functionality
  function setupCart() {
    // Navigate to cart page when cart icon is clicked
    if (cartIcon) {
      cartIcon.parentElement.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Navigating to cart page');
        window.location.href = '../../cart/cart.html'; // Ensure correct path
      });
    } else {
      console.error('Cart icon not found. Check HTML structure: .kama-header nav a img[alt="Shopping"]');
    }

    // Add to cart functionality
    function addToCart(productId, quantity = 1) {
      const product = {
        id: productId || Date.now(),
        name: 'Dior Forever Foundation',
        price: 68.00,
        quantity: quantity,
        variant: document.getElementById('product-variant') ? document.getElementById('product-variant').value : '2N'
      };

      const existingItem = cartItems.find(item => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cartItems.push(product);
      }

      localStorage.setItem('cartItems', JSON.stringify(cartItems));

      fetch('cart/orderData.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartItems),
      }).catch(error => console.error('Failed to save to orderData.json:', error));

      showMessage(`${product.name} added to cart!`, 'success');
    }

    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        const qty = parseInt(quantityInput.value) || 1;
        addToCart(null, qty);
        quantityInput.value = 1;
      });
    }
  }

  // Toast Animation CSS
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

  // Initialize
  setupCart();
});