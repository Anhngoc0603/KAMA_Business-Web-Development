document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  // ===================================================================
  // 1. LOAD HEADER & FOOTER
  // ===================================================================
  const loadPartial = async (url, placeholderId) => {
    const el = document.getElementById(placeholderId);
    if (!el) {
      console.warn(`${placeholderId} not found`);
      return;
    }
    try {
      const res = await fetch(url);
      if (res.ok) {
        el.innerHTML = await res.text();
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (e) {
      console.error(`Failed to load ${url}:`, e);
      // Fallback content...
      if (placeholderId === 'header-placeholder') {
        el.innerHTML = `<header style="background: #E6A6B0; padding: 1rem; color: white; text-align: center;"><h1>🎀 Sakura Beauty 🎀</h1><nav><a href="#" style="color: white; margin: 0 1rem;">Home</a></nav></header>`;
      } else if (placeholderId === 'footer-placeholder') {
        el.innerHTML = `<footer style="background: #333; padding: 2rem; color: white; text-align: center;"><p>© 2024 Sakura Beauty</p></footer>`;
      }
    }
  };

  await Promise.all([
    loadPartial('../header_footer/header.html', 'header-placeholder'),
    loadPartial('../header_footer/footer.html', 'footer-placeholder')
  ]);

  // ===================================================================
  // 2. FIREWORKS
  // ===================================================================
  const fireworks = document.querySelector('.fireworks-container');
  if (fireworks) {
    const colors = ['pink-1', 'pink-2', 'pink-3', 'pink-4'];
    for (let i = 0; i < 120; i++) {
      const p = document.createElement('div');
      p.className = `firework-particle ${colors[Math.floor(Math.random() * colors.length)]}`;
      p.style.setProperty('--tx', `${Math.random() * 200 - 100}vw`);
      p.style.setProperty('--ty', `${Math.random() * 200 - 100}vh`);
      p.style.setProperty('--i', i);
      fireworks.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }

  // ===================================================================
  // 3. FAN LAYOUT CLASS - XÒE QUẠT (LOGIC TRƯỢT 1 CARD - "ROLLING")
  // ===================================================================
  class FanLayout {
    constructor(products, container) {
      this.products = products;
      this.container = container;
      // currentIndex là index của sản phẩm ở VỊ TRÍ 0 (ngoài cùng bên trái)
      this.currentIndex = 0; 
      this.cardsPerGroup = 5; // Luôn hiển thị 5 card
      this.isAnimating = false;
      this.animationTime = 800; // Phải khớp với 'transition' trong CSS
      this.init();
    }

    init() {
      if (!this.container) {
        console.error('Container not found for FanLayout');
        return;
      }
      
      this.createFanLayout();
      this.renderInitialCards(); // Render 5 card ban đầu
      this.setupEventListeners();
      this.setupScrollListener();
    }

    createFanLayout() {
      // *** ĐÃ CẬP NHẬT HTML CHO NÚT <img> ***
      this.fanHTML = `
        <div class="fan-viewport">
          <div class="fan-cards" id="fan-cards"></div>
        </div>
        <div class="fan-navigation">
          <button class="fan-nav-btn" id="fan-prev">
            <img src="./images/prev.png" alt="Previous">
          </button>
          <div class="fan-dots" id="fan-dots"></div>
          <button class="fan-nav-btn" id="fan-next">
            <img src="./images/next.png" alt="Next">
          </button>
        </div>
        <div class="scroll-indicator" id="scroll-indicator">
          <p>Scroll to rotate the fan</p>
          <div style="font-size: 24px;">⌄</div>
        </div>
      `;
      // *** KẾT THÚC CẬP NHẬT ***

      this.container.innerHTML = this.fanHTML;
      
      this.fanCards = document.getElementById('fan-cards');
      this.fanPrev = document.getElementById('fan-prev');
      this.fanNext = document.getElementById('fan-next');
      this.fanDots = document.getElementById('fan-dots');
      this.scrollIndicator = document.getElementById('scroll-indicator');
    }

    // Chỉ chạy 1 lần lúc khởi tạo
    renderInitialCards() {
      if (!this.fanCards) return;
      this.fanCards.innerHTML = '';
      
      for (let i = 0; i < this.cardsPerGroup; i++) {
        const productIndex = this.currentIndex + i;
        const product = this.products[productIndex];
        
        if (product) {
          const card = this.createFanCard(product);
          card.dataset.position = 'hidden-left'; // Bắt đầu ẩn
          this.fanCards.appendChild(card);
          
          // Animate bay vào lần lượt
          setTimeout(() => {
            card.dataset.position = i.toString();
          }, i * 150); // Stagger
        }
      }
      this.updateDots();
      this.updateNavigation();
    }

    createFanCard(product) {
      const card = document.createElement('div');
      card.className = 'fan-card';
      
      if (product) {
        card.dataset.productId = product.id;
        
        const badge = (product.originalPrice && product.originalPrice > product.price)
          ? `<span class="product-badge sale" style="position:absolute; top:15px; right:15px; background:#E86C6C; color:white; padding:5px 10px; border-radius:20px; font-size:12px; font-weight:bold; z-index:56;">-${Math.round((1 - product.price / product.originalPrice) * 100)}%</span>`
          : '';

        card.innerHTML = `
          <div class="product-image-container" style="position:relative;">
            <img src="${product.images?.[0] || 'https://via.placeholder.com/300'}" 
                 alt="${product.name}" 
                 class="product-img"
                 onerror="this.src='https://via.placeholder.com/300'">
            ${badge}
          </div>
          <div class="info">
            <h3>${this.escapeHTML(product.name)}</h3>
            <p class="meta">${this.escapeHTML(product.brand)} • ${this.escapeHTML(product.category)}</p>
            <p class="description">${this.escapeHTML(product.description)}</p>
            <div class="actions">
              <div class="price">
                ${product.originalPrice && product.originalPrice > product.price
                  ? `<span class="old-price">$${product.originalPrice.toFixed(2)}</span>
                     <span class="new-price">$${product.price.toFixed(2)}</span>`
                  : `<span class="new-price">$${product.price.toFixed(2)}</span>`}
              </div>
              <span class="rating">
                ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))} (${product.rating})
              </span>
            </div>
            <div class="buttons">
              <input type="number" class="quantity-input" value="1" min="1" max="99">
              <button class="btn-outline" data-id="${product.id}"></button>
              <button class="btn-primary view-detail-btn" data-id="${product.id}">
                View Details
              </button>
            </div>
          </div>
        `;
        this.attachCardEventListeners(card, product);
      } else {
        // Card trống
        card.innerHTML = `
          <div style="height:100%; display:flex; align-items:center; justify-content:center; color:#9b7c7c; background: rgba(255,255,255,0.9); border: 2px dashed #F9C6CF;">
            <div style="text-align: center;">
              <div style="font-size: 48px; margin-bottom: 15px;">🎀</div>
              <p style="font-size: 16px; font-weight: 600;">No Product</p>
            </div>
          </div>
        `;
      }
      return card;
    }

    attachCardEventListeners(card, product) {
        const cartBtn = card.querySelector('.btn-outline');
        cartBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = cartBtn.dataset.id;
            const product = this.products.find(p => p.id == id);
            const qtyInput = card.querySelector('.quantity-input');
            const qty = qtyInput ? qtyInput.value : 1;
            if (product) {
              this.addToCart(product, parseInt(qty));
            }
        });

        const detailBtn = card.querySelector('.view-detail-btn');
        detailBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = detailBtn.dataset.id;
            window.location.href = `view_product/view_sale.html?id=${id}`;
        });
    }

    // === LOGIC TRƯỢT 1 CARD ===
    next() {
      if (this.isAnimating || (this.currentIndex + this.cardsPerGroup) >= this.products.length) {
          return;
      }
      this.isAnimating = true;

      // 1. Animate card ngoài cùng bên TRÁI (vị trí 0) bay ra
      const cardToRemove = this.fanCards.querySelector('[data-position="0"]');
      if (cardToRemove) {
        cardToRemove.dataset.position = 'hidden-left';
        cardToRemove.addEventListener('transitionend', () => cardToRemove.remove(), { once: true });
      }

      // 2. Dịch chuyển các card còn lại (1, 2, 3, 4) sang TRÁI
      for (let i = 1; i < this.cardsPerGroup; i++) {
        const cardToShift = this.fanCards.querySelector(`[data-position="${i}"]`);
        if (cardToShift) {
          cardToShift.dataset.position = (i - 1).toString(); // (1->0, 2->1, 3->2, 4->3)
        }
      }

      // 3. Tạo card mới và cho bay vào từ PHẢI
      const newProductIndex = this.currentIndex + this.cardsPerGroup;
      const newProduct = this.products[newProductIndex];

      if (newProduct) {
        const newCard = this.createFanCard(newProduct);
        newCard.dataset.position = 'hidden-right'; // Bắt đầu ẩn bên phải
        this.fanCards.appendChild(newCard);
        
        setTimeout(() => {
          newCard.dataset.position = (this.cardsPerGroup - 1).toString(); // Animate vào vị trí 4
        }, 50); 
      }

      // 4. Cập nhật trạng thái
      this.currentIndex++;
      this.updateDots();
      this.updateNavigation();
      
      setTimeout(() => {
          this.isAnimating = false;
      }, this.animationTime);
    }

    prev() {
      if (this.isAnimating || this.currentIndex <= 0) {
          return;
      }
      this.isAnimating = true;

      // 1. Animate card ngoài cùng bên PHẢI (vị trí 4) bay ra
      const cardToRemove = this.fanCards.querySelector(`[data-position="${this.cardsPerGroup - 1}"]`);
      if (cardToRemove) {
        cardToRemove.dataset.position = 'hidden-right';
        cardToRemove.addEventListener('transitionend', () => cardToRemove.remove(), { once: true });
      }

      // 2. Dịch chuyển các card còn lại (0, 1, 2, 3) sang PHẢI
      for (let i = this.cardsPerGroup - 2; i >= 0; i--) {
        const cardToShift = this.fanCards.querySelector(`[data-position="${i}"]`);
        if (cardToShift) {
          cardToShift.dataset.position = (i + 1).toString(); // (3->4, 2->3, 1->2, 0->1)
        }
      }

      // 3. Tạo card mới và cho bay vào từ TRÁI
      const newProductIndex = this.currentIndex - 1;
      const newProduct = this.products[newProductIndex];

      if (newProduct) {
        const newCard = this.createFanCard(newProduct);
        newCard.dataset.position = 'hidden-left'; // Bắt đầu ẩn bên trái
        this.fanCards.prepend(newCard); // Thêm vào đầu
        
        setTimeout(() => {
          newCard.dataset.position = "0"; // Animate vào vị trí 0
        }, 50);
      }
      
      // 4. Cập nhật trạng thái
      this.currentIndex--;
      this.updateDots();
      this.updateNavigation();
      
      setTimeout(() => {
          this.isAnimating = false;
      }, this.animationTime);
    }
    // === KẾT THÚC LOGIC ===

    setupScrollListener() {
      let scrollTimeout;
      let firstScroll = true;
      
      window.addEventListener('wheel', (e) => {
        if (this.isAnimating) return;
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (e.deltaY > 0) {
            this.next(); 
          } else if (e.deltaY < 0) {
            this.prev(); 
          }
          if (firstScroll && this.scrollIndicator) {
            this.scrollIndicator.style.display = 'none';
            firstScroll = false;
          }
        }, 100);
      }, { passive: true });

      let touchStartY = 0;
      this.container.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
      }, { passive: true });
      
      this.container.addEventListener('touchend', (e) => {
        if (this.isAnimating) return;
        const touchEndY = e.changedTouches[0].clientY;
        const diffY = touchStartY - touchEndY;
        const swipeThreshold = 50;
        
        if (Math.abs(diffY) > swipeThreshold) {
          if (diffY > 0) {
            this.next();
          } else {
            this.prev();
          }
        }
      });
    }

    setupEventListeners() {
      if (!this.fanPrev || !this.fanNext) return;
      this.fanPrev.addEventListener('click', () => this.prev());
      this.fanNext.addEventListener('click', () => this.next());
    }

    updateDots() {
      if (!this.fanDots) return;
      const totalDots = this.products.length - this.cardsPerGroup + 1;
      this.fanDots.innerHTML = '';
      
      for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('div');
        dot.className = `fan-dot ${this.currentIndex === i ? 'active' : ''}`;
        dot.addEventListener('click', () => {
          if (this.isAnimating || i === this.currentIndex) return;
          // Tạm thời chỉ cho phép click 1-1
          if (i > this.currentIndex) {
            this.next();
          } else {
            this.prev();
          }
        });
        this.fanDots.appendChild(dot);
      }
    }

    updateNavigation() {
      if (!this.fanPrev || !this.fanNext) return;
      this.fanPrev.disabled = this.currentIndex === 0;
      this.fanNext.disabled = (this.currentIndex + this.cardsPerGroup) >= this.products.length;
    }

    escapeHTML(str) {
      if (typeof str !== 'string') return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    addToCart(product, quantity) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.push({ id: product.id, name: product.name, price: product.price, image: product.images?.[0], quantity: quantity });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        this.showCartPopup(product.name, quantity);
    }

    showCartPopup(productName, quantity) {
        const popup = document.createElement('div');
        popup.className = 'added-cart-popup active';
        popup.innerHTML = `
        <div class="added-cart-wrapper">
            <button class="added-cart-close">&times;</button>
            <h3 class="added-cart-title">🎉 Added to Cart!</h3>
            <p class="added-cart-product">${quantity}x ${this.escapeHTML(productName)}</p>
            <p style="margin-top: 10px; color: #9b7c7c; font-size: 14px;">Continue shopping or view cart</p>
        </div>
        `;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 3000);
        const closeBtn = popup.querySelector('.added-cart-close');
        closeBtn?.addEventListener('click', () => popup.remove());
    }
  }

  // ===================================================================
  // 4. LOAD PRODUCTS
  // ===================================================================
  async function loadMainProducts() {
    let products = [];
    try {
      const res = await fetch('./products.json');
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      if (!Array.isArray(data?.products)) throw new Error('Invalid data');
      products = data.products;
      console.log('Loaded products:', products.length);
    } catch (e) {
      console.error('Error loading products, using fallback:', e);
      products = [
        { id: 1, name: 'Sản phẩm 1', brand: 'Dior', category: 'Lips', price: 45.99, rating: 4.8, description: 'Mô tả 1', images: ['https://via.placeholder.com/300/FF6B6B/FFFFFF?text=Product+1'] },
        { id: 2, name: 'Sản phẩm 2', brand: 'Chanel', category: 'Face', price: 65.99, rating: 4.6, description: 'Mô tả 2', images: ['https://via.placeholder.com/300/FFD93D/000000?text=Product+2'] },
        { id: 3, name: 'Sản phẩm 3', brand: 'YSL', category: 'Eyes', price: 72.99, rating: 4.9, description: 'Mô tả 3', images: ['https://via.placeholder.com/300/FFFFFF/000000?text=Product+3'] },
        { id: 4, name: 'Sản phẩm 4', brand: 'Lancôme', category: 'Eyes', price: 32.99, rating: 4.4, description: 'Mô tả 4', images: ['https://via.placeholder.com/300/4ECDC4/FFFFFF?text=Product+4'] },
        { id: 5, name: 'Sản phẩm 5', brand: 'NARS', category: 'Face', price: 38.99, rating: 4.7, description: 'Mô tả 5', images: ['https://via.placeholder.com/300/A8E6CF/000000?text=Product+5'] },
        { id: 6, name: 'Sản phẩm 6', brand: 'Rare Beauty', category: 'Lips', price: 28.99, rating: 4.5, description: 'Mô tả 6', images: ['https://via.placeholder.com/300/6C5CE7/FFFFFF?text=Product+6'] },
        { id: 7, name: 'Sản phẩm 7', brand: 'Fenty Beauty', category: 'Face', price: 34.99, rating: 4.3, description: 'Mô tả 7', images: ['https://via.placeholder.com/300/FF6B6B/FFFFFF?text=Product+7'] },
        { id: 8, name: 'Sản phẩm 8', brand: 'Charlotte Tilbury', category: 'Eyes', price: 29.99, rating: 4.6, description: 'Mô tả 8', images: ['https://via.placeholder.com/300/FFD93D/000000?text=Product+8'] },
        { id: 9, name: 'Sản phẩm 9', brand: 'Becca', category: 'Face', price: 42.99, rating: 4.8, description: 'Mô tả 9', images: ['https://via.placeholder.com/300/FFFFFF/000000?text=Product+9'] },
        { id: 10, name: 'Sản phẩm 10', brand: 'Urban Decay', category: 'Face', price: 31.99, rating: 4.5, description: 'Mô tả 10', images: ['https://via.placeholder.com/300/4ECDC4/FFFFFF?text=Product+10'] }
      ];
    }
    
    const fanContainer = document.getElementById('fan-container');
    if (fanContainer && products.length > 0) {
      if (products.length >= 5) {
          console.log('Initializing FanLayout with', products.length, 'products');
          new FanLayout(products, fanContainer);
      } else {
          console.warn('Not enough products for FanLayout. Need at least 5.');
      }
    } else {
      console.error('Fan container not found or no products available');
    }
  }

  // ===================================================================
  // 5. FILTER, AI BUTTON, INIT, SALE EVENTS
  // (Tất cả code còn lại giữ nguyên)
  // ===================================================================

  // 5. FILTER EVENT LISTENERS
  const filterToggle = document.getElementById('filter-toggle');
  const filterMenu = document.getElementById('filter-menu');
  
  if (filterToggle && filterMenu) {
    filterToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      filterMenu.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
      if (!filterToggle.contains(e.target) && !filterMenu.contains(e.target)) {
        filterMenu.classList.remove('show');
      }
    });
  }
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('is-selected'));
      this.classList.add('is-selected');
    });
  });

  // 6. AI COMBO BUTTON
  const aiBtn = document.querySelector('.ai-btn');
  if (aiBtn) {
    aiBtn.addEventListener('click', () => {
      alert('AI Combo Suggestion: Try our Luxury Lipstick + Eyeshadow Palette combo for a complete look!');
    });
  }

  // 7. INITIALIZATION
  loadMainProducts();

  // 8. LOAD SALE EVENTS
  fetch('sale_events.json')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('sale-3d');
      const saleSection = document.querySelector('.sale-event');
      if (!container || !saleSection) return;
      const events = data.events || [
        { title: 'Summer Sale', description: 'Up to 50% off', image: 'https://via.placeholder.com/200', color1: '#FFB6C1', color2: '#FF69B4' },
        { title: 'New Arrivals', description: 'Discover latest products', image: 'https://via.placeholder.com/200', color1: '#87CEFA', color2: '#1E90FF' },
        { title: 'Luxury Sets', description: 'Premium bundles', image: 'https://via.placeholder.com/200', color1: '#98FB98', color2: '#32CD32' }
      ];
      const spacing = 100 / (events.length + 1);
      let hoverTimeout;
      events.forEach((event, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        wrapper.style.left = `calc(${spacing * (i + 1)}% - 140px)`;
        const card = document.createElement('div');
        card.className = 'card';
        card.style.background = `linear-gradient(145deg, ${event.color1}, ${event.color2})`;
        card.innerHTML = `<img src="${event.image}" alt="${event.title}"><h3>${event.title}</h3><p>${event.description}</p>`;
        wrapper.appendChild(card);
        container.appendChild(wrapper);
        wrapper.addEventListener('mouseenter', () => {
          clearTimeout(hoverTimeout);
          saleSection.classList.add('lift-title');
        });
        wrapper.addEventListener('mouseleave', () => {
          hoverTimeout = setTimeout(() => {
            if (!container.querySelector('.card-wrapper:hover')) {
              saleSection.classList.remove('lift-title');
            }
          }, 100);
        });
        if (event.link) {
          wrapper.addEventListener('click', () => window.open(event.link, '_blank'));
        }
      });
      saleSection.addEventListener('mouseleave', () => {
        saleSection.classList.remove('lift-title');
      });
    })
    .catch(err => {
      console.error('Failed to load sale_events.json:', err);
      const container = document.getElementById('sale-3d');
      if (container) {
        container.innerHTML = '<p style="text-align:center;color:#9b7c7c; font-size:18px; padding:40px;">Sale events coming soon...</p>';
      }
    });
    
});