/* =========================================================
   Sakura – HOMEPAGE SCRIPT (safe + guarded)
   Folder gốc của file này: 1.homepage/js/script.js
   Cây thư mục bạn gửi:
     1.homepage/
       ├─ images/
       ├─ js/script.js   (THIS)
       ├─ products.json
     new/
       ├─ products.json
       └─ view_product/view_new.html
     Sale/
       ├─ products.json
       └─ view_product/view_sale.html
   ========================================================= */

/* ------------------ Constants & Helpers ------------------ */
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=720&fit=crop&auto=format";

/** Nối baseDir + relative path an toàn (giữ http/https) */
function joinPath(baseDir, rel) {
  if (!rel) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(rel)) return rel;
  // bỏ ./ và / thừa
  const clean = String(rel).replace(/^\.?\//, "");
  return `${baseDir.replace(/\/$/, "")}/${clean}`;
}

/** Thêm fallback ảnh 404 */
function withFallback(imgEl) {
  if (!imgEl) return;
  imgEl.addEventListener(
    "error",
    () => {
      imgEl.src = DEFAULT_IMAGE;
    },
    { once: true }
  );
}

/* =========================================================
   1) ANNOUNCEMENT (guarded, chạy ngay)
   ========================================================= */
(function initAnnouncement() {
  const wrapper1 = document.getElementById("announcementWrapper");
  const announcement = document.querySelectorAll(".announcement-slide");
  let indexAnnouncement = 0;

  function showAnnouncement(i) {
    if (!wrapper1) return;
    wrapper1.style.transform = `translateX(-${i * 100}%)`;
  }

  if (wrapper1 && announcement.length > 0) {
    setInterval(() => {
      indexAnnouncement = (indexAnnouncement + 1) % announcement.length;
      showAnnouncement(indexAnnouncement);
    }, 5000);
  }
})();

/* =========================================================
   2) DOM Ready – tất cả còn lại
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  /* ------------------ HERO SLIDE ------------------ */
  (function initHero() {
    const slides = document.querySelectorAll(".hero .slide");
    const dotsContainer = document.querySelector(".hero .dots");
    if (!slides.length || !dotsContainer) return;

    let indexHero = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className = "dot" + (i === 0 ? " active" : "");
      dot.addEventListener("click", () => showHero(i));
      dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll(".hero .dot");

    function showHero(i) {
      slides.forEach((slide, j) => {
        slide.classList.toggle("active", j === i);
        if (dots[j]) dots[j].classList.toggle("active", j === i);
      });
      indexHero = i;
    }

    setInterval(() => {
      showHero((indexHero + 1) % slides.length);
    }, 5000);

    // Parallax khi cuộn
    const applyHeroParallax = () => {
      const activeImg = document.querySelector(".hero .slide.active img");
      const activeContent = document.querySelector(
        ".hero .slide.active .hero-content"
      );
      const y = window.scrollY || 0;
      const offset = Math.min(y / 8, 80);
      if (activeContent) {
        activeContent.style.transform = `translateY(${(-30 + offset / 10)}%)`;
      }
      if (activeImg) {
        activeImg.style.transform = `scale(${
          1.06 + Math.min(y / 2000, 0.06)
        }) translateY(${offset / 20}px)`;
      }
    };
    applyHeroParallax();
    window.addEventListener("scroll", applyHeroParallax);

    // Scroll reveal nhẹ
    const revealSelectors = [
      ".category-card",
      ".new-products",
      ".slider-new .newproduct",
      ".Bestsellers .product-card",
      ".reward-section",
      ".product-slider .product-card",
      ".slider-container",
      ".sliderBestsellers",
    ];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("show");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        el.classList.add("reveal");
        obs.observe(el);
      });
    });
  })();

  /* ------------------ NEW COLLECTION (slider ngang) ------------------ */
  (function initNewCollection() {
    // Các id phải tồn tại trong HTML:
    // <div id="newwrapper">...</div>
    // <button id="prevnew"></button>
    // <button id="nextnew"></button>
    const newwrapper = document.getElementById("newwrapper");
    const prevnew = document.getElementById("prevnew");
    const nextnew = document.getElementById("nextnew");

    if (!newwrapper || !prevnew || !nextnew) return; // guard

    const scrollNew = () => Math.round(newwrapper.clientWidth / 2);

    prevnew.addEventListener("click", () => {
      newwrapper.scrollBy({ left: -scrollNew(), behavior: "smooth" });
    });
    nextnew.addEventListener("click", () => {
      newwrapper.scrollBy({ left: scrollNew(), behavior: "smooth" });
    });

    function updateNewArrows() {
      // Giữ luôn hiển thị theo yêu cầu thiết kế
      prevnew.style.display = "flex";
      nextnew.style.display = "flex";
    }

    newwrapper.addEventListener("scroll", updateNewArrows);
    window.addEventListener("resize", updateNewArrows);
    updateNewArrows();
  })();

  /* ------------------ BEST SELLERS (trượt ngang) ------------------ */
  (function initBestSellers() {
    const wrapper = document.getElementById("bestseller");
    const preBtn = document.getElementById("preBestsellers");
    const nextBtn = document.getElementById("nextBestsellers");
    if (!wrapper || !preBtn || !nextBtn) return;

    const scrollByHalf = () => Math.round(wrapper.clientWidth / 2);
    preBtn.addEventListener("click", () =>
      wrapper.scrollBy({ left: -scrollByHalf(), behavior: "smooth" })
    );
    nextBtn.addEventListener("click", () =>
      wrapper.scrollBy({ left: scrollByHalf(), behavior: "smooth" })
    );

    function updateArrows() {
      // Giữ visible giống mock
      preBtn.style.display = "flex";
      nextBtn.style.display = "flex";
    }
    wrapper.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    updateArrows();
  })();

  /* ------------------ MENU TOGGLE + SEARCH OVERLAY ------------------ */
  (function initMenuAndSearch() {
    const menuToggler = document.getElementById("menu-toggler");
    const navbar = document.getElementById("navbar");
    const shopAll = document.querySelector(".shop-all");
    const menuCategories = document.querySelector(".menu-categories");
    const backBtn = document.querySelector(".back-btn");
    const nextButtons = document.querySelectorAll(".next-btn");
    const announcementWrapper = document.getElementById("announcementWrapper");

    // Tạo overlay search động
    const headerSearchIcon = document.querySelector(".search .icon");
    const headerSearchInput = document.getElementById("search-input-main");
    const searchOverlay = document.createElement("div");
    const searchWrapper = document.createElement("div");
    const searchInputOverlay = document.createElement("input");
    const closeSearch = document.createElement("button");

    searchOverlay.classList.add("search-overlay");
    searchWrapper.classList.add("search-wrapper");
    searchInputOverlay.classList.add("search-input");
    searchInputOverlay.placeholder = "Search for...";
    closeSearch.classList.add("close-search");
    closeSearch.innerHTML = "&times;";
    searchWrapper.appendChild(searchInputOverlay);
    searchWrapper.appendChild(closeSearch);
    searchOverlay.appendChild(searchWrapper);
    document.body.appendChild(searchOverlay);

    function restoreScroll() {
      document.body.style.overflow = "";
    }

    // Debounce tiện dụng
    function debounce(func, wait) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => func(...args), wait);
      };
    }

    // Toggle menu
    if (menuToggler && navbar) {
      menuToggler.addEventListener("click", (e) => {
        e.stopPropagation();
        const isActive = navbar.classList.contains("active");
        navbar.classList.toggle("active", !isActive);
        navbar.style.transition = "transform 0.3s ease, opacity 0.3s ease";
        navbar.style.transform = isActive ? "translateY(-100%)" : "translateY(0)";
        navbar.style.opacity = isActive ? "0" : "1";
        document.body.style.overflow = isActive ? "" : "hidden";
        if (!isActive) {
          if (shopAll) shopAll.classList.remove("active");
          if (menuCategories) {
            menuCategories.classList.remove("active");
            menuCategories.style.display = "none";
            document.querySelectorAll(".category").forEach((cat) => {
              cat.classList.remove("active");
              const productList = cat.querySelector(".product-list");
              if (productList) productList.style.display = "none";
            });
          }
        } else {
          restoreScroll();
        }
      });

      // Click ngoài để đóng menu trên mobile
      document.addEventListener("click", (e) => {
        if (
          window.innerWidth <= 900 &&
          navbar &&
          !navbar.contains(e.target) &&
          !menuToggler.contains(e.target) &&
          navbar.classList.contains("active")
        ) {
          navbar.classList.remove("active");
          navbar.style.transform = "translateY(-100%)";
          navbar.style.opacity = "0";
          if (shopAll) shopAll.classList.remove("active");
          if (menuCategories) {
            menuCategories.classList.remove("active");
            menuCategories.style.display = "none";
            menuCategories.style.opacity = "0";
            menuCategories.style.transform = "translateY(-10px)";
            document.querySelectorAll(".category").forEach((cat) => {
              cat.classList.remove("active");
              const productList = cat.querySelector(".product-list");
              if (productList) productList.style.display = "none";
            });
          }
          restoreScroll();
        }
      });
    }

    // Hover/Click shopAll
    if (shopAll && menuCategories) {
      let timeoutId;
      const handleMouseEnter = () => {
        clearTimeout(timeoutId);
        if (window.innerWidth > 900) {
          menuCategories.style.display = "block";
          menuCategories.style.opacity = "1";
          menuCategories.style.transform = "translateY(0)";
          document.querySelectorAll(".category").forEach((cat) => {
            cat.classList.add("active");
            const productList = cat.querySelector(".product-list");
            if (productList) productList.style.display = "block";
          });
        }
      };
      const handleMouseLeave = () => {
        timeoutId = setTimeout(() => {
          if (window.innerWidth > 900) {
            menuCategories.style.display = "none";
            menuCategories.style.opacity = "0";
            menuCategories.style.transform = "translateY(-10px)";
            document.querySelectorAll(".category").forEach((cat) => {
              cat.classList.remove("active");
              const productList = cat.querySelector(".product-list");
              if (productList) productList.style.display = "none";
            });
          }
        }, 300);
      };

      if (window.innerWidth > 900) {
        shopAll.addEventListener("mouseenter", handleMouseEnter);
        shopAll.addEventListener("mouseleave", handleMouseLeave);
        menuCategories.addEventListener("mouseenter", handleMouseEnter);
        menuCategories.addEventListener("mouseleave", handleMouseLeave);
      }

      shopAll.addEventListener("click", (e) => {
        if (window.innerWidth <= 900) {
          e.preventDefault();
          e.stopPropagation();
          const isActive = shopAll.classList.contains("active");
          shopAll.classList.toggle("active", !isActive);
          menuCategories.classList.toggle("active", !isActive);
          menuCategories.style.display = menuCategories.classList.contains("active")
            ? "flex"
            : "none";
          menuCategories.style.transition = "opacity 0.3s ease, transform 0.3s ease";
          menuCategories.style.opacity = isActive ? "0" : "1";
          menuCategories.style.transform = isActive
            ? "translateY(-10px)"
            : "translateY(0)";
          if (backBtn) {
            backBtn.style.display = menuCategories.classList.contains("active")
              ? "flex"
              : "none";
          }
        }
      });

      if (backBtn) {
        backBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          shopAll.classList.remove("active");
          menuCategories.classList.remove("active");
          menuCategories.style.display = "none";
          menuCategories.style.opacity = "0";
          menuCategories.style.transform = "translateY(-10px)";
          backBtn.style.display = "none";
          document.querySelectorAll(".category").forEach((cat) => {
            cat.classList.remove("active");
            const productList = cat.querySelector(".product-list");
            if (productList) productList.style.display = "none";
          });
          restoreScroll();
        });
      }

      function setupMobileCategoryInteractions() {
        nextButtons.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const category = btn.closest(".category");
            const isActive = category.classList.contains("active");
            document.querySelectorAll(".category").forEach((cat) => {
              if (cat !== category) {
                cat.classList.remove("active");
                const productList = cat.querySelector(".product-list");
                if (productList) productList.style.display = "none";
              }
            });
            category.classList.toggle("active", !isActive);
            const productList = category.querySelector(".product-list");
            if (productList) {
              productList.style.display = category.classList.contains("active")
                ? "block"
                : "none";
              productList.style.transition = "opacity 0.3s ease";
              productList.style.opacity = category.classList.contains("active")
                ? "1"
                : "0";
            }
          });
        });

        document.querySelectorAll(".category-header").forEach((header) => {
          header.addEventListener("click", (e) => {
            if (!e.target.closest(".next-btn") && !e.target.closest("a")) {
              e.stopPropagation();
              const category = header.closest(".category");
              const isActive = category.classList.contains("active");
              document.querySelectorAll(".category").forEach((cat) => {
                if (cat !== category) {
                  cat.classList.remove("active");
                  const productList = cat.querySelector(".product-list");
                  if (productList) productList.style.display = "none";
                }
              });
              category.classList.toggle("active", !isActive);
              const productList = category.querySelector(".product-list");
              if (productList) {
                productList.style.display = category.classList.contains("active")
                  ? "block"
                  : "none";
                productList.style.transition = "opacity 0.3s ease";
                productList.style.opacity = category.classList.contains("active")
                  ? "1"
                  : "0";
              }
            }
          });
        });
      }
      setupMobileCategoryInteractions();

      // xử lý resize
      const handleResize = debounce(() => {
        if (window.innerWidth > 900) {
          shopAll.addEventListener("mouseenter", handleMouseEnter);
          shopAll.addEventListener("mouseleave", handleMouseLeave);
          menuCategories.addEventListener("mouseenter", handleMouseEnter);
          menuCategories.addEventListener("mouseleave", handleMouseLeave);
          shopAll.classList.remove("active");
          menuCategories.classList.remove("active");
          menuCategories.style.display = "none";
          menuCategories.style.opacity = "0";
          menuCategories.style.transform = "translateY(-10px)";
          if (backBtn) backBtn.style.display = "none";
          document.querySelectorAll(".category").forEach((cat) => {
            cat.classList.remove("active");
            const productList = cat.querySelector(".product-list");
            if (productList) productList.style.display = "none";
          });
          if (navbar) {
            navbar.classList.remove("active");
            navbar.style.transform = "translateY(0)";
            navbar.style.opacity = "1";
          }
          restoreScroll();
        } else {
          shopAll.removeEventListener("mouseenter", handleMouseEnter);
          shopAll.removeEventListener("mouseleave", handleMouseLeave);
          menuCategories.removeEventListener("mouseenter", handleMouseEnter);
          menuCategories.removeEventListener("mouseleave", handleMouseLeave);
          menuCategories.style.transform = "translateY(0)";
          document.querySelectorAll(".category").forEach((cat) => {
            cat.classList.remove("active");
            const productList = cat.querySelector(".product-list");
            if (productList) productList.style.display = "none";
          });
        }
      }, 100);
      window.addEventListener("resize", handleResize);
    }

    // Announcement auto-slide pause on hover
    if (announcementWrapper) {
      let currentSlide = 0;
      const slides = announcementWrapper.children;
      let slideInterval;
      const startSlide = () => {
        slideInterval = setInterval(() => {
          currentSlide = (currentSlide + 1) % slides.length;
          announcementWrapper.style.transition = "transform 0.8s ease-in-out";
          announcementWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
        }, 3000);
      };
      startSlide();
      announcementWrapper.addEventListener("mouseenter", () => {
        clearInterval(slideInterval);
      });
      announcementWrapper.addEventListener("mouseleave", () => {
        startSlide();
      });
    }

    // Search overlay mở/đóng + đồng bộ input header
    if (headerSearchIcon && headerSearchInput) {
      headerSearchIcon.addEventListener("click", () => {
        searchOverlay.classList.add("active");
        searchInputOverlay.focus();
        document.body.style.overflow = "hidden";
      });
      closeSearch.addEventListener("click", () => {
        searchOverlay.classList.remove("active");
        document.body.style.overflow = "";
      });
      searchInputOverlay.addEventListener("input", () => {
        const query = searchInputOverlay.value.toLowerCase();
        headerSearchInput.value = query;
        if (window.filterProducts) window.filterProducts(query);
      });
    }
  })();

  /* ------------------ HOTSPOT (hover tooltip + click → view_new) ------------------ */
  (function initHotspots() {
    const spots = document.querySelectorAll(".hotspot");
    if (!spots.length) return;

    spots.forEach((spot) => {
      const productId = spot.getAttribute("data-id");
      const imgUrl = spot.getAttribute("data-img"); // nên là đường dẫn hoàn chỉnh
      const productName = spot.getAttribute("data-name") || "Product";
      if (!productId || !imgUrl) return;

      let tooltip = null;

      // Hover: tooltip (không đổi ảnh chính)
      spot.addEventListener("mouseenter", () => {
        tooltip = document.createElement("div");
        tooltip.className = "hotspot-tooltip";
        tooltip.innerHTML = `
          <img src="${imgUrl}" alt="${productName}">
          <div class="tooltip-name">${productName}</div>
        `;
        tooltip.style.cssText = `
          position:absolute; top:-130px; left:50%; transform:translateX(-50%);
          width:160px; background:#fff; border-radius:16px; overflow:hidden;
          box-shadow:0 16px 45px rgba(0,0,0,.38); z-index:1000; pointer-events:none;
          opacity:0; transition:all .35s cubic-bezier(.4,0,.2,1);
          font-family:'Playfair Display',serif; border:1px solid #f0e6e6;
        `;
        spot.appendChild(tooltip);
        requestAnimationFrame(() => {
          tooltip.style.opacity = "1";
          tooltip.style.transform = "translateX(-50%) translateY(-10px)";
        });
      });

      spot.addEventListener("mouseleave", () => {
        if (tooltip) {
          tooltip.style.opacity = "0";
          tooltip.style.transform = "translateX(-50%) translateY(5px)";
          setTimeout(() => tooltip && tooltip.remove(), 350);
        }
      });

      // Click → trang chi tiết NEW
      spot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        // từ 1.homepage → ../new/view_product/view_new.html
        window.location.href = `../new/view_product/view_new.html?id=${encodeURIComponent(
          productId
        )}`;
      });

      spot.style.cursor = "pointer";
      spot.style.transition = "transform .2s ease";
      ["mousedown", "touchstart"].forEach((evt) =>
        spot.addEventListener(evt, () => (spot.style.transform = "scale(0.88)"))
      );
      ["mouseup", "mouseleave", "touchend"].forEach((evt) =>
        spot.addEventListener(evt, () => (spot.style.transform = "scale(1)"))
      );
    });
  })();

  /* ------------------ FLASH SALE: Fan → 6 ảnh bung ngang ------------------ */
  (function initFlashSaleFan() {
    // HTML cần:
    // <div id="fan3"></div>  (3 ảnh kiểu quạt)
    // <div id="row6"></div>  (6 ảnh giãn ngang, lúc đầu ẩn)
    const fan3 = document.getElementById("fan3");
    const row6 = document.getElementById("row6");
    if (!fan3 || !row6) return;

    let expanded = false;

    (async () => {
      try {
        // Từ 1.homepage → ../Sale/products.json
        const res = await fetch("../../Sale/products.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = (data.products || []).slice(0, 6);

        // 3 ảnh quạt (click để bung)
        items.slice(0, 3).forEach((p, i) => {
          const img = document.createElement("img");
          img.className = "fan-img";
          img.src = joinPath("../Sale", p?.images?.[0] || "");
          img.style.setProperty("--i", String(i));
          withFallback(img);
          img.addEventListener("click", toggleExpand);
          fan3.appendChild(img);
        });

        // 6 ảnh hàng ngang (“stop-motion” feel – hiện đồng loạt)
        items.forEach((p) => {
          const div = document.createElement("div");
          div.className = "prod-mini";
          div.innerHTML = `
            <img alt="">
            <h4>${p?.name || "Product"}</h4>
            <p class="brand">${p?.brand || ""}</p>
            <p class="price">$${Number(p?.price || 0).toFixed(2)}</p>
          `;
          const img = div.querySelector("img");
          img.src = joinPath("../Sale", p?.images?.[0] || "");
          withFallback(img);

          // click card → trang chi tiết SALE
          div.addEventListener("click", () => {
            window.location.href = `../Sale/view_product/view_sale.html?id=${encodeURIComponent(
              p.id
            )}`;
          });

          row6.appendChild(div);
        });

        // Lúc đầu: hiện quạt, ẩn hàng 6
        fan3.classList.remove("hide");
        row6.classList.remove("show");
      } catch (e) {
        console.error("Flash Sale load error:", e);
      }
    })();

    function toggleExpand() {
      expanded = !expanded;
      // CSS của bạn cần:
      // .hide { display: none; }
      // #row6 { display:none }  #row6.show { display:flex }  (flex ngang, gap,…)
      fan3.classList.toggle("hide", expanded);
      row6.classList.toggle("show", expanded);
    }
  })();
});
