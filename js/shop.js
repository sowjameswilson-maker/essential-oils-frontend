// ===============================
// API BASE (VERY TOP OF FILE)
// ===============================
const API_BASE =
  location.hostname === 'localhost'
    ? 'http://localhost:4242'
    : 'https://essential-oils-backend-1.onrender.com';

// ------------------------------
// Initialize cart from localStorage
// ------------------------------
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// Escape HTML
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}



// ------------------------------
// Add to cart (FINAL VERSION)
// ------------------------------
function addToCart(product) {
  if (product.stock <= 0) {
    alert('Sorry, this product is out of stock!');
    return;
  }

  const existing = cart.find(item => item._id === product._id);

  if (existing) {
    if (existing.quantity < product.stock) {
      existing.quantity += 1;
    } else {
      alert('You reached the max available stock.');
      return;
    }
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${product.name} added to cart!`);
}



// ------------------------------
// Create product card
// ------------------------------
function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.id = `prod-${product._id}`;

  const imageSrc = product.image || '/images/placeholder.png';

  card.innerHTML = `
    <a href="/product.html?id=${product._id}" class="product-link">
      <div class="product-image-wrap">
        <img class="product-image" src="${imageSrc}" alt="${escapeHtml(product.name)}" loading="lazy">
      </div>
    </a>

    <div class="product-body">
      <a href="/product.html?id=${product._id}" class="product-title-link">
        <h3 class="product-title">${escapeHtml(product.name)}</h3>
      </a>
      <p class="product-desc">${escapeHtml(product.description || '')}</p>

      <div class="product-meta">
        <div class="product-price">$${Number(product.price).toFixed(2)}</div>

        ${
          product.stock > 0
            ? `<div class="product-stock">Stock: ${product.stock}</div>
               <div class="product-button"><button class="add-to-cart">Add to Cart</button></div>`
            : `<div class="out-of-stock">Out of stock</div>`
        }
      </div>
    </div>
  `;

  // Add-to-cart handler
  const btn = card.querySelector('.add-to-cart');
  if (btn) btn.addEventListener('click', () => addToCart(product));

  return card;
}



// ------------------------------
// Fetch products
// ------------------------------
async function fetchProducts() {
  try {
    //Local
    const res = await fetch(`${API_BASE}/api/products`);
    //const res = await fetch('https://essential-oils-backend-1.onrender.com/api/products');
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
}



// ------------------------------
// Render all products
// ------------------------------
async function loadProducts() {
  const products = await fetchProducts();
  const container = document.getElementById('products-container');

  if (!container) return; // not on shop page

  container.innerHTML = '';
  products.forEach(product => container.appendChild(createProductCard(product)));
}



// ------------------------------
// CART PAGE RENDERING
// ------------------------------
function renderCart() {
  const container = document.getElementById('cart-items');
  if (!container) return; // not on cart page

  container.innerHTML = '';

  if (!cart.length) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <span>${item.name}</span>
      <span>Qty: ${item.quantity}</span>
      <span>$${(item.price * item.quantity).toFixed(2)}</span>
    `;
    container.appendChild(row);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalEl = document.createElement('div');
  totalEl.className = 'cart-total';
  totalEl.textContent = `Total: $${total.toFixed(2)}`;
  container.appendChild(totalEl);
}



// ------------------------------
// Refresh stock on shop page after purchase
// ------------------------------
async function refreshProducts() {
  const products = await fetchProducts();

  products.forEach(p => {
    const card = document.getElementById(`prod-${p._id}`);
    if (!card) return;

    const stockEl = card.querySelector('.product-stock');
    if (stockEl) stockEl.textContent = `Stock: ${p.stock}`;
  });
}



// ------------------------------
// PAGE LOAD INITIALIZERS
// ------------------------------
window.addEventListener('DOMContentLoaded', () => {
  cart = JSON.parse(localStorage.getItem('cart') || '[]');
  loadProducts();  // shop page
  renderCart();    // cart page
});