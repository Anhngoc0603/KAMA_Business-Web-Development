document.addEventListener('DOMContentLoaded', () => {
  // State
  let products = [];
  let filteredProducts = [];
  let currentPage = 1;
  const productsPerPage = 6;
  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

  // Elements
  const wrapper = document.getElementById('announcementWrapper');
  const slides = document.querySelectorAll('.announcement-slide');
  const nextButton = document.getElementById('next');
  const prevButton = document.getElementById('prev');
  const menuItems = document.querySelectorAll('.menu-top li a');
  const menuCategories = document.querySelector('.menu-categories');
  const productsGrid = document.getElementById('products');
  const loadMoreButton = document.getElementById('load-more-button');
  const searchInput = document.getElementById('search-input');
  const priceFilter = document.getElementById('price-filter');
  const ratingFilter = document.getElementById('rating-filter');
  const brandFilter = document.getElementById('brand-filter');
  const filterToggle = document.getElementById('filter-toggle');
  const filterMenu = document.getElementById('filter-menu');
  const categoryButtons = document.querySelectorAll('.category-btn');
  const aiButton = document.querySelector('.ai-btn');
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
  const decreaseQty = document.getElementById('decrease-qty');
  const increaseQty = document.getElementById('increase-qty');
  const quantityInput = document.getElementById('quantity');
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
  const thumbnails = document.querySelectorAll('.thumbnail');
  const mainImage = document.getElementById('main-image');
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
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // Load Products
  fetch('../new/products.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load products');
      return response.json();
    })
    .then(data => {
      products = data;
      filteredProducts = [...products];
      renderProducts();
      setupFilters();
      setupLoadMore();
      setupViewDetails();
      setupSearch();
      setupAICombo();
      setupCart();
    })
    .catch(error => {
      console.error('Error loading products:', error);
      showMessage('Failed to load products. Please try again.', 'error');
    });

  // Render Products
  function renderProducts() {
    productsGrid.innerHTML = '';
    const start = 0;
    const end = currentPage * productsPerPage;
    const pageProducts = filteredProducts.slice(start, end);
    
    if (pageProducts.length === 0) {
      productsGrid.innerHTML = '<p style="text-align: center; color: var(--branch-brown);">No products found.</p>';
      return;
    }

    pageProducts.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.innerHTML = `
        <div style="position: relative;">
          <img src="${product.image}" alt="${product.name}" class="product-img">
          <img src="${product.image}" alt="${product.name}" class="product-img hover-image">
        </div>
        <div class="info">
          <h3>${product.name}</h3>
          <p class="meta">Brand: ${product.brand}</p>
          <p class="meta">Category: ${product.category}</p>
          <div class="actions">
            <span class="price">${formatCurrency(product.price)}</span>
            <span class="rating">${product.rating} <span class="star">★</span></span>
          </div>
          <div class="buttons">
            <button class="btn-outline view-details" data-id="${product.id}">View Details</button>
            <button class="btn-primary add-to-cart" data-id="${product.id}">Add to Cart</button>
          </div>
        </div>
      `;
      productsGrid.appendChild(productCard);
    });

    loadMoreButton.style.display = end >= filteredProducts.length ? 'none' : 'block';
  }

  // Filters
  function setupFilters() {
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryButtons.forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        const category = btn.dataset.category;
        applyFilters(category);
      });
    });

    filterToggle.addEventListener('click', () => {
      filterMenu.classList.toggle('show');
    });

    priceFilter.addEventListener('change', () => applyFilters());
    ratingFilter.addEventListener('change', () => applyFilters());
    brandFilter.addEventListener('change', () => applyFilters());
  }

  function applyFilters(category = document.querySelector('.category-btn.is-selected').dataset.category) {
    filteredProducts = [...products];

    // Category Filter
    if (category !== 'All') {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    // Price Filter
    if (priceFilter.value === 'low-high') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (priceFilter.value === 'high-low') {
      filteredProducts.sort((a, b) => b.price - a.price);
    }

    // Rating Filter
    if (ratingFilter.value !== 'default') {
      const minRating = parseFloat(ratingFilter.value);
      filteredProducts = filteredProducts.filter(p => p.rating >= minRating);
    }

    // Brand Filter
    if (brandFilter.value !== 'default') {
      filteredProducts = filteredProducts.filter(p => p.brand === brandFilter.value);
    }

    currentPage = 1;
    renderProducts();
  }

  // Search
  function setupSearch() {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.brand.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
      currentPage = 1;
      renderProducts();
    });
  }

  // Load More
  function setupLoadMore() {
    loadMoreButton.addEventListener('click', () => {
      currentPage++;
      renderProducts();
    });
  }

  // View Details Redirect
  function setupViewDetails() {
    productsGrid.addEventListener('click', (e) => {
      if (e.target.classList.contains('view-details')) {
        const id = parseInt(e.target.dataset.id);
        const product = products.find(p => p.id === id);
        if (product) {
          window.location.href = `../new/view_product/view_new.html?id=${id}`;
        }
      }
    });
  }

  // Cart Functionality
  function setupCart() {
    // Navigate to cart page when cart icon is clicked
    if (cartIcon) {
      cartIcon.parentElement.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Navigating to cart page');
        window.location.href = '../cart/cart.html'; // Relative path for portability
      });
    } else {
      console.log('Cart icon not found. Check HTML structure: .kama-header nav a img[alt="Shopping"]');
    }

    // Add to cart functionality
    function addToCart(productId, quantity = 1) {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const existingItem = cartItems.find(item => item.id === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cartItems.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity
        });
      }

      // Save to local storage
      localStorage.setItem('cartItems', JSON.stringify(cartItems));

      // Optional save to orderData.json (requires server support)
      fetch('cart/orderData.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartItems),
      }).catch(error => {
        console.error('Failed to save to orderData.json:', error);
      });

      showMessage(`${product.name} added to cart!`, 'success');
    }

    productsGrid.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart')) {
        const id = parseInt(e.target.dataset.id);
        const qty = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
        addToCart(id, qty);
        if (quantityInput) quantityInput.value = 1; // Reset quantity
      }
    });
  }

  // AI Combo Suggestion
  function setupAICombo() {
    aiButton.addEventListener('click', () => {
      const combo = generateAICombo();
      showMessage(`Suggested Combo: ${combo.join(', ')}`, 'info');
    });
  }

  function generateAICombo() {
    const categories = ['Face', 'Eyes', 'Lips'];
    const combo = categories.map(category => {
      const categoryProducts = products.filter(p => p.category === category);
      return categoryProducts[Math.floor(Math.random() * categoryProducts.length)]?.name || 'No product';
    });
    return combo;
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
});