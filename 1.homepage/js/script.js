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
  //==================NEW===============
  const newwrapper = document.getElementById('newwrapper');
    const prevnew = document.getElementById('prevnew');
    const nextnew = document.getElementById('nextnew');

    // Move by half the visible width per click
    scrollAmount = () => Math.round(newwrapper.clientWidth / 2);

    prevnew.addEventListener('click', () => {
      newwrapper.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });
    nextnew.addEventListener('click', () => {
      newwrapper.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });

    // Optional: hide arrows if scroll not needed
    function updateArrows(){
      prevnew.style.display = newwrapper.scrollLeft > 10 ? 'flex' : 'flex'; // keep visible for style like screenshot
      // (if you want to dynamically hide: use conditions here)
    }
    newwrapper.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    updateArrows();

  // ================== FLASH SALE ==================

  const sliderWrapper = document.getElementById('sliderWrapper');
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');

    // Move by half the visible width per click
  scrollAmount = () => Math.round(sliderWrapper.clientWidth / 2);

    prev.addEventListener('click', () => {
      sliderWrapper.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });
    next.addEventListener('click', () => {
      sliderWrapper.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });

    // Optional: hide arrows if scroll not needed
    function updateArrows(){
      prev.style.display = sliderWrapper.scrollLeft > 10 ? 'flex' : 'flex'; // keep visible for style like screenshot
      // (if you want to dynamically hide: use conditions here)
    }
    sliderWrapper.addEventListener('scroll', updateArrows);
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
// điều hướng khi click đến flashsale.html
  document.getElementById("viewallflashsale").addEventListener("click", function() {
    window.location.href = "flashsale.html"; // 👉 thay bằng trang bạn muốn
  });


