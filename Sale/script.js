document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  // ===================================================================
  // 1. LOAD HEADER & FOOTER (Chuyển sang partials.js)
  // ===================================================================
  // partials.js sẽ tự inject header/footer vào các placeholder.
  // Sau khi header được inject, đồng bộ số lượng giỏ hàng
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    const obs = new MutationObserver(() => {
      if (typeof updateCartCount === 'function') {
        updateCartCount();
      }
    });
    obs.observe(headerPlaceholder, { childList: true, subtree: true });
  }

  // ===================================================================
  // 2. FIREWORKS (Giữ nguyên)
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
  // 3. FAN LAYOUT CLASS (ĐÃ SỬA LẠI CARD HTML)
  // ===================================================================
  class FanLayout {
    constructor(products, container) {
      this.products = products;
      this.container = container;
      this.currentIndex = 0; 
      this.cardsPerGroup = 5;
      this.isAnimating = false;
      this.animationTime = 300; // Tốc độ chạy 1.2s
      this.autoplayInterval = null;
      this.autoplayTime = 2000; // Nghỉ 3s
      this.init();
    }

    init() {
      if (!this.container) {
        console.error('Container not found for FanLayout');
        return;
      }
      
      this.createFanLayout();
      this.renderInitialCards();
      this.setupEventListeners(); 
      this.startAutoPlay();
    }

    createFanLayout() {
      // Dùng nút có chữ cho an toàn 100%
      this.fanHTML = `
        <div class="fan-viewport">
          <div class="fan-cards" id="fan-cards"></div>
        </div>
        <div class="fan-navigation">
          <button class="fan-nav-btn" id="fan-prev">
            ←
          </button>
          <div class="fan-dots" id="fan-dots"></div>
          <button class="fan-nav-btn" id="fan-next">
            →
          </button>
        </div>
      `;

      this.container.innerHTML = this.fanHTML;
      
      this.fanCards = document.getElementById('fan-cards');
      this.fanPrev = document.getElementById('fan-prev');
      this.fanNext = document.getElementById('fan-next');
      this.fanDots = document.getElementById('fan-dots');
    }

    renderInitialCards() {
      if (!this.fanCards) return;
      this.fanCards.innerHTML = '';
      for (let i = 0; i < this.cardsPerGroup; i++) {
        const product = this.products[this.currentIndex + i] || null;
        const card = this.createFanCard(product);
        card.dataset.position = 'hidden-left';
        this.fanCards.appendChild(card);
        setTimeout(() => {
          card.dataset.position = i.toString();
        }, i * 150);
      }
      this.updateDots();
      this.updateNavigation();
    }

    // *** BẮT ĐẦU SỬA LỖI (DÁN CODE HTML CŨ VÀO ĐÂY) ***
    createFanCard(product) {
      const card = document.createElement('div');
      card.className = 'fan-card';
      
      if (product) {
        card.dataset.productId = product.id;
        
        const badge = (product.originalPrice && product.originalPrice > product.price)
          ? `<span class="product-badge sale" style="position:absolute; top:15px; right:15px; background:#E86C6C; color:white; padding:5px 10px; border-radius:20px; font-size:12px; font-weight:bold; z-index:56;">-${Math.round((1 - product.price / product.originalPrice) * 100)}%</span>`
          : '';

        // ĐÂY LÀ CODE HTML ĐẦY ĐỦ TỪ FILE CŨ CỦA BẠN
        card.innerHTML = `
          <div class="product-image-container" style="position:relative;">
            <img src="${product.images?.[0] || '/header_footer/images/LOGO.png'}" 
                 alt="${product.name}" 
                 class="product-img"
                 onerror="this.src='/header_footer/images/LOGO.png'">
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
              <button class="btn-outline" data-id="${product.id}"></button>
              <button class="btn-primary view-detail-btn" data-id="${product.id}">
                View Details
              </button>
            </div>
          </div>
        `;
        // Phải gọi hàm này để các nút mới có thể bấm được
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

    // Hàm này RẤT QUAN TRỌNG để nút "cart" và "view" hoạt động
    attachCardEventListeners(card, product) {
        const cartBtn = card.querySelector('.btn-outline');
        cartBtn?.addEventListener('click', (e) => {
            e.stopPropagation(); // Ngăn card bị click
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
            e.stopPropagation(); // Ngăn card bị click
            const id = detailBtn.dataset.id;
            window.location.href = `view_product/view_sale.html?id=${id}`;
        });
    }
    // *** KẾT THÚC SỬA LỖI ***

    // (Các hàm next, prev, jumpTo, autoPlay... giữ nguyên)
    next() {
      if ((this.currentIndex + this.cardsPerGroup) >= this.products.length) {
        this.jumpTo(0, 'next'); 
        return;
      }
      if (this.isAnimating) return;
      this.isAnimating = true;

      const cardToRemove = this.fanCards.querySelector('[data-position="0"]');
      if (cardToRemove) {
        cardToRemove.dataset.position = 'hidden-left';
        cardToRemove.addEventListener('transitionend', () => cardToRemove.remove(), { once: true });
      }
      for (let i = 1; i < this.cardsPerGroup; i++) {
        const cardToShift = this.fanCards.querySelector(`[data-position="${i}"]`);
        if (cardToShift) cardToShift.dataset.position = (i - 1).toString(); 
      }
      const newProductIndex = this.currentIndex + this.cardsPerGroup;
      const newProduct = this.products[newProductIndex] || null;
      const newCard = this.createFanCard(newProduct);
      newCard.dataset.position = 'hidden-right';
      this.fanCards.appendChild(newCard);
      setTimeout(() => { newCard.dataset.position = (this.cardsPerGroup - 1).toString(); }, 50); 
      this.currentIndex++;
      this.updateDots();
      this.updateNavigation();
      setTimeout(() => { this.isAnimating = false; }, this.animationTime);
    }

    prev() {
      if (this.isAnimating || this.currentIndex <= 0) return;
      this.isAnimating = true;

      const cardToRemove = this.fanCards.querySelector(`[data-position="${this.cardsPerGroup - 1}"]`);
      if (cardToRemove) {
        cardToRemove.dataset.position = 'hidden-right';
        cardToRemove.addEventListener('transitionend', () => cardToRemove.remove(), { once: true });
      }
      for (let i = this.cardsPerGroup - 2; i >= 0; i--) {
        const cardToShift = this.fanCards.querySelector(`[data-position="${i}"]`);
        if (cardToShift) cardToShift.dataset.position = (i + 1).toString();
      }
      const newProductIndex = this.currentIndex - 1;
      const newProduct = this.products[newProductIndex] || null;
      const newCard = this.createFanCard(newProduct);
      newCard.dataset.position = 'hidden-left';
      this.fanCards.prepend(newCard); 
      setTimeout(() => { newCard.dataset.position = "0"; }, 50);
      this.currentIndex--;
      this.updateDots();
      this.updateNavigation();
      setTimeout(() => { this.isAnimating = false; }, this.animationTime);
    }

    jumpTo(newIndex, direction = 'jump') {
      if (this.isAnimating || newIndex === this.currentIndex) return;
      this.isAnimating = true;
      const outDirection = (direction === 'next' || newIndex > this.currentIndex) ? 'hidden-left' : 'hidden-right';
      const inDirection = (direction === 'next' || newIndex > this.currentIndex) ? 'hidden-right' : 'hidden-left';
      this.currentIndex = newIndex;

      const oldCards = this.fanCards.querySelectorAll('.fan-card');
      oldCards.forEach((card, i) => {
        card.dataset.position = outDirection;
        card.addEventListener('transitionend', () => card.remove(), { once: true });
      });

      for (let i = 0; i < this.cardsPerGroup; i++) {
        const product = this.products[this.currentIndex + i] || null; 
        const card = this.createFanCard(product);
        card.dataset.position = inDirection;
        this.fanCards.appendChild(card);
        setTimeout(() => {
          card.dataset.position = i.toString();
        }, i * 100);
      }
      this.updateDots();
      this.updateNavigation();
      setTimeout(() => { this.isAnimating = false; }, this.animationTime + 150);
    }

    startAutoPlay() {
      if (this.autoplayInterval) return;
      this.autoplayInterval = setInterval(() => {
        this.next();
      }, this.autoplayTime);
    }

    stopAutoPlay() {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
        
    setupEventListeners() {
      if (!this.fanPrev || !this.fanNext) return;
      
      this.fanPrev.addEventListener('click', () => {
        this.stopAutoPlay();
        this.prev();
      });
      this.fanNext.addEventListener('click', () => {
        this.stopAutoPlay();
        this.next();
      });

      this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
      this.container.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    updateDots() {
      if (!this.fanDots) return;
      // Sửa lỗi logic: Phải có đủ sản phẩm để tạo dot
      const totalValidProducts = this.products.filter(p => p).length;
      if (totalValidProducts < this.cardsPerGroup) {
        this.fanDots.innerHTML = '';
        return;
      }
      const totalDots = totalValidProducts - this.cardsPerGroup + 1;
      
      this.fanDots.innerHTML = '';
      
      for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('div');
        dot.className = `fan-dot ${this.currentIndex === i ? 'active' : ''}`;
        dot.addEventListener('click', () => {
          this.stopAutoPlay(); 
          this.jumpTo(i); 
        });
        this.fanDots.appendChild(dot);
      }
    }

    updateNavigation() {
      if (!this.fanPrev || !this.fanNext) return;
      this.fanPrev.disabled = this.currentIndex === 0;
      this.fanNext.disabled = false;
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
            existingItem.quantity = parseInt(existingItem.quantity) + parseInt(quantity);
        } else {
            cart.push({ id: product.id, name: product.name, price: product.price, image: product.images?.[0], quantity: parseInt(quantity) });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        this.showCartPopup(product.name, quantity);
    }
    showCartPopup(productName, quantity) {
        const popup = document.createElement('div');
        popup.className = 'added-cart-popup active';
        popup.innerHTML = `<div class="added-cart-wrapper"><button class="added-cart-close">&times;</button><h3 class="added-cart-title">🎉 Added to Cart!</h3><p class="added-cart-product">${quantity}x ${this.escapeHTML(productName)}</p><p style="margin-top: 10px; color: #9b7c7c; font-size: 14px;">Continue shopping or view cart</p></div>`;
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
      const res = await fetch('/Sale/products.json'); 
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      if (!Array.isArray(data?.products)) throw new Error('Invalid data');
      products = data.products;
    } catch (e) {
      console.error('Error loading products, using fallback:', e);
      products = [
        { id: 1, name: 'Sản phẩm 1', brand: 'Dior', category: 'Lips', price: 45.99, rating: 4.8, description: 'Mô tả 1', images: ['/header_footer/images/LOGO.png'] },
        { id: 2, name: 'Sản phẩm 2', brand: 'Chanel', category: 'Face', price: 65.99, rating: 4.6, description: 'Mô tả 2', images: ['/header_footer/images/LOGO.png'] },
        { id: 3, name: 'Sản phẩm 3', brand: 'YSL', category: 'Eyes', price: 72.99, rating: 4.9, description: 'Mô tả 3', images: ['/header_footer/images/LOGO.png'] },
        { id: 4, name: 'Sản phẩm 4', brand: 'Lancôme', category: 'Eyes', price: 32.99, rating: 4.4, description: 'Mô tả 4', images: ['/header_footer/images/LOGO.png'] },
        { id: 5, name: 'Sản phẩm 5', brand: 'NARS', category: 'Face', price: 38.99, rating: 4.7, description: 'Mô tả 5', images: ['/header_footer/images/LOGO.png'] },
        { id: 6, name: 'Sản phẩm 6', brand: 'Rare Beauty', category: 'Lips', price: 28.99, rating: 4.5, description: 'Mô tả 6', images: ['/header_footer/images/LOGO.png'] },
        { id: 7, name: 'Sản phẩm 7', brand: 'Fenty Beauty', category: 'Face', price: 34.99, rating: 4.3, description: 'Mô tả 7', images: ['/header_footer/images/LOGO.png'] },
        { id: 8, name: 'Sản phẩm 8', brand: 'Charlotte Tilbury', category: 'Eyes', price: 29.99, rating: 4.6, description: 'Mô tả 8', images: ['/header_footer/images/LOGO.png'] },
        { id: 9, name: 'Sản phẩm 9', brand: 'Becca', category: 'Face', price: 42.99, rating: 4.8, description: 'Mô tả 9', images: ['/header_footer/images/LOGO.png'] },
        { id: 10, name: 'Sản phẩm 10', brand: 'Urban Decay', category: 'Face', price: 31.99, rating: 4.5, description: 'Mô tả 10', images: ['/header_footer/images/LOGO.png'] }
      ];
    }
    
    // Đây là code chạy FAN (xòe quạt)
    const fanContainer = document.getElementById('fan-container'); 
    if (fanContainer && products.length > 0) {
      if (products.length >= 5) {
          console.log('Initializing FanLayout with', products.length, 'products');
          new FanLayout(products, fanContainer);
      } else {
          console.warn('Not enough products for FanLayout. Need at least 5.');
      }
    } else {
      console.log('Fan container not found, skipping FanLayout.');
    }

    // Đây là code chạy GRID (lưới sản phẩm)
    const gridContainer = document.getElementById('products');
    if (gridContainer && products.length > 0) {
        console.log('Initializing Product Grid');
        // (Nếu bạn có logic cho grid thì đặt ở đây, nếu không thì 2
        // hàm load.../render... bên dưới sẽ chạy)
    }
  }

  // ===================================================================
  // 5. CÁC PHẦN CÒN LẠI (Filter, AI, Sale Event)
  // ===================================================================
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

  const aiBtn = document.querySelector('.ai-btn');
  if (aiBtn) {
    aiBtn.addEventListener('click', () => {
      alert('AI Combo Suggestion: Try our Luxury Lipstick + Eyeshadow Palette combo for a complete look!');
    });
  }

  loadMainProducts(); 

  fetch('sale_events.json')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('sale-3d');
      const saleSection = document.querySelector('.sale-event');
      if (!container || !saleSection) return;
      const events = data.events || [];
      if (events.length === 0) return;
        
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
