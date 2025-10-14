let products = [];
let displayedProductsCount = 9;
let searchTerm = '';
let selectedCategory = 'All';
let selectedBrand = 'default';
let selectedPrice = 'default';
let selectedRating = 'default';
const PRODUCTS_PER_LOAD = 6;

let menuGrid;

function createCard(p) {
  const star = `<svg class="star" viewBox="0 0 24 24"><path fill="currentColor" d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.867 1.677 8.27-7.613-4.017-7.613 4.017 1.677-8.27-6.064-5.867 8.332-1.151z"/></svg>`;
  return `
  <div class="product-card">
    <div class="card-inner">
      <img src="${p.image}" alt="${p.name}" class="product-img">
      <div class="info">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="meta">
          <span>${p.brand}</span> · <span>${p.category}</span>
        </div>
        <div class="actions">
          <span class="price">$${p.price.toFixed(2)}</span>
          <span class="rating">${star}${p.rating}</span>
        </div>
        <div class="buttons">
          <button class="btn-outline">View</button>
          <button class="btn-primary">Add</button>
        </div>
      </div>
    </div>
  </div>`;
}

function filter(p) {
  const search = p.name.toLowerCase().includes(searchTerm.toLowerCase());
  const cat = selectedCategory === 'All' || p.category === selectedCategory;
  const brand = selectedBrand === 'default' || p.brand === selectedBrand;
  const rating =
    selectedRating === 'default' ||
    (selectedRating === '5' && p.rating === 5) ||
    (selectedRating === '4.5' && p.rating >= 4.5) ||
    (selectedRating === '4' && p.rating >= 4);
  return search && cat && brand && rating;
}

function sort(arr) {
  if (selectedPrice === 'low-high') return arr.sort((a,b)=>a.price-b.price);
  if (selectedPrice === 'high-low') return arr.sort((a,b)=>b.price-a.price);
  return arr;
}

function render() {
  const list = sort(products.filter(filter));
  const shown = list.slice(0, displayedProductsCount);
  menuGrid.innerHTML = shown.map(createCard).join('') || `<p class="no-result">No matching products found.</p>`;
  document.getElementById('load-more-button').style.display = displayedProductsCount < list.length ? 'block' : 'none';
}

function loadMore() {
  displayedProductsCount += PRODUCTS_PER_LOAD;
  render();
}

async function init() {
  menuGrid = document.querySelector('.products-grid');
  const res = await fetch('./products.json');
  products = await res.json();

  document.getElementById('search-input').addEventListener('input', e => { searchTerm = e.target.value; render(); });
  document.getElementById('price-filter').addEventListener('change', e => { selectedPrice = e.target.value; render(); });
  document.getElementById('rating-filter').addEventListener('change', e => { selectedRating = e.target.value; render(); });
  document.getElementById('brand-filter').addEventListener('change', e => { selectedBrand = e.target.value; render(); });

  const catBtns = document.querySelectorAll('.category-btn');
  catBtns.forEach(b => b.addEventListener('click', e=>{
    catBtns.forEach(x=>x.classList.remove('is-selected'));
    e.target.classList.add('is-selected');
    selectedCategory = e.target.dataset.category;
    render();
  }));

  document.getElementById('filter-toggle').addEventListener('click',()=>{
    document.getElementById('filter-menu').classList.toggle('show');
  });

  document.getElementById('load-more-button').addEventListener('click', loadMore);
  render();
}
document.addEventListener('DOMContentLoaded', init);
