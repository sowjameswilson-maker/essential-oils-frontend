// ===============================
// API BASE (VERY TOP OF FILE)
// ===============================
const API_BASE =
  location.hostname === 'localhost'
    ? 'http://localhost:4242'
    : 'https://essential-oils-backend-1.onrender.com';

// Parse ?id=...
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function fetchProduct(id) {
  try {
    const res = await fetch('https://essential-oils-backend.onrender.com/api/products');
    if (!res.ok) throw new Error("Product not found");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item._id === product._id);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });
  saveCart(cart);

  document.getElementById("add-to-cart-btn").textContent = "Added ✓";
  setTimeout(() => {
    document.getElementById("add-to-cart-btn").textContent = "Add to Cart";
  }, 900);
}

function renderProduct(product) {
  const container = document.getElementById("product-details");
  const imgSrc = product.image || "/images/placeholder.png";

  container.innerHTML = `
    <div class="product-page-imgwrap">
      <img src="${imgSrc}" class="product-page-img" alt="${product.name}">
    </div>

    <div class="product-page-info">
      <h2>${product.name}</h2>
      <p class="product-page-price">$${product.price.toFixed(2)}</p>
      <p class="product-page-desc">${product.description || ""}</p>

      <button id="add-to-cart-btn" class="add-to-cart">
        Add to Cart
      </button>
    </div>
  `;

  document
    .getElementById("add-to-cart-btn")
    .addEventListener("click", () => addToCart(product));
}

async function init() {
  const id = getProductId();
  if (!id) return;

  const product = await fetchProduct(id);
  if (!product) {
    document.getElementById("product-details").innerHTML =
      "<p>Product not found.</p>";
    return;
  }

  renderProduct(product);
}

document.addEventListener("DOMContentLoaded", init);