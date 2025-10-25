// Toàn bộ code cho script.js (ĐÃ SỬA LỖI)
document.addEventListener('DOMContentLoaded', () => {
  // State
  let products = []; // Sẽ được điền dữ liệu ở dưới
  let filteredProducts = [];
  let currentPage = 1;
  const productsPerPage = 6;
  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

  // Elements
  const wrapper = document.getElementById('announcementWrapper');
  const slides = document.querySelectorAll('.announcement-slide');
  const menuToggler = document.getElementById('menu-toggler');
  const navbar = document.getElementById('navbar');
  const productsGrid = document.getElementById('products');
  const loadMoreButton = document.getElementById('load-more-button');
  const priceFilter = document.getElementById('price-filter');
  const ratingFilter = document.getElementById('rating-filter');
  const brandFilter = document.getElementById('brand-filter');
  const filterToggle = document.getElementById('filter-toggle');
  const filterMenu = document.getElementById('filter-menu');
  const categoryButtons = document.querySelectorAll('.category-btn');
  const aiButton = document.querySelector('.ai-btn');
  const cartIcon = document.querySelector('.header nav a img[alt="Shopping"]');
  const shopAll = document.querySelector('.shop-all');
  const menuCategories = document.querySelector('.menu-categories');
  const backBtn = document.querySelector('.back-btn');

  // === CÁC BIẾN MỚI CHO TRANG CHI TIẾT ===
  const mainPageContent = [
    document.querySelector('.video-hero'),
    document.querySelector('.ai-combo'),
    document.querySelector('.filter-bar'),
    productsGrid,
    loadMoreButton
  ];
  const productDetailView = document.getElementById('product-detail-view');
  const detailBackBtn = document.getElementById('detail-back-btn');
  const detailMainImage = document.getElementById('detail-main-image');
  const detailThumbnailContainer = document.getElementById('detail-thumbnail-container');
  const detailBrand = document.getElementById('detail-brand');
  const detailName = document.getElementById('detail-name');
  const detailRating = document.getElementById('detail-rating');
  const detailPrice = document.getElementById('detail-price');
  const detailDescription = document.getElementById('detail-description');
  const detailCategory = document.getElementById('detail-category');
  const detailDecreaseQty = document.getElementById('detail-decrease-qty');
  const detailIncreaseQty = document.getElementById('detail-increase-qty');
  const detailQuantityInput = document.getElementById('detail-quantity');
  const detailAddToCartBtn = document.getElementById('detail-add-to-cart-btn');
  
  let currentDetailProduct = null;
  // ===================================

  // Debug: Check if elements exist
  console.log('menuToggler:', menuToggler);
  console.log('navbar:', navbar);
  console.log('shopAll:', shopAll);
  console.log('menuCategories:', menuCategories);
  console.log('backBtn:', backBtn);
  console.log('productsGrid:', productsGrid);

  // Toggle Menu and Hover Support for Navbar
  if (menuToggler && navbar) {
    menuToggler.addEventListener('click', () => {
      const isActive = navbar.classList.contains('active');
      navbar.classList.toggle('active', !isActive);
      document.body.style.overflow = isActive ? '' : 'hidden';
      console.log('Menu toggled, navbar active:', navbar.classList.contains('active'));
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 900 && !navbar.contains(e.target) && !menuToggler.contains(e.target) && navbar.classList.contains('active')) {
        navbar.classList.remove('active');
        if (shopAll) shopAll.classList.remove('active');
        if (menuCategories) {
          menuCategories.classList.remove('active');
          document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
          });
        }
        document.body.style.overflow = '';
      }
    });
  } else {
    console.error('menuToggler or navbar not found');
  }

  // Desktop Hover Support for Categories Menu with Delay
  if (shopAll && menuCategories) {
    let timeoutId;
    
    const handleMouseEnter = () => {
      clearTimeout(timeoutId);
      console.log('Mouse entered categories menu');
      if (window.innerWidth > 900) {
        menuCategories.style.display = 'block';
      }
    };
    
    const handleMouseLeave = () => {
      console.log('Mouse left categories menu');
      timeoutId = setTimeout(() => {
        if (window.innerWidth > 900) {
          menuCategories.style.display = 'none';
        }
      }, 300);
    };

    if (window.innerWidth > 900) {
      shopAll.addEventListener('mouseenter', handleMouseEnter);
      shopAll.addEventListener('mouseleave', handleMouseLeave);
      menuCategories.addEventListener('mouseenter', handleMouseEnter);
      menuCategories.addEventListener('mouseleave', handleMouseLeave);
    }

    shopAll.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        e.stopPropagation();
        const isActive = shopAll.classList.contains('active');
        shopAll.classList.toggle('active', !isActive);
        menuCategories.classList.toggle('active', !isActive);
        console.log('Categories toggled, menuCategories active:', menuCategories.classList.contains('active'));
        
        if (backBtn) {
          backBtn.style.display = menuCategories.classList.contains('active') ? 'flex' : 'none';
          console.log('Back button display:', backBtn.style.display);
        }
        
        if (!isActive) {
          document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
          });
          loadCategoryProducts();
        }
      }
    });

    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Back button clicked');
        if (window.innerWidth <= 900) {
          shopAll.classList.remove('active');
          menuCategories.classList.remove('active');
          backBtn.style.display = 'none';
          document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
          });
          console.log('menuCategories active after back:', menuCategories.classList.contains('active'));
        }
      });
    } else {
      console.error('backBtn not found');
    }

    function setupMobileCategoryInteractions() {
      document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const category = btn.closest('.category');
          const isActive = category.classList.contains('active');
          
          document.querySelectorAll('.category').forEach(cat => {
            if (cat !== category) {
              cat.classList.remove('active');
            }
          });
          
          category.classList.toggle('active', !isActive);
        });
      });

      document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', (e) => {
          if (!e.target.closest('.next-btn') && !e.target.closest('a')) {
            const category = header.closest('.category');
            const isActive = category.classList.contains('active');
            
            document.querySelectorAll('.category').forEach(cat => {
              if (cat !== category) {
                cat.classList.remove('active');
              }
            });
            
            category.classList.toggle('active', !isActive);
          }
        });
      });
    }

    setupMobileCategoryInteractions();

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        shopAll.addEventListener('mouseenter', handleMouseEnter);
        shopAll.addEventListener('mouseleave', handleMouseLeave);
        menuCategories.addEventListener('mouseenter', handleMouseEnter);
        menuCategories.addEventListener('mouseleave', handleMouseLeave);
        shopAll.classList.remove('active');
        menuCategories.classList.remove('active');
        menuCategories.style.display = 'none';
        if (backBtn) backBtn.style.display = 'none';
        document.querySelectorAll('.category').forEach(cat => {
          cat.classList.remove('active');
        });
      } else {
        shopAll.removeEventListener('mouseenter', handleMouseEnter);
        shopAll.removeEventListener('mouseleave', handleMouseLeave);
        menuCategories.removeEventListener('mouseenter', handleMouseEnter);
        menuCategories.removeEventListener('mouseleave', handleMouseLeave);
        menuCategories.style.display = 'none';
        
        if (menuCategories.classList.contains('active')) {
          menuCategories.style.display = 'flex';
          if (backBtn) {
            backBtn.style.display = 'flex';
            console.log('Resize: Back button set to display: flex');
          }
        }
      }
    }, { passive: true });
  } else {
    console.error('shopAll or menuCategories not found');
  }

  // Announcement Bar
  let index = 0;
  function showSlide(i) {
    if (wrapper) {
      wrapper.style.transform = `translateX(-${i * 100}%)`;
    }
  }
  
  if (slides.length > 0) {
    setInterval(() => {
      index = (index + 1) % slides.length;
      showSlide(index);
    }, 5000);
  }

  // Helper Functions
  const formatCurrency = (price) => '$' + price.toFixed(2);
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
      padding: 12px 20px; border-radius: 8px; z-index: 2000; animation: slideInRight 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // ======================================================
  // ========== DỮ LIỆU SẢN PHẨM ĐẦY ĐỦ ==========
  // ======================================================

  const allSiteProducts = [
    // 10 SẢN PHẨM MỚI (ĐÃ CẬP NHẬT SUBTYPE)
    {
      id: "new-001",
      name: "Dior Forever Skin Glow Foundation",
      brand: "Dior",
      category: "Face",
      subtype: "Foundation",
      price: 58.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/N0QBz1YK/temp-Imageu-J3Tk-H.avif",
        "https://i.postimg.cc/tg9pMhy6/temp-Image-Hpdfph.avif",
        "https://i.postimg.cc/JhKMVG44/temp-Imageh9nro-B.avif"
      ],
      description: "Nền căng bóng, bền màu đến 24h, che phủ tự nhiên.",
      isNew: true
    },
    {
      id: "new-002",
      name: "Chanel Les Beiges Bronzing Cream",
      brand: "Chanel",
      category: "Face",
      subtype: "Contour & Highlighter",
      price: 60.00,
      rating: 4.8,
      image: [
        "https://i.postimg.cc/sxq5qvSW/new002.avif",
        "https://i.postimg.cc/XqGCf4hC/temp-Image4MRzdl.avif"
      ], // <-- SỬA
      description: "Kem tạo khối dạng gel-cream cho làn da rám nắng tự nhiên.",
      isNew: true
    },
    {
      id: "new-003",
      name: "YSL Rouge Pur Couture Lipstick",
      brand: "YSL",
      category: "Lips",
      subtype: "Lipstick",
      price: 45.00,
      rating: 4.6,
      image: [
        "https://i.postimg.cc/L4n0sWDG/temp-Imager-Eg-Rz-W.avif",
        "https://i.postimg.cc/Y9VRgpRy/temp-Imaged-Do6SU.avif",
        "https://i.postimg.cc/76bXfC3b/temp-Image-Ijcp-Jv.avif"
      ], // <-- SỬA
      description: "Son satin biểu tượng, sắc màu chuẩn, lên môi sang trọng.",
      isNew: true
    },
    {
      id: "new-004",
      name: "Lancôme Teint Idole Ultra Wear",
      brand: "Lancôme",
      category: "Face",
      subtype: "Foundation",
      price: 57.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/7LWdBNhC/new0091.avif",
        "https://i.postimg.cc/rpP3h9sQ/new0093.avif",
        "https://i.postimg.cc/YC8JF7wY/temp-Image0Zz5IW.avif"
      ], // <-- SỬA
      description: "Kem nền lâu trôi, che phủ cao nhưng vẫn thoáng da.",
      isNew: true
    },
    {
      id: "new-005",
      name: "Rare Beauty Soft Pinch Liquid Blush",
      brand: "Rare Beauty",
      category: "Face",
      subtype: "Blush",
      price: 23.00,
      rating: 4.8,
      image: [
        "https://i.postimg.cc/HLxF4NpZ/temp-Image1Oepj-X.avif",
        "https://i.postimg.cc/T2DM4BnZ/temp-Image4exv-C0.avif",
        "https://i.postimg.cc/K8QdTbyp/temp-Image60x-MFz.avif"
      ], // <-- SỬA
      description: "Má hồng lỏng siêu pigment, tán mịn như mây.",
      isNew: true
    },
    {
      id: "new-006",
      name: "NARS Radiant Creamy Concealer",
      brand: "NARS",
      category: "Face",
      subtype: "Concealer",
      price: 32.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/0NQhd48L/temp-Image-Bf-Lw8v.avif",
        "https://i.postimg.cc/MK0kWR38/temp-Imagedk-L6VF.avif",
        "https://i.postimg.cc/9MwSsqqV/temp-Image-EJCIYh.avif"
      ],
      description: "Che khuyết điểm huyền thoại, mỏng nhẹ, không vón.",
      isNew: true
    },
    {
      id: "new-007",
      name: "CT Airbrush Flawless Finish Powder",
      brand: "Charlotte Tilbury",
      category: "Face",
      subtype: "Finish Powder",
      price: 48.00,
      rating: 4.9,
      image: [
        "https://i.postimg.cc/HkTqjxFs/temp-Imageg-Oi3x-W.avif",
        "https://i.postimg.cc/wvRPnssp/temp-Imagejgfcp-Z.avif",
        "https://i.postimg.cc/5tRTPmyN/temp-Image-JTKe7d.avif"
      ],
      description: "Phấn nén làm mịn da như filter, hoàn thiện không tì vết.",
      isNew: true
    },
    {
      id: "new-008",
      name: "Fenty Beauty Gloss Bomb Luminizer",
      brand: "Fenty Beauty",
      category: "Lips",
      subtype: "Lip Gloss",
      price: 21.00,
      rating: 4.6,
      image: [
        "https://i.postimg.cc/Vkzx562z/temp-Image-Ksb-H6w.avif",
        "https://i.postimg.cc/kg70D4LM/temp-Imageljf-Xjc.avif",
        "https://i.postimg.cc/CKQXv45J/temp-Images3Hab-L.avif"
      ],
      description: "Son bóng kinh điển, môi căng mọng, không bết dính.",
      isNew: true
    },
    {
      id: "new-009",
      name: "Tom Ford Eye Color Quad",
      brand: "Tom Ford",
      category: "Eyes",
      subtype: "Makeup Palette",
      price: 90.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/LXg7GZgP/temp-Imageso-HM3w.avif",
        "https://i.postimg.cc/WbmR2rWY/temp-Image-Td8asz.avif",
        "https://i.postimg.cc/cJb2DcC6/temp-Image-Uq-WEef.avif"
      ],
      description: "Bảng mắt 4 ô cao cấp, chất phấn mướt mịn, lên màu sang.",
      isNew: true
    },
    {
      id: "new-010",
      name: "Gucci Poudre De Beauté Mat Naturel",
      brand: "Gucci",
      category: "Face",
      subtype: "Finish Powder",
      price: 62.00,
      rating: 4.5,
      image: [
        "https://i.postimg.cc/nLPgd1rV/temp-Image-X4jiea.avif",
        "https://i.postimg.cc/GmzZDR1K/temp-Imageyz-KWKc.avif",
        "https://i.postimg.cc/SsY5HzYC/temp-Image-ZDYmf-A.avif"
      ],
      description: "Phấn phủ lì tự nhiên, bao bì xa xỉ đậm chất Gucci.",
      isNew: true
    },
  
    // BỔ SUNG SẢN PHẨM CHO DANH MỤC
    // === FACE: Foundation (Bổ sung) ===
    {
      id: 11,
      name: "Estée Lauder Double Wear Foundation",
      brand: "Estée Lauder",
      category: "Face",
      subtype: "Foundation",
      price: 49.00,
      rating: 4.8,
      image: [
        "https://i.postimg.cc/L4yXRJ5K/temp-Imagej8VRQi.avif",
        "https://i.postimg.cc/sfnXyMxW/temp-Image-JLX8j4.avif",
        "https://i.postimg.cc/65yQQB4G/temp-Imageqd-SBIm.avif"
      ], // <-- SỬA
      description: "Kem nền siêu bền màu, che phủ hoàn hảo, kiềm dầu tốt.",
      isNew: false
    },
  
    // === FACE: Blush (Bổ sung) ===
    {
      id: 12,
      name: "NARS Blush - Orgasm",
      brand: "NARS",
      category: "Face",
      subtype: "Blush",
      price: 32.00,
      rating: 4.9,
      image: [
        "https://i.postimg.cc/90cWVh5z/15a.avif",
        "https://i.postimg.cc/zvqJ5rZV/15b.avif",
        "https://i.postimg.cc/mkTbRsfF/15c.avif"
      ], // <-- SỬA
      description: "Màu má hồng đào nhũ vàng huyền thoại, phù hợp mọi tông da.",
      isNew: false
    },
    {
      id: 13,
      name: "Dior Rosy Glow Blush",
      brand: "Dior",
      category: "Face",
      subtype: "Blush",
      price: 40.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/VkJzzgT3/temp-Image0Ta-Lhe.avif",
        "https://i.postimg.cc/VkJzzgT9/temp-Image0Yd4C9.avif",
        "https://i.postimg.cc/nV1F2CBS/temp-Image1f-ACod.avif"
      ], // <-- SỬA
      description: "Phấn má hồng phản ứng với độ pH, tạo màu sắc tự nhiên.",
      isNew: false
    },
  
    // === FACE: Primer (3 sản phẩm mới) ===
    {
      id: 14,
      name: "Milk Makeup Hydro Grip Primer",
      brand: "Milk Makeup",
      category: "Face",
      subtype: "Primer",
      price: 38.00,
      rating: 4.6,
      image: [
        "https://i.postimg.cc/bwZqqgMQ/temp-Image3i-Wn6Y.avif",
        "https://i.postimg.cc/NGxsD5mJ/temp-Image4ku-QWn.avif",
        "https://i.postimg.cc/3wp7vR3R/temp-Image6pqz2Z.avif"
      ], // <-- SỬA
      description: "Kem lót dạng gel gốc nước, giữ lớp nền bám chặt suốt ngày.",
      isNew: false
    },
    {
      id: 15,
      name: "Tatcha The Silk Canvas Primer",
      brand: "Tatcha",
      category: "Face",
      subtype: "Primer",
      price: 54.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/3JJKcYZT/temp-Image6TGULc.avif",
        "https://i.postimg.cc/sxK3gNsS/temp-Image7q-Ek8x.avif",
        "https://i.postimg.cc/vTXGZNbN/temp-Image8Wnl-NP.avif"
      ], // <-- SỬA
      description: "Kem lót dạng sáp mịn màng, làm mờ lỗ chân lông và nếp nhăn.",
      isNew: false
    },
    {
      id: 16,
      name: "Hourglass Veil Mineral Primer",
      brand: "Hourglass",
      category: "Face",
      subtype: "Primer",
      price: 58.00,
      rating: 4.8,
      image: [
        "https://i.postimg.cc/ZnjJ5M4D/temp-Image8zy-EWe.avif",
        "https://i.postimg.cc/qMbkfSmd/temp-Imagea-Mquy-P.avif",
        "https://i.postimg.cc/63JWjZMZ/temp-Image-AQHp02.avif"
      ], // <-- SỬA
      description: "Kem lót mỏng nhẹ, chống nước, tạo hiệu ứng mịn lì.",
      isNew: false
    },
  
    // === FACE: Concealer (Bổ sung) ===
    {
      id: 17,
      name: "Tarte Shape Tape Concealer",
      brand: "Tarte",
      category: "Face",
      subtype: "Concealer",
      price: 31.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/0NmxwQ9z/temp-Imageb-CRIc-F.avif",
        "https://i.postimg.cc/jddsFth5/temp-Imageb-D4rdf.avif",
        "https://i.postimg.cc/MHtzpFqs/temp-Image-C6Zeo-V.avif"
      ], // <-- SỬA
      description: "Che khuyết điểm 'quốc dân', che phủ siêu cao, không cakey.",
      isNew: false
    },
    {
      id: 18,
      name: "YSL Touche Éclat High Cover",
      brand: "YSL",
      category: "Face",
      subtype: "Concealer",
      price: 40.00,
      rating: 4.5,
      image: [
        "https://i.postimg.cc/Z5WJJHgF/temp-Imagecz-Ta-WH.avif",
        "https://i.postimg.cc/x1X9957R/temp-Image-CZy-Lf-Q.avif",
        "https://i.postimg.cc/RZ24hf5b/temp-Image-D0tog-C.avif"
      ], // <-- SỬA
      description: "Bút che khuyết điểm dạng lỏng, bắt sáng rạng rỡ cho vùng mắt.",
      isNew: false
    },
  
    // === FACE: Finish Powder (Bổ sung) ===
    {
      id: 19,
      name: "Laura Mercier Translucent Powder",
      brand: "Laura Mercier",
      category: "Face",
      subtype: "Finish Powder",
      price: 43.00,
      rating: 4.9,
      image: [
        "https://i.postimg.cc/SQGSdJCt/temp-Imaged-E3W3G.avif",
        "https://i.postimg.cc/4yXJZgkv/temp-Image-DLr-Og-J.avif",
        "https://i.postimg.cc/15C9x2W3/temp-Imagedp-Mqu-T.avif"
      ], // <-- SỬA
      description: "Phấn phủ không màu, giữ lớp nền mịn lì và tự nhiên.",
      isNew: false
    },
  
    // === FACE: Contour & Highlighter (Bổ sung) ===
    {
      id: 20,
      name: "CT Hollywood Contour Wand",
      brand: "Charlotte Tilbury",
      category: "Face",
      subtype: "Contour & Highlighter",
      price: 42.00,
      rating: 4.6,
      image: [
        "https://i.postimg.cc/fLcw6bFk/temp-Image-EQGg-Ya.avif",
        "https://i.postimg.cc/Y08tCsMP/temp-Imageg0g-XVS.avif",
        "https://i.postimg.cc/ZK7Tk2fx/temp-Image-HFIZ85.avif"
      ], // <-- SỬA
      description: "Tạo khối dạng kem đầu mút, dễ tán, cho đường nét tự nhiên.",
      isNew: false
    },
    {
      id: 21,
      name: "Fenty Beauty Killawatt Highlighter",
      brand: "Fenty Beauty",
      category: "Face",
      subtype: "Contour & Highlighter",
      price: 40.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/4xjsytR4/temp-Image-HTHaew.avif",
        "https://i.postimg.cc/Wp7N8hgX/temp-Image-Ihf-Tzt.avif",
        "https://i.postimg.cc/d3JqvYPt/temp-Imagej-Oeg-DR.avif"
      ], // <-- SỬA
      description: "Phấn bắt sáng hạt mịn, bám lâu, tạo hiệu ứng glowy.",
      isNew: false
    },
  
    // === FACE: Makeup Cleansing Balm (3 sản phẩm mới) ===
    {
      id: 22,
      name: "Glow Recipe Papaya Cleansing Balm",
      brand: "Glow Recipe",
      category: "Face",
      subtype: "Makeup Cleansing Balm",
      price: 32.00,
      rating: 4.6,
      image: [
        "https://i.postimg.cc/6pFtqRxK/temp-Imagek-Ezi-La.avif",
        "https://i.postimg.cc/63r9DQSB/temp-Image-KGKUz-N.avif",
        "https://i.postimg.cc/MKPWkNsf/temp-Image-KJei5Z.avif"
      ], // <-- SỬA
      description: "Sáp tẩy trang đu đủ, làm sạch sâu, da mềm mịn.",
      isNew: false
    },
    {
      id: 23,
      name: "Clinique Take The Day Off Balm",
      brand: "Clinique",
      category: "Face",
      subtype: "Makeup Cleansing Balm",
      price: 38.00,
      rating: 4.8,
      image: [
        "https://i.postimg.cc/XqnV3bSF/temp-Imagekp3c-QC.avif",
        "https://i.postimg.cc/cLP0CYyj/temp-Image-Kp-Qchj.avif",
        "https://i.postimg.cc/R0nCLdLK/temp-Imagel-ZKu-SN.avif"
      ], // <-- SỬA
      description: "Sáp tẩy trang dịu nhẹ, tan chảy thành dầu, làm sạch mọi lớp makeup.",
      isNew: false
    },
    {
      id: 24,
      name: "Farmacy Green Clean",
      brand: "Farmacy",
      category: "Face",
      subtype: "Makeup Cleansing Balm",
      price: 36.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/V6QfGtKB/temp-Imagem2GNRi.avif",
        "https://i.postimg.cc/J461wvT3/temp-Image-Me5JQk.avif",
        "https://i.postimg.cc/7hXqZWwS/temp-Imagenx2BB4.avif"
      ], // <-- SỬA
      description: "Sáp tẩy trang chiết xuất thiên nhiên, sạch sâu, không khô da.",
      isNew: false
    },
  
    // === EYES: Makeup Palette (Bổ sung) ===
    {
      id: 25,
      name: "Pat McGrath Mothership V",
      brand: "Pat McGrath Labs",
      category: "Eyes",
      subtype: "Makeup Palette",
      price: 128.00,
      rating: 4.9,
      image: [
        "https://i.postimg.cc/XYt4qF6n/temp-Imageny65Uh.avif",
        "https://i.postimg.cc/Y0tpkHK6/temp-Imageo7OLSn.avif",
        "https://i.postimg.cc/RZ24hfxW/temp-Image-OH7e-G8.avif"
      ], // <-- SỬA
      description: "Bảng mắt cao cấp với 10 ô màu siêu thực, chất phấn đỉnh cao.",
      isNew: false
    },
    {
      id: 26,
      name: "Natasha Denona Biba Palette",
      brand: "Natasha Denona",
      category: "Eyes",
      subtype: "Makeup Palette",
      price: 129.00,
      rating: 4.8,
      image: [
        "https://i.postimg.cc/HkrTTzKN/temp-Imagep-Mv-Vl0.avif",
        "https://i.postimg.cc/XYrnnLhx/temp-Image-PSa-IRP.avif",
        "https://i.postimg.cc/0QY8LN4H/temp-Image-Q8yf-GJ.avif"
      ], // <-- SỬA
      description: "Bảng mắt trung tính hoàn hảo cho mọi dịp, dễ sử dụng.",
      isNew: false
    },
  
    // === EYES: Eyebrow Enhancer (3 sản phẩm mới) ===
    {
      id: 27,
      name: "Anastasia Brow Wiz",
      brand: "Anastasia Beverly Hills",
      category: "Eyes",
      subtype: "Eyebrow Enhancer",
      price: 25.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/Fzh9m45T/temp-Image-QJd-S2I.avif",
        "https://i.postimg.cc/bYRygskW/temp-Imagernb-Os-D.avif",
        "https://i.postimg.cc/7Z5qq9cQ/temp-Image-RPH1Um.avif"
      ], // <-- SỬA
      description: "Chì kẻ mày đầu siêu mảnh, phẩy sợi tự nhiên, bền màu.",
      isNew: false
    },
    {
      id: 28,
      name: "Benefit Gimme Brow+",
      brand: "Benefit Cosmetics",
      category: "Eyes",
      subtype: "Eyebrow Enhancer",
      price: 26.00,
      rating: 4.6,
      image: [
        "https://i.postimg.cc/XqxnYz4d/temp-Image-TQd-BXR.avif",
        "https://i.postimg.cc/v8vYhcfV/temp-Image-Tv-OWv-H.avif",
        "https://i.postimg.cc/PJdthjsm/temp-Image-UVh-C1k.avif"
      ], // <-- SỬA
      description: "Gel chân mày có sợi fiber, làm dày và định hình lông mày.",
      isNew: false
    },
    {
      id: 29,
      name: "Kosas Air Brow",
      brand: "Kosas",
      category: "Eyes",
      subtype: "Eyebrow Enhancer",
      price: 24.00,
      rating: 4.5,
      image: [
        "https://i.postimg.cc/2S1CCGMR/temp-Imagexc-XQk-B.avif",
        "https://i.postimg.cc/HxwpfLKr/temp-Imagey-CMx-WA.avif",
        "https://i.postimg.cc/Dyy2MncK/temp-Image-YJi-Co3.avif"
      ], // <-- SỬA
      description: "Gel mày tạo độ phồng, dưỡng mày, giữ nếp tự nhiên.",
      isNew: false
    },
  
    // === EYES: Mascara (3 sản phẩm mới) ===
    {
      id: 30,
      name: "YSL Lash Clash Mascara",
      brand: "YSL",
      category: "Eyes",
      subtype: "Mascara",
      price: 32.00,
      rating: 4.5,
      image: [
        "https://i.postimg.cc/kXXnpqvj/temp-Image-YROe-JW.avif",
        "https://i.postimg.cc/9F8W3Kxm/temp-Imagey-Uv-XYS.avif",
        "https://i.postimg.cc/Dyj2VHCm/temp-Image-Zpr5NE.avif"
      ], // <-- SỬA
      description: "Mascara làm dày và dài mi, đen tuyền, không vón cục.",
      isNew: false
    },
    {
      id: 31,
      name: "Lancôme Idôle Mascara",
      brand: "Lancôme",
      category: "Eyes",
      subtype: "Mascara",
      price: 30.00,
      rating: 4.6,
      image: [
        "https://i.postimg.cc/J4vwmkX1/32a.avif",
        "https://i.postimg.cc/BQkWsKFn/32b.avif",
        "https://i.postimg.cc/HkyqLk0j/32c.avif"
      ], // <-- SỬA
      description: "Mascara làm cong và tơi mi, đầu cọ mảnh, giữ nếp cả ngày.",
      isNew: false
    },
    {
      id: 32,
      name: "Too Faced Better Than Sex Mascara",
      brand: "Too Faced",
      category: "Eyes",
      subtype: "Mascara",
      price: 29.00,
      rating: 4.4,
      image: [
        "https://i.postimg.cc/cLnpJL7C/35a.avif",
        "https://i.postimg.cc/HL1f813h/40a.avif",
        "https://i.postimg.cc/zvvMYzXy/53a.avif"
      ], // <-- SỬA
      description: "Mascara làm dày mi tối đa, cho hàng mi ấn tượng.",
      isNew: false
    },
  
    // === EYES: Eyeliner (3 sản phẩm mới) ===
    {
      id: 33,
      name: "KVD Tattoo Liner",
      brand: "KVD Beauty",
      category: "Eyes",
      subtype: "Eyeliner",
      price: 25.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/FzzqXrsk/53b.avif",
        "https://i.postimg.cc/L557F96Y/53c.avif",
        "https://i.postimg.cc/HsRGHyMY/temp-Image19Ic-Kr.avif"
      ], // <-- SỬA
      description: "Bút kẻ mắt nước đầu lông siêu mảnh, chống nước tuyệt đối.",
      isNew: false
    },
    {
      id: 34,
      name: "Stila Stay All Day Eyeliner",
      brand: "Stila",
      category: "Eyes",
      subtype: "Eyeliner",
      price: 24.00,
      rating: 4.6,
      image: [
        "https://i.postimg.cc/SRR5bSNm/temp-Image1f7Tdo.avif",
        "https://i.postimg.cc/hP6Fgdmf/temp-Image5Lldxv.avif",
        "https://i.postimg.cc/6qqSxW5K/temp-Image72Kf9e.avif"
      ], // <-- SỬA
      description: "Kẻ mắt nước bền màu, dễ thao tác, không lem trôi.",
      isNew: false
    },
    {
      id: 35,
      name: "Chanel Stylo Yeux Waterproof",
      brand: "Chanel",
      category: "Eyes",
      subtype: "Eyeliner",
      price: 34.00,
      rating: 4.5,
      image: [
        "https://i.postimg.cc/QCCPZ8xM/temp-Image8Mu3Jw.avif",
        "https://i.postimg.cc/3Rn6q4hS/temp-Image8roq-Xh.avif",
        "https://i.postimg.cc/y8ZMN8hy/temp-Image8u-Hl-Do.avif"
      ], // <-- SỬA
      description: "Chì kẻ mắt dạng vặn, chống nước, màu sắc đậm nét.",
      isNew: false
    },
  
    // === LIPS: Lip Cream (3 sản phẩm mới) ===
    {
      id: 36,
      name: "Huda Beauty Liquid Matte",
      brand: "Huda Beauty",
      category: "Lips",
      subtype: "Lip Cream",
      price: 29.00,
      rating: 4.5,
      image: [
        "https://i.postimg.cc/MTWNt0CY/temp-Image8x1h27.avif",
        "https://i.postimg.cc/jS7pjS6d/temp-Image9BKGAv.avif",
        "https://i.postimg.cc/0Q8FZGTQ/temp-Image9Et-ETL.avif"
      ], // <-- SỬA
      description: "Son kem lì, mỏng nhẹ, không gây khô môi, bám màu lâu.",
      isNew: false
    },
    {
      id: 37,
      name: "Armani Lip Maestro",
      brand: "Armani Beauty",
      category: "Lips",
      subtype: "Lip Cream",
      price: 45.00,
      rating: 4.8,
      image: [
        "https://i.postimg.cc/50xTp5h8/temp-Image9VU6C9.avif",
        "https://i.postimg.cc/9fPsGgn0/temp-Image9Z8JLj.avif",
        "https://i.postimg.cc/fLBFPtsK/temp-Imagebt-VB2W.avif"
      ], // <-- SỬA
      description: "Son kem nhung, tạo hiệu ứng môi căng mọng, màu sắc sang trọng.",
      isNew: false
    },
    {
      id: 38,
      name: "Rare Beauty Lip Soufflé",
      brand: "Rare Beauty",
      category: "Lips",
      subtype: "Lip Cream",
      price: 20.00,
      rating: 4.6,
      image: [
        "https://i.postimg.cc/G2cVzPWF/temp-Imagecmsxi-G.avif",
        "https://i.postimg.cc/9MJSkR2K/temp-Imageco-L4xj.avif",
        "https://i.postimg.cc/ZK2kZddX/temp-Image-Csus-FX.avif"
      ], // <-- SỬA
      description: "Son kem xốp mịn, nhẹ môi, tạo hiệu ứng mờ ảo.",
      isNew: false
    },
  
    // === LIPS: Lipstick (Bổ sung) ===
    {
      id: 39,
      name: "Pat McGrath MatteTrance Lipstick",
      brand: "Pat McGrath Labs",
      category: "Lips",
      subtype: "Lipstick",
      price: 39.00,
      rating: 4.9,
      image: [
        "https://i.postimg.cc/vB3jKgyp/temp-Imagec-T11LD.avif",
        "https://i.postimg.cc/q7cW8D5f/temp-Imaged-Cap7x.avif",
        "https://i.postimg.cc/zB0MQb5D/temp-Image-Dm-M9IB.avif"
      ], // <-- SỬA
      description: "Son thỏi siêu lì, mịn như nhung, sắc tố đậm đặc.",
      isNew: false
    },
    {
      id: 40,
      name: "Chanel Rouge Coco",
      brand: "Chanel",
      category: "Lips",
      subtype: "Lipstick",
      price: 45.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/mgHvrg3w/temp-Image-EJ3IZK.avif",
        "https://i.postimg.cc/bJ3M5DPV/temp-Image-Es-Tn65.avif",
        "https://i.postimg.cc/BvfdPfM0/temp-Imagef-Dc-Vlc.avif"
      ], // <-- SỬA
      description: "Son thỏi dưỡng ẩm, màu sắc tươi tắn, vỏ son sang trọng.",
      isNew: false
    },
  
    // === LIPS: Lip Gloss (Bổ sung) ===
    {
      id: 41,
      name: "Dior Addict Lip Maximizer",
      brand: "Dior",
      category: "Lips",
      subtype: "Lip Gloss",
      price: 40.00,
      rating: 4.8,
      image: [
        "https://i.postimg.cc/rp2vR2gf/temp-Imageg-HY748.avif",
        "https://i.postimg.cc/26zMTdsB/temp-Image-GUss0h.avif",
        "https://i.postimg.cc/FKX2kXGp/temp-Image-GZ5f5l.avif"
      ], // <-- SỬA
      description: "Son bóng làm đầy môi, hiệu ứng căng mọng, a mát bạc hà.",
      isNew: false
    },
    {
      id: 42,
      name: "Buxom Full-On Plumping Lip Polish",
      brand: "Buxom",
      category: "Lips",
      subtype: "Lip Gloss",
      price: 25.00,
      rating: 4.5,
      image: [
        "https://i.postimg.cc/Xqqh6j70/temp-Image-HIw-Mxr.avif",
        "https://i.postimg.cc/ZRVgQBmH/temp-Imagehw-BQrc.avif"
      ], // <-- SỬA
      description: "Son bóng có nhũ lấp lánh, làm môi đầy đặn, the mát.",
      isNew: false
    },
  
    // === LIPS: Lip Lacquer (3 sản phẩm mới) ===
    {
      id: 43,
      name: "YSL Vernis à Lèvres",
      brand: "YSL",
      category: "Lips",
      subtype: "Lip Lacquer",
      price: 45.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/vZVJmZ7V/temp-Imagej5j-OL8.avif",
        "https://i.postimg.cc/qRkSQcPL/temp-Imagejd-Ply8.avif",
        "https://i.postimg.cc/wBYSRY0z/temp-Image-M58AVt.avif"
      ], // <-- SỬA
      description: "Son lacquer bóng bẩy, bám màu như son tint, không dính.",
      isNew: false
    },
    {
      id: 44,
      name: "Armani Ecstasy Lacquer",
      brand: "Armani Beauty",
      category: "Lips",
      subtype: "Lip Lacquer",
      price: 45.00,
      rating: 4.6,
      image: [
        "https://i.postimg.cc/Jzkfhz3y/temp-Image-Mjj80M.avif",
        "https://i.postimg.cc/6qqSxW5x/temp-Imageo5x-BT6.avif",
        "https://i.postimg.cc/W1kB41m7/temp-Imageo7fr-Wk.avif"
      ], // <-- SỬA
      description: "Son lacquer độ bóng cao, dưỡng ẩm, màu sắc rực rỡ.",
      isNew: false
    },
    {
      id: 45,
      name: "Shiseido LacquerInk LipShine",
      brand: "Shiseido",
      category: "Lips",
      subtype: "Lip Lacquer",
      price: 27.00,
      rating: 4.5,
      image: [
        "https://i.postimg.cc/MHH4J6KZ/temp-Image-OAx7Ig.avif",
        "https://i.postimg.cc/br55z7ss/temp-Imagepcw-Y9t.avif",
        "https://i.postimg.cc/9FK3V79z/temp-Image-PK0k-Nr.avif"
      ], // <-- SỬA
      description: "Son lacquer mỏng nhẹ như mực, độ bóng cao, không trọng lượng.",
      isNew: false
    },
  
    // === LIPS: Lip Glaze (3 sản phẩm mới) ===
    {
      id: 46,
      name: "Rhode Peptide Lip Tint",
      brand: "Rhode",
      category: "Lips",
      subtype: "Lip Glaze",
      price: 16.00,
      rating: 4.8,
      image: [
        "https://i.postimg.cc/85t3YJDN/temp-Image-QLcx0b.avif",
        "https://i.postimg.cc/qRkSQcPX/temp-Image-Qxrf-XP.avif",
        "https://i.postimg.cc/fyyFQzT7/temp-Imager0w-JEA.avif"
      ], // <-- SỬA
      description: "Son dưỡng có màu, bóng như glaze, phục hồi môi với peptide.",
      isNew: false
    },
    {
      id: 47,
      name: "Kosas Wet Lip Oil Gloss",
      brand: "Kosas",
      category: "Lips",
      subtype: "Lip Glaze",
      price: 22.00,
      rating: 4.6,
      image: [
        "https://i.postimg.cc/7Z2FLZ1L/temp-Image-R9e-Xg8.avif",
        "https://i.postimg.cc/QdT2Mdgd/temp-Image-RK124O.avif",
        "https://i.postimg.cc/yxGGVMk3/temp-Imager-V8S6Q.avif"
      ], // <-- SỬA
      description: "Son bóng dạng dầu, dưỡng ẩm sâu, hiệu ứng môi mọng nước.",
      isNew: false
    },
    {
      id: 48,
      name: "Ilia Balmy Glaze Lip Oil",
      brand: "Ilia",
      category: "Lips",
      subtype: "Lip Glaze",
      price: 26.00,
      rating: 4.5,
      image: [
        "https://i.postimg.cc/x1zwd1GL/temp-Image-Sb-QQa-I.avif",
        "https://i.postimg.cc/Qt0Pz9Dk/temp-Imagess-Kizw.avif",
        "https://i.postimg.cc/KjjVhGv2/temp-Image-Tj-Labf.avif"
      ], // <-- SỬA
      description: "Son bóng dưỡng ẩm có màu, đầu cọ đệm độc đáo.",
      isNew: false
    },
  
    // === LIPS: Lip Jelly (3 sản phẩm mới) ===
    {
      id: 49,
      name: "Tower 28 ShineOn Lip Jelly",
      brand: "Tower 28",
      category: "Lips",
      subtype: "Lip Jelly",
      price: 16.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/ZRT2jPGC/temp-Imagetvt1ti.avif",
        "https://i.postimg.cc/j5smv6pW/temp-Image-TZb-PNG.avif",
        "https://i.postimg.cc/cHs2T7pY/temp-Image-U0ha-QR.avif"
      ], // <-- SỬA
      description: "Son bóng dạng thạch, không dính, an toàn cho da nhạy cảm.",
      isNew: false
    },
    {
      id: 50,
      name: "Ami Colé Lip Treatment Oil",
      brand: "Ami Colé",
      category: "Lips",
      subtype: "Lip Jelly",
      price: 20.00,
      rating: 4.6,
      image: [
        "https://i.postimg.cc/T3DzP3jw/temp-Imageu9F3aa.avif",
        "https://i.postimg.cc/4yyMRfNx/temp-Image-UIBC5h.avif",
        "https://i.postimg.cc/pT24kQwX/temp-Image-Uvv-Syp.avif"
      ], // <-- SỬA
      description: "Dầu dưỡng môi, tạo hiệu ứng căng bóng như thạch.",
      isNew: false
    },
    {
      id: 51,
      name: "Gisou Honey Infused Lip Oil",
      brand: "Gisou",
      category: "Lips",
      subtype: "Lip Jelly",
      price: 32.00,
      rating: 4.5,
      image: [
        "https://i.postimg.cc/PJJcnXrG/temp-Image-Vl-Kbm-A.avif",
        "https://i.postimg.cc/mrW01WVS/temp-Image-Wi-Jq-CO.avif",
        "https://i.postimg.cc/FR98GbM3/temp-Image-Wub-JPq.avif"
      ], // <-- SỬA
      description: "Dầu dưỡng môi mật ong, dưỡng ẩm sâu, mùi hương ngọt ngào.",
      isNew: false
    },
  
    // === LIPS: Lip Mask (3 sản phẩm mới) ===
    {
      id: 52,
      name: "Laneige Lip Sleeping Mask",
      brand: "Laneige",
      category: "Lips",
      subtype: "Lip Mask",
      price: 24.00,
      rating: 4.8,
      image: [
        "https://i.postimg.cc/KYhd3hQQ/temp-Imagex-Bmk-XG.avif",
        "https://i.postimg.cc/7Z2FLZ1J/temp-Imagex-Jfng-V.avif",
        "https://i.postimg.cc/9Q76fQPT/temp-Imagexo-U8mv.avif"
      ], // <-- SỬA
      description: "Mặt nạ ngủ môi huyền thoại, làm mềm môi, hương dâu.",
      isNew: false
    },
    {
      id: 53,
      name: "Tatcha The Kissu Lip Mask",
      brand: "Tatcha",
      category: "Lips",
      subtype: "Lip Mask",
      price: 29.00,
      rating: 4.7,
      image: [
        "https://i.postimg.cc/9MJSkRV2/temp-Imagey-E9Jq2.avif",
        "https://i.postimg.cc/T3DzP3jj/temp-Imagey-Eh-RQa.avif",
        "https://i.postimg.cc/yNh2FprG/temp-Image-Yr-Ad4p.avif"
      ], // <-- SỬA
      description: "Mặt nạ môi chiết xuất đào Nhật, phục hồi môi khô nẻ.",
      isNew: false
    },
    {
      id: 54,
      name: "Summer Fridays Lip Butter Balm",
      brand: "Summer Fridays",
      category: "Lips",
      subtype: "Lip Mask",
      price: 24.00,
      rating: 4.6,
      image: [
        "https://i.postimg.cc/ZnngzbKN/temp-Imagey-VNi-JR.avif",
        "https://i.postimg.cc/qRkSQcPv/temp-Image-Z9HIb-O.avif",
        "https://i.postimg.cc/nLKNvSPQ/temp-Imagez-QB6Dl.avif"
      ], // <-- SỬA
      description: "Bơ dưỡng môi đa năng, dùng như mặt nạ hoặc son dưỡng.",
      isNew: false
    }
  ];

  // Gán mảng TẤT CẢ sản phẩm vào biến 'products'
  products = allSiteProducts.map((p, index) => ({ 
    ...p, 
    id: (typeof p.id === 'string' ? p.id : `prod-${p.id}`) + `-${index}`, // Tạo ID duy nhất
    // Đảm bảo 'image' LUÔN LUÔN là một mảng
    image: Array.isArray(p.image) ? p.image : [p.image] 
  })); 
  
  // SỬA LOGIC: Hiển thị TẤT CẢ sản phẩm ngay khi tải trang
  filteredProducts = [...products];
  
  console.log('Products loaded locally:', products.length);
  console.log('Showing ALL products on load:', filteredProducts.length);

  // Chạy tất cả các hàm setup
  loadCategoryProducts();
  renderProducts(); // <-- Bây giờ sẽ render TẤT CẢ sản phẩm
  setupFilters();
  setupLoadMore();
  setupViewDetails();
  setupSearch();
  setupAICombo();
  setupCart();
  setupDetailViewListeners(); // Hàm mới cho trang chi tiết

  // ========== 2) THÊM SỰ KIỆN CLICK CHO THANH NAVBAR ========== //
  const navLinks = document.querySelectorAll('.navbar a');
  navLinks.forEach(link => {
    const text = link.textContent.trim().toUpperCase();

    // Thêm sự kiện cho link "NEW"
    if (text === 'NEW') {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        filteredProducts = products.filter(p => p.isNew === true);
        currentPage = 1;
        renderProducts();
        
        hideProductDetail(); 
        
        if(productsGrid) {
            productsGrid.scrollIntoView({ behavior: 'smooth' });
        }
        if (window.innerWidth <= 900) {
          navbar.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    // Thêm sự kiện cho link "COLLECTIONS" (hoặc link xem tất cả)
    if (text === 'COLLECTIONS') {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        filteredProducts = [...products]; // Hiển thị TẤT CẢ
        currentPage = 1;
        renderProducts();
        
        hideProductDetail(); 

        if(productsGrid) {
            productsGrid.scrollIntoView({ behavior: 'smooth' });
        }
        if (window.innerWidth <= 900) {
          navbar.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  });


  // Load Dynamic Products into Categories Menu
  function loadCategoryProducts() {
    
    // === ĐÂY LÀ KHỐI CODE BẠN CẦN SỬA ===
    const categoryMappings = {
      'Face': ['Foundation', 'Blush', 'Primer', 'Concealer', 'Finish Powder', 'Contour & Highlighter', 'Makeup Cleansing Balm', 'Shop All Face'],
      'Eyes': ['Makeup Palette', 'Eyebrow Enhancer', 'Mascara', 'Eyeliner', 'Shop All Eyes'],
      'Lips': ['Lip Cream', 'Lipstick', 'Lip Gloss', 'Lip Lacquer', 'Lip Glaze', 'Lip Jelly', 'Lip Mask', 'Shop All Lips']
    };
    // =====================================

    const productLists = document.querySelectorAll('.menu-categories .product-list');
    productLists.forEach(list => {
      const categoryEl = list.closest('.category');
      if (!categoryEl) return; 
      
      const category = categoryEl.dataset.category;
      const subItems = categoryMappings[category] || [];
      
      console.log('Rendering category:', category, 'with items:', subItems);
      // Dòng này sẽ GHI ĐÈ lên HTML mặc định của bạn
      list.innerHTML = subItems.map((item, index) => {
        if (item.includes('Shop All')) {
          return `<li class="shop-all-link">${item}</li>`;
        }
        // Tạo data-subtype chuẩn (vd: 'contour-&-highlighter' -> 'contour-highlighter')
        const subtype = item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
        return `<li data-subtype="${subtype}">${item}</li>`;
      }).join('');

      // Thêm sự kiện click cho các <li> mới được tạo
      list.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', (e) => {
          e.stopPropagation();
          hideProductDetail(); 

          if (li.classList.contains('shop-all-link')) {
            filteredProducts = products.filter(p => p.category === category);
            currentPage = 1;
            renderProducts();
            if (window.innerWidth <= 900) {
              navbar.classList.remove('active');
              shopAll.classList.remove('active');
              menuCategories.classList.remove('active');
              document.body.style.overflow = '';
            }
          } else {
            const subtype = li.dataset.subtype;
            
            // Logic lọc theo subtype
            filteredProducts = products.filter(p => {
              if (p.category !== category) return false;
              // Chuyển đổi subtype của sản phẩm sang dạng chuẩn để so sánh
              const productSubtype = p.subtype ? p.subtype.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') : '';
              return productSubtype === subtype;
            });
            
            currentPage = 1;
            renderProducts();
            if (window.innerWidth <= 900) {
              navbar.classList.remove('active');
              shopAll.classList.remove('active');
              menuCategories.classList.remove('active');
              document.body.style.overflow = '';
            }
          }
        });
      });
    });
  }

  // Render Products
  function renderProducts() {
    if (!productsGrid) {
      console.error('productsGrid not found');
      return;
    }
    
    productsGrid.innerHTML = '';
    if (!filteredProducts || filteredProducts.length === 0) {
      productsGrid.innerHTML = '<p style="text-align: center; color: var(--branch-brown);">No products found.</p>';
      console.log('No products to render:', filteredProducts);
      
      if (loadMoreButton) {
        loadMoreButton.style.display = 'none';
      }
      return;
    }
    
    const start = 0;
    const end = currentPage * productsPerPage;
    const pageProducts = filteredProducts.slice(start, end);
    
    console.log('Rendering products:', pageProducts.length, 'from', start, 'to', end);

    pageProducts.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';

      // 'image' giờ đã được đảm bảo là mảng, dùng product.image[0]
      productCard.innerHTML = `
        <div style="position: relative;">
          <img src="${product.image[0]}" alt="${product.name}" class="product-img">
          ${product.isNew ? '<span class="new-badge">NEW</span>' : ''} 
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

    if (loadMoreButton) {
      loadMoreButton.style.display = end >= filteredProducts.length ? 'none' : 'block';
    }
  }

  // Filters
  function setupFilters() {
    if (categoryButtons.length > 0) {
      categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          hideProductDetail(); 
          
          categoryButtons.forEach(b => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          const category = btn.dataset.category;
          applyFilters(category);
        });
      });
    }

    if (filterToggle && filterMenu) {
      filterToggle.addEventListener('click', () => {
        filterMenu.classList.toggle('show');
      });
    }

    [priceFilter, ratingFilter, brandFilter].forEach(filter => {
      filter?.addEventListener('change', () => {
        hideProductDetail(); 
        applyFilters();
      });
    });
  }

  function applyFilters(category = document.querySelector('.category-btn.is-selected')?.dataset.category || 'All') {
    filteredProducts = [...products];

    if (category !== 'All') {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (priceFilter?.value === 'low-high') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (priceFilter?.value === 'high-low') {
      filteredProducts.sort((a, b) => b.price - a.price);
    }

    if (ratingFilter?.value !== 'default') {
      const minRating = parseFloat(ratingFilter.value);
      filteredProducts = filteredProducts.filter(p => p.rating >= minRating);
    }

    if (brandFilter?.value !== 'default') {
      filteredProducts = filteredProducts.filter(p => p.brand === brandFilter.value);
    }

    currentPage = 1;
    renderProducts();
  }

  // Search
  function setupSearch() {
    const searchInput = document.querySelector('.search input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        hideProductDetail(); 

        const query = searchInput.value.toLowerCase();
        filteredProducts = products.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.brand.toLowerCase().includes(query) || 
          (p.description && p.description.toLowerCase().includes(query))
        );
        currentPage = 1;
        renderProducts();
      });
    }
  }

  // Load More
  function setupLoadMore() {
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', () => {
        currentPage++;
        renderProducts();
      });
    }
  }

  // View Details
  function setupViewDetails() {
    productsGrid.addEventListener('click', (e) => {
      if (e.target.classList.contains('view-details')) {
        e.preventDefault();
        
        const id = e.target.dataset.id; // ID bây giờ là string
        const product = products.find(p => p.id === id);
        
        if (product) {
          displayProductDetail(product);
        } else {
          console.error("Không tìm thấy sản phẩm với ID:", id);
        }
      }
    });
  }

  // === HÀM MỚI: Hiển thị chi tiết sản phẩm ===
  function displayProductDetail(product) {
    currentDetailProduct = product; 
    
    detailMainImage.src = product.image[0];
    detailMainImage.alt = product.name;
    detailBrand.textContent = product.brand;
    detailName.textContent = product.name;
    detailPrice.textContent = formatCurrency(product.price);
    detailDescription.textContent = product.description;
    detailCategory.textContent = product.category;
    detailRating.innerHTML = `${product.rating.toFixed(1)} <span class="star">★</span>`;
    detailQuantityInput.value = 1;

    detailThumbnailContainer.innerHTML = '';
    product.image.forEach((imgSrc, index) => {
      const thumb = document.createElement('img');
      thumb.src = imgSrc;
      thumb.alt = `${product.name} thumbnail ${index + 1}`;
      thumb.className = 'thumbnail-img';
      if (index === 0) {
        thumb.classList.add('active');
      }
      
      thumb.addEventListener('click', () => {
        detailMainImage.src = imgSrc;
        detailThumbnailContainer.querySelectorAll('.thumbnail-img').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
      detailThumbnailContainer.appendChild(thumb);
    });

    mainPageContent.forEach(el => el && el.classList.add('hidden'));
    productDetailView.classList.remove('hidden');
    
    window.scrollTo(0, 0);
  }

  // === HÀM MỚI: Ẩn chi tiết và quay lại trang chủ ===
  function hideProductDetail() {
    if (!productDetailView || productDetailView.classList.contains('hidden')) {
      return; 
    }
    
    productDetailView.classList.add('hidden');
    mainPageContent.forEach(el => el && el.classList.remove('hidden'));
    currentDetailProduct = null;
  }


  // Cart Functionality
  function setupCart() {
    // Sự kiện click cho nút "Add to Cart" trên lưới sản phẩm
    productsGrid.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart')) {
        const id = e.target.dataset.id; // ID là string
        // Tái sử dụng logic addToCart
        const product = products.find(p => p.id === id);
        if (product) {
          _addToCart(product, 1);
        }
      }
    });

    if (cartIcon) {
      cartIcon.parentElement.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '../cart/cart.html';
      });
    } else {
      console.log('Cart icon not found. Check HTML structure: .header nav a img[alt="Shopping"]');
    }
  }
  
  // Hàm nội bộ để xử lý logic giỏ hàng
  function _addToCart(product, quantity) {
    if (!product) return;

    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image[0],
        quantity: quantity
      });
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    showMessage(`${product.name} (x${quantity}) đã được thêm vào giỏ!`, 'success');
  }

  // AI Combo Suggestion
  function setupAICombo() {
    if (aiButton) {
      aiButton.addEventListener('click', () => {
        const combo = generateAICombo();
        showMessage(`Suggested Combo: ${combo.join(', ')}`, 'info');
      });
    }
  }

  function generateAICombo() {
    const categories = ['Face', 'Eyes', 'Lips'];
    const combo = categories.map(category => {
      const categoryProducts = products.filter(p => p.category === category);
      if(categoryProducts.length === 0) return 'No product';
      return categoryProducts[Math.floor(Math.random() * categoryProducts.length)]?.name;
    });
    return combo;
  }
  
  // === HÀM MỚI: Thêm sự kiện cho các nút trang chi tiết ===
  function setupDetailViewListeners() {
    if (!detailBackBtn) return; // Dừng lại nếu các element chi tiết không tồn tại

    detailBackBtn.addEventListener('click', hideProductDetail);

    detailDecreaseQty.addEventListener('click', () => {
      let currentVal = parseInt(detailQuantityInput.value);
      if (currentVal > 1) {
        detailQuantityInput.value = currentVal - 1;
      }
    });

    detailIncreaseQty.addEventListener('click', () => {
      let currentVal = parseInt(detailQuantityInput.value);
      detailQuantityInput.value = currentVal + 1;
    });

    detailAddToCartBtn.addEventListener('click', () => {
      if (!currentDetailProduct) return;
      
      const quantity = parseInt(detailQuantityInput.value);
      if (quantity <= 0) {
        showMessage("Số lượng phải lớn hơn 0", "error");
        return;
      }
      
      // Tái sử dụng hàm _addToCart
      _addToCart(currentDetailProduct, quantity);
    });
  }

}); // <-- Kết thúc 'DOMContentLoaded'