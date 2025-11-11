/* =========================================================
   Sakura HOMEPAGE – FULL VERSION (ALL FUNCTIONS ENABLED)
   This is the complete script.js for:
   /1.homepage/js/script.js
   ✅ Fixed all 404 bugs
   ✅ Fixed GSAP blackout
   ✅ Fixed Flash Sale (FAN CLICK ĐƯỢC NHIỀU LẦN)
   ✅ Fixed Best Seller loading
   ✅ Correct image path resolver
========================================================= */

/* =========================================================
   GLOBAL IMAGE PATH RESOLVER (Fix All 404)
========================================================= */
function resolveImagePath(path) {
  if (!path) return "../images/placeholder.png";
  if (path.startsWith("http")) return path;
  const clean = path.replace("./", "").replace("images/", "");
  return `../images/${clean}`;
}

function withFallback(img) {
  img.addEventListener("error", () => {
    img.src = "../images/placeholder.png";
  }, { once: true });
}

/* =========================================================
   1) ANNOUNCEMENT AUTO-SLIDER
========================================================= */
(function initAnnouncement() {
  const wrapper = document.getElementById("announcementWrapper");
  if (!wrapper) return;

  const slides = wrapper.children;
  let index = 0;

  function next() {
    index = (index + 1) % slides.length;
    wrapper.style.transform = `translateX(-${index * 100}%)`;
  }

  setInterval(next, 4000);
})();

/* =========================================================
   2) HERO SLIDER + PARALLAX
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".hero .slide");
  const dotsContainer = document.querySelector(".hero .dots");
  if (!slides.length || !dotsContainer) return;

  let current = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => show(i));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".hero .dot");

  function show(i) {
    slides.forEach((s, j) => {
      s.classList.toggle("active", j === i);
      dots[j].classList.toggle("active", j === i);
    });
    current = i;
  }

  setInterval(() => {
    show((current + 1) % slides.length);
  }, 5000);

  // Parallax
  const applyParallax = () => {
    const active = document.querySelector(".hero .slide.active img");
    const content = document.querySelector(".hero .slide.active .hero-content");
    const y = window.scrollY || 0;
    const offset = Math.min(y / 10, 80);

    if (active) {
      active.style.transform = `scale(${1.1 + y / 2000}) translateY(${offset}px)`;
    }
    if (content) {
      content.style.transform = `translateY(${offset / 3}px)`;
    }
  };

  applyParallax();
  window.addEventListener("scroll", applyParallax);
});

/* =========================================================
   3) NEW COLLECTION SLIDER
========================================================= */
(function initNewCollection() {
  const wrap = document.getElementById("newwrapper");
  const prev = document.getElementById("prevnew");
  const next = document.getElementById("nextnew");
  if (!wrap || !prev || !next) return;

  const amount = () => wrap.clientWidth / 1.5;

  prev.addEventListener("click", () => {
    wrap.scrollBy({ left: -amount(), behavior: "smooth" });
  });
  next.addEventListener("click", () => {
    wrap.scrollBy({ left: amount(), behavior: "smooth" });
  });
})();

/* =========================================================
   BEST SELLERS — GSAP 3D GALLERY
/* =========================================================
   BEST SELLERS — GSAP 3D GALLERY (ĐÃ SỬA 100%)
========================================================= */
let currentImg = undefined,
    currentImgProps = { x: 0, y: 0 },
    isZooming = false,
    mouse = { x: 0, y: 0 },
    delayedPlay;

async function loadBestSellerGallery() {
  try {
    const res = await fetch("../products.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const products = Array.isArray(data) ? data : data.products || [];

    if (products.length === 0) throw new Error("Không có sản phẩm");

    initGSAPGallery(products);
  } catch (err) {
    console.error("Lỗi Best Sellers:", err);
    const container = document.querySelector('.bestseller-gsap');
    if (container) {
      container.innerHTML += `<p style="color:#fff; text-align:center; padding:20px;">
        Không tải được sản phẩm. Vui lòng kiểm tra file JSON.
      </p>`;
    }
  }
}

function initGSAPGallery(products) {
  const container = document.querySelector('.mainBoxes');
  if (!container) return;

  container.innerHTML = '';

  // Đảm bảo 12 sản phẩm
  let list = [...products];
  while (list.length < 12) list = list.concat(products.slice(0, 12 - list.length));
  list = list.slice(0, 12);

  const yStart = [-575, 800, 800];
  const yEnd   = [ 800, -575, -575];
  const dur    = [   40,   35,   26];
  const xPos   = [   60,  280,  500];

  for (let i = 0; i < 12; i++) {
    const p = list[i];
    const col = Math.floor(i / 4);

    const imgUrl = getFirstImage(p.images);
    const displayName = `${p.brand} ${p.name}`;
    const displayPrice = p.originalPrice
      ? `<del>$${p.originalPrice.toFixed(2)}</del> <strong>$${p.price.toFixed(2)}</strong>`
      : `$${p.price.toFixed(2)}`;

    const b = document.createElement('div');
    b.className = `photoBox pb-col${col}`;
    b.id = `b${i}`;
    b.dataset.name = displayName;
    b.dataset.price = displayPrice.replace(/<\/?[^>]+(>|$)/g, "");
    b.dataset.brand = p.brand;
    b.style.backgroundImage = `url(${imgUrl})`;
    b.style.backgroundSize = 'cover';
    b.style.backgroundPosition = 'center';
    b.setAttribute('data-tooltip', displayName);
    b.setAttribute('data-price-html', displayPrice);
    container.appendChild(b);

    addImageFallback(b);

    gsap.set(b, {
      x: xPos[col],
      width: 400,
      height: 640,
      borderRadius: 20,
      scale: 0.5,
      zIndex: 1,
      opacity: 1,
      cursor: 'pointer',
    });

    b.tl = gsap.timeline({ paused: true, repeat: -1 })
      .fromTo(b, { y: yStart[col], rotation: -0.05 }, {
        duration: dur[col],
        y: yEnd[col],
        rotation: 0.05,
        ease: 'none'
      })
      .progress((i % 4) / 4)
      .play();
  }

  setupGSAPInteractions();
}


function getFirstImage(images) {
  if (!Array.isArray(images) || images.length === 0) return "../images/placeholder.png";
  return resolveImagePath(images[0]); // DÙNG HÀM CÓ SẴN
}

function addImageFallback(box) {
  const img = new Image();
  img.src = box.style.backgroundImage.slice(4, -1).replace(/"/g, "");
  img.onerror = () => {
    box.style.backgroundImage = `url(../images/placeholder.png)`;
    box.style.backgroundColor = '#f0f0f0';
  };
}

function pauseBoxes(b) {
  const colClass = b.classList.contains('pb-col1') ? 'pb-col1' :
                   b.classList.contains('pb-col2') ? 'pb-col2' : 'pb-col0';
  document.querySelectorAll('.mainBoxes > div').forEach(box => {
    if (box.classList.contains(colClass)) {
      gsap.to(box.tl, { timeScale: 0, ease: 'sine' });
    }
  });
}

function playBoxes() {
  document.querySelectorAll('.mainBoxes > div').forEach(box => {
    const tl = box.tl;
    if (tl) {
      tl.play();
      gsap.to(tl, { duration: 0.4, timeScale: 1, ease: 'sine.in', overwrite: true });
    }
  });
}

function setupGSAPInteractions() {
  const tl = gsap.timeline({ onStart: playBoxes })
    .set('.main', { perspective: 800 })
    .set('.photoBox', { opacity: 1, cursor: 'pointer' })
    .set('.mainBoxes', { 
      left: '50%',
      xPercent: -50,
      x: -170,
      width: 1200,
      rotationX: 14,
      rotationY: -15,
      rotationZ: 10
    })
    .set('.mainClose', { autoAlpha: 0, width: 60, height: 60, left: -30, top: -31, pointerEvents: 'none' })
    .fromTo('.main', { autoAlpha: 0 }, { duration: 0.6, ease: 'power2.inOut', autoAlpha: 1 }, 0.2);

  document.querySelectorAll('.photoBox').forEach(box => {
    addImageFallback(box);

    box.addEventListener('mouseenter', e => {
      if (currentImg || delayedPlay) return;
      delayedPlay?.kill();
      pauseBoxes(e.currentTarget);
      const _t = e.currentTarget;
      gsap.to('.photoBox', { duration: 0.2, opacity: t => t === _t ? 1 : 0.33 });
      gsap.fromTo(_t, { zIndex: 100 }, { duration: 0.2, scale: 0.62, ease: 'power3' });
    });

    box.addEventListener('mouseleave', e => {
      if (currentImg) return;
      const _t = e.currentTarget;
      if (gsap.getProperty(_t, 'scale') > 0.62) {
        delayedPlay = gsap.delayedCall(0.3, playBoxes);
      } else {
        playBoxes();
      }
      gsap.timeline()
        .set(_t, { zIndex: 1 })
        .to(_t, { duration: 0.3, scale: 0.5, ease: 'expo' }, 0)
        .to('.photoBox', { duration: 0.5, opacity: 1, ease: 'power2.inOut' }, 0);
    });

    box.addEventListener('click', e => {
      if (isZooming) return;
      isZooming = true;
      gsap.delayedCall(0.8, () => isZooming = false);

      const _t = e.currentTarget;

      if (currentImg) {
        _t.dataset.zoomed = "false";
        gsap.timeline({ defaults: { ease: 'expo.inOut' } })
          .to('.mainClose', { duration: 0.1, autoAlpha: 0 }, 0)
          .to('.mainBoxes', { duration: 0.5, scale: 1, left: '75%', width: 1200, rotationX: 14, rotationY: -15, rotationZ: 10 }, 0)
          .to('.photoBox', { duration: 0.6, opacity: 1, ease: 'power4.inOut' }, 0)
          .to(currentImg, {
            duration: 0.6,
            width: 400, height: 640, borderRadius: 20,
            x: currentImgProps.x, y: currentImgProps.y,
            scale: 0.5, rotation: 0, zIndex: 1
          }, 0);
        currentImg = undefined;
      } else {
        pauseBoxes(_t);
        currentImg = _t;
        currentImgProps.x = gsap.getProperty(currentImg, 'x');
        currentImgProps.y = gsap.getProperty(currentImg, 'y');
        currentImg.dataset.zoomed = "true";

        gsap.timeline({ defaults: { duration: 0.6, ease: 'expo.inOut' } })
          .set(currentImg, { zIndex: 100 })
          .fromTo('.mainClose', { x: mouse.x, y: mouse.y, background: 'rgba(0,0,0,0)' }, { autoAlpha: 1, duration: 0.3, ease: 'power3.inOut' }, 0)
          .to('.photoBox', { opacity: t => t === currentImg ? 1 : 0 }, 0)
          .to(currentImg, { width: '100%', height: '100%', borderRadius: 0, x: 0, top: 0, y: 0, scale: 1, opacity: 1 }, 0)
          .to('.mainBoxes', { duration: 0.5, left: '50%', width: '100%', rotationX: 0, rotationY: 0, rotationZ: 0 }, 0.15)
          .to('.mainBoxes', { duration: 5, scale: 1.06, rotation: 0.05, ease: 'none' }, 0.65);
      }
    });
  });

  if (!('ontouchstart' in window)) {
    document.querySelector('.main').addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (currentImg) {
        gsap.to('.mainClose', { duration: 0.1, x: mouse.x, y: mouse.y, overwrite: true });
      }
    });
  } else {
    mouse.x = window.innerWidth - 50;
    mouse.y = 60;
  }
}

document.addEventListener("DOMContentLoaded", loadBestSellerGallery);

/* =========================================================
   5) FLASH SALE — 3 FAN + 6 TRACK SCROLL (ĐÃ SỬA CHUẨN – CLICK NHIỀU LẦN)
========================================================= */
let expanded = false; // ← TOÀN CỤC

(function initFlashSaleFan() {
  const fan3 = document.getElementById("fan3");
  const row6 = document.getElementById("row6");
  const track = document.getElementById("trackList");

  if (!fan3 || !row6 || !track) return;

  (async () => {
    try {
      const res = await fetch("../../Sale/products.json");
      if (!res.ok) throw new Error("Không load được Sale/products.json");

      const data = await res.json();
      const items = (data.products || []).slice(0, 6);

      /* ============ FAN 3 ẢNH ============ */
      items.slice(0, 3).forEach((p, i) => {
        const imgEl = document.createElement("img");
        imgEl.className = "fan-img";
        imgEl.src = resolveImagePath(p.images?.[0]);
        withFallback(imgEl);
        imgEl.addEventListener("click", toggleExpand); // ← CLICK ĐƯỢC NHIỀU LẦN
        fan3.appendChild(imgEl);
      });

      /* ============ 6 ẢNH NGANG ============ */
      items.forEach((p) => {
        const li = document.createElement("li");
        li.className = "track__item";

        const badge = (p.originalPrice && p.originalPrice > p.price)
          ? `<span class="product-badge sale">-${Math.round((1 - p.price / p.originalPrice) * 100)}%</span>`
          : '';

        li.innerHTML = `
          <div class="track-product-card">
            <div class="product-image-container">
              <img src="${resolveImagePath(p.images?.[0])}" alt="${p.name}">
              ${badge}
            </div>
            <div class="track-product-info">
              <h3>${p.name}</h3>
              <p class="meta">${p.brand} • ${p.category}</p>
              <p class="description">${p.description}</p>
              <div class="actions">
                <div class="price">
                  ${p.originalPrice && p.originalPrice > p.price
                    ? `<span class="old-price">$${p.originalPrice.toFixed(2)}</span>
                       <span class="new-price">$${p.price.toFixed(2)}</span>`
                    : `<span class="new-price">$${p.price.toFixed(2)}</span>`}
                </div>
                <span class="rating">
                  ${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))} (${p.rating})
                </span>
              </div>
              <div class="view-details-container">
                <a href="../../Sale/view_product/view_sale.html?id=${p.id}" class="btn-view-details">
                  View Details
                </a>
              </div>
            </div>
          </div>
          <div class="shadow"></div>
        `;

        withFallback(li.querySelector("img"));
        track.appendChild(li);
      });

    } catch (err) {
      console.error("Flash Sale Load Error:", err);
    }
  })();

})();

/* ============ HIỆU ỨNG BUNG/THU (TOÀN CỤC) ============ */
function toggleExpand() {
  if (expanded) {
    collapseFlashSale();
  } else {
    expandFlashSale();
  }
}

function expandFlashSale() {
  expanded = true;
  const fan3 = document.getElementById("fan3");
  const row6 = document.getElementById("row6");

  fan3.classList.add("hide");
  row6.classList.add("show");

  const frames = document.querySelectorAll(".track__item");
  frames.forEach((item, i) => {
    item.classList.remove("animate-in");
    void item.offsetWidth;
    item.classList.add("animate-in");
    item.style.animationDelay = `${i * 100}ms`;
  });

  setTimeout(pushFooterDown, 600);
}

function collapseFlashSale() {
  expanded = false;
  const fan3 = document.getElementById("fan3");
  const row6 = document.getElementById("row6");

  fan3.classList.remove("hide");
  row6.classList.remove("show");

  const frames = document.querySelectorAll(".track__item");
  frames.forEach(item => {
    item.classList.remove("animate-in");
    item.style.opacity = "0";
    item.style.transform = "translateY(50px) scale(0.9)";
  });

  document.body.style.paddingBottom = "";
}

function pushFooterDown() {
  const footer = document.querySelector("footer");
  if (!footer) return;

  const row6 = document.getElementById("row6");
  const rect = row6.getBoundingClientRect();
  const footerTop = footer.getBoundingClientRect().top;
  const gap = footerTop - (rect.bottom + 30);

  if (gap < 0) {
    document.body.style.paddingBottom = `${Math.abs(gap) + 60}px`;
  }
}

/* =========================================================
   6) MENU TOGGLER + SEARCH OVERLAY
========================================================= */
(function initMenuAndSearch() {
  const menuToggler = document.getElementById("menu-toggler");
  const navbar = document.getElementById("navbar");
  const shopAll = document.querySelector(".shop-all");
  const menuCategories = document.querySelector(".menu-categories");
  const backBtn = document.querySelector(".back-btn");
  const nextButtons = document.querySelectorAll(".next-btn");

  const headerSearchIcon = document.querySelector(".search .icon");
  const headerSearchInput = document.getElementById("search-input-main");

  const searchOverlay = document.createElement("div");
  const searchWrapper = document.createElement("div");
  const searchInputOverlay = document.createElement("input");
  const closeSearch = document.createElement("button");

  searchOverlay.className = "search-overlay";
  searchWrapper.className = "search-wrapper";
  searchInputOverlay.className = "search-input";
  closeSearch.className = "close-search";

  searchInputOverlay.placeholder = "Search for...";
  closeSearch.innerHTML = "×";

  searchWrapper.append(searchInputOverlay, closeSearch);
  searchOverlay.append(searchWrapper);
  document.body.appendChild(searchOverlay);

  headerSearchIcon?.addEventListener("click", () => {
    searchOverlay.classList.add("active");
    searchInputOverlay.focus();
    document.body.style.overflow = "hidden";
  });

  closeSearch.addEventListener("click", () => {
    searchOverlay.classList.remove("active");
    document.body.style.overflow = "";
  });

  searchInputOverlay.addEventListener("input", () => {
    const q = searchInputOverlay.value.toLowerCase();
    headerSearchInput.value = q;
    if (window.filterProducts) window.filterProducts(q);
  });

  function closeMenu() {
    navbar.classList.remove("active");
    navbar.style.transform = "translateY(-100%)";
    navbar.style.opacity = 0;
    document.body.style.overflow = "";
  }

  menuToggler?.addEventListener("click", () => {
    const active = navbar.classList.toggle("active");
    navbar.style.transform = active ? "translateY(0)" : "translateY(-100%)";
    navbar.style.opacity = active ? 1 : 0;
    document.body.style.overflow = active ? "hidden" : "";
  });

  document.addEventListener("click", e => {
    if (
      window.innerWidth <= 900 &&
      navbar.classList.contains("active") &&
      !navbar.contains(e.target) &&
      !menuToggler.contains(e.target)
    ) {
      closeMenu();
    }
  });

  if (shopAll && menuCategories) {
    if (window.innerWidth > 900) {
      shopAll.addEventListener("mouseenter", () => {
        menuCategories.style.display = "block";
        menuCategories.style.opacity = 1;
        menuCategories.style.transform = "translateY(0)";
      });

      menuCategories.addEventListener("mouseleave", () => {
        menuCategories.style.display = "none";
        menuCategories.style.opacity = 0;
      });
    }

    shopAll.addEventListener("click", e => {
      if (window.innerWidth > 900) return;
      e.preventDefault();
      const active = menuCategories.classList.toggle("active");
      menuCategories.style.display = active ? "flex" : "none";
      backBtn.style.display = active ? "flex" : "none";
    });

    backBtn?.addEventListener("click", () => {
      menuCategories.classList.remove("active");
      menuCategories.style.display = "none";
      backBtn.style.display = "none";
    });

    nextButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const cat = btn.closest(".category");
        const list = cat.querySelector(".product-list");
        document.querySelectorAll(".category").forEach(c => {
          c.classList.remove("active");
          const l = c.querySelector(".product-list");
          if (l) l.style.display = "none";
        });
        cat.classList.add("active");
        list.style.display = "block";
      });
    });
  }
})();

/* =========================================================
   7) HOTSPOTS — HOVER TOOLTIP + CLICK JUMP
========================================================= */
(function initHotspots() {
  const spots = document.querySelectorAll(".hotspot");
  if (!spots.length) return;

  spots.forEach(spot => {
    const id = spot.getAttribute("data-id");
    const img = spot.getAttribute("data-img");
    const name = spot.getAttribute("data-name") || "Product";

    if (!id || !img) return;

    let tooltip = null;

    spot.addEventListener("mouseenter", () => {
      tooltip = document.createElement("div");
      tooltip.className = "hotspot-tooltip";
      tooltip.innerHTML = `
        <img src="${img}">
        <div class="tooltip-name">${name}</div>
      `;

      tooltip.style.cssText = `
        position:absolute;
        top:-130px;
        left:50%;
        transform:translateX(-50%);
        width:160px;
        background:#fff;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 16px 45px rgba(0,0,0,.35);
        opacity:0;
        transition:all .3s ease;
      `;

      spot.appendChild(tooltip);

      requestAnimationFrame(() => {
        tooltip.style.opacity = 1;
        tooltip.style.transform = "translateX(-50%) translateY(-12px)";
      });
    });

    spot.addEventListener("mouseleave", () => {
      if (!tooltip) return;
      tooltip.style.opacity = 0;
      tooltip.style.transform = "translateX(-50%) translateY(0)";
      setTimeout(() => tooltip?.remove(), 300);
    });

    spot.addEventListener("click", e => {
      e.stopPropagation();
      window.location.href = `../new/view_product/view_new.html?id=${id}`;
    });
  });
})();

/* =========================================================
   8) SCROLL REVEAL
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const revealTargets = [
    ".category-card",
    ".new-products",
    ".slider-new .newproduct",
    ".Bestsellers .product-card",
    ".reward-section",
    ".slider-container",
    ".sliderBestsellers",
  ];

  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("show");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealTargets.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add("reveal");
      obs.observe(el);
    });
  });
});


/* =========================================================
   9) STICKY HEADER
========================================================= */
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (!header) return;
  header.classList.toggle("sticky", window.scrollY > 40);
});

/* =========================================================
   BEST SELLER AUTO-EXPANSION ON FLASH SALE HOVER
========================================================= */
function initBestSellerExpansion() {
  const flashSaleRow = document.getElementById('row6');
  const bestSellersSection = document.querySelector('.bestseller-gsap');
  
  if (!flashSaleRow || !bestSellersSection) return;

  let expansionTimeout;
  let isExpanded = false;

  // Function to expand Best Sellers
  function expandBestSellers() {
    if (isExpanded) return;
    
    isExpanded = true;
    bestSellersSection.classList.add('expanded');
    
    // Add smooth height transition
    gsap.to(bestSellersSection, {
      duration: 0.6,
      height: '700px',
      ease: 'power2.out'
    });
    
    // Scale up the gallery content
    gsap.to('.gsap-gallery', {
      duration: 0.5,
      scale: 1.05,
      ease: 'back.out(1.7)'
    });
  }

  // Function to collapse Best Sellers
  function collapseBestSellers() {
    if (!isExpanded) return;
    
    isExpanded = false;
    
    // Animate back to original state
    gsap.to(bestSellersSection, {
      duration: 0.5,
      height: '100vh',
      ease: 'power2.inOut',
      onComplete: () => {
        bestSellersSection.classList.remove('expanded');
      }
    });
    
    // Scale back gallery content
    gsap.to('.gsap-gallery', {
      duration: 0.4,
      scale: 1,
      ease: 'power2.inOut'
    });
  }

  // Event listeners for Flash Sale hover
  flashSaleRow.addEventListener('mouseenter', () => {
    clearTimeout(expansionTimeout);
    expansionTimeout = setTimeout(expandBestSellers, 300);
  });

  flashSaleRow.addEventListener('mouseleave', () => {
    clearTimeout(expansionTimeout);
    expansionTimeout = setTimeout(collapseBestSellers, 500);
  });

  // Also trigger on track items hover for better UX
  const trackItems = document.querySelectorAll('.track__item');
  trackItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      clearTimeout(expansionTimeout);
      expansionTimeout = setTimeout(expandBestSellers, 200);
    });
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initBestSellerExpansion);
/* HERO SLIDE BUTTONS → GO TO CATEGORIES PAGE (ĐÃ SỬA ỔN ĐỊNH) */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".hero .btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); // ← Ngăn hành vi mặc định (nếu là <a>)
      e.stopPropagation(); // ← Ngăn lan truyền

      // Đường dẫn đúng theo cấu trúc bạn
      window.location.href = "../../categories/categories.html";
    });
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const faceBtn = document.getElementById("shopnowface");
  if (faceBtn) {
    faceBtn.addEventListener("click", () => {
      window.location.href = "../../categories/categories.html?category=Face";
    });
  }

  const lipsBtn = document.getElementById("shopnowlips");
  if (lipsBtn) {
    lipsBtn.addEventListener("click", () => {
      window.location.href = "../../categories/categories.html?category=Lips";
    });
  }

  const eyesBtn = document.getElementById("shopnoweyes");
  if (eyesBtn) {
    eyesBtn.addEventListener("click", () => {
      window.location.href = "../../categories/categories.html?category=Eyes";
    });
  }
});
/* =========================================================
   DONE — END OF FULL SCRIPT
========================================================= */