// ================== ANNOUNCEMENT ==================
const wrapper1 = document.getElementById('announcementWrapper');
const announcement = document.querySelectorAll('.announcement-slide');
let indexAnnouncement = 0;

function showAnnouncement(i) {
  wrapper1.style.transform = `translateX(-${i * 100}%)`;
}

// Tự động chuyển sau 5s
setInterval(() => {
  indexAnnouncement = (indexAnnouncement + 1) % announcement.length;
  showAnnouncement(indexAnnouncement);
}, 5000);


// ================== HERO SLIDE ==================
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.hero .slide');
  const dotsContainer = document.querySelector('.hero .dots');
  let indexHero = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => showHero(i));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.hero .dot');

  function showHero(i) {
    slides.forEach((slide, j) => {
      slide.classList.toggle('active', j === i);
      dots[j].classList.toggle('active', j === i);
    });
    indexHero = i;
  }

  setInterval(() => {
    showHero((indexHero + 1) % slides.length);
  }, 5000);
 // ================== NEW COLLECTION 1 ==================
  const newwrapper = document.getElementById('newwrapper');
  const prevnew = document.getElementById('prevnew');
  const nextnew = document.getElementById('nextnew');

  const scrollNew = () => Math.round(newwrapper.clientWidth / 2);

  prevnew.addEventListener('click', () => {
    newwrapper.scrollBy({ left: -scrollNew(), behavior: 'smooth' });
  });
  nextnew.addEventListener('click', () => {
    newwrapper.scrollBy({ left: scrollNew(), behavior: 'smooth' });
  });

  function updateNewArrows() {
    prevnew.style.display = 'flex';
    nextnew.style.display = 'flex';
  }
  newwrapper.addEventListener('scroll', updateNewArrows);
  window.addEventListener('resize', updateNewArrows);
  updateNewArrows();
  // ================== NEW COLLECTION  ==================
  const newwrapper2 = document.getElementById('newwrapper2');
  const prevnew2 = document.getElementById('prevnew2');
  const nextnew2 = document.getElementById('nextnew2');

  const scrollNew2 = () => Math.round(newwrapper2.clientWidth / 2);

  prevnew2.addEventListener('click', () => {
    newwrapper2.scrollBy({ left: -scrollNew2(), behavior: 'smooth' });
  });
  nextnew2.addEventListener('click', () => {
    newwrapper2.scrollBy({ left: scrollNew2(), behavior: 'smooth' });
  });

  function updateNewArrows2() {
    prevnew2.style.display = 'flex';
    nextnew2.style.display = 'flex';
  }
  newwrapper2.addEventListener('scroll', updateNewArrows2);
  window.addEventListener('resize', updateNewArrows2);
  updateNewArrows2();
  // ================== BEST SELLERS ==================
  const bestsellerWrapper = document.getElementById('bestseller');
  const preBestsellers = document.getElementById('preBestsellers');
  const nextBestsellers = document.getElementById('nextBestsellers');

  const scrollBestsellers = () => Math.round(bestsellerWrapper.clientWidth / 2);

    preBestsellers.addEventListener('click', () => {
      bestsellerWrapper.scrollBy({ left: -scrollBestsellers(), behavior: 'smooth' });
    });
    nextBestsellers.addEventListener('click', () => {
      bestsellerWrapper.scrollBy({ left: scrollBestsellers(), behavior: 'smooth' });
    });

    function updateBestsellersArrows(){
      preBestsellers.style.display = bestsellerWrapper.scrollLeft > 10 ? 'flex' : 'flex'; // keep visible for style like screenshot
    }
    bestsellerWrapper.addEventListener('scroll', updateBestsellersArrows);
    window.addEventListener('resize', updateBestsellersArrows);
    updateBestsellersArrows();
  // ================== FLASH SALE ==================
  const flashWrapper = document.getElementById('flashsale');
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');

  const scrollAmount = () => Math.round(flashWrapper.clientWidth / 2);

    prev.addEventListener('click', () => {
      flashWrapper.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });
    next.addEventListener('click', () => {
      flashWrapper.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });

    function updateArrows(){
      prev.style.display = flashWrapper.scrollLeft > 10 ? 'flex' : 'flex'; // keep visible for style like screenshot
    }
    flashWrapper.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    updateArrows();
  // ================== MENU TOGGLE ==================
  const toggleBtn = document.getElementById('menu-toggler');
  const navbar = document.getElementById('navbar');

  if (toggleBtn && navbar) {
    toggleBtn.addEventListener('click', () => {
      navbar.classList.toggle('active');
    });
  }
});
// Khi người dùng click vào phần tử có id="viewallflashsale"
document.getElementById("viewallflashsale").addEventListener("click", function() {
  window.location.href = "flashsale.html"; // Trình duyệt sẽ chuyển sang trang flashsale.html
});

// Khi người dùng click vào phần tử có id="viewallnew"
document.getElementById("viewallnew").addEventListener("click", function() {
  window.location.href = "viewallnew.html"; // Trình duyệt sẽ chuyển sang trang viewallnew.html
});
// Khi người dùng click vào phần tử có id="viewallBestsellers"
document.getElementById("viewallBestsellers").addEventListener("click", function() {
  window.location.href = "viewallBestsellers.html"; // Trình duyệt sẽ chuyển sang trang viewallBestsellers.html
});


