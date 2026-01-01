// ===============================
// API BASE (VERY TOP OF FILE)
// ===============================
const API_BASE =
  location.hostname === 'localhost'
    ? 'http://localhost:4242'
    : 'https://essential-oils-backend-1.onrender.com';

// ----------------------
// 🛒 Cart Utilities
// ----------------------
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function formatPrice(num) {
  return Number(num).toFixed(2);
}

// ----------------------
// 🖼️ Render Cart
// ----------------------
function renderCart() {
  const container = document.getElementById('cart-container');
  const cart = getCart();
  container.innerHTML = '';

  const summary = document.getElementById('cart-summary');

  if (!cart.length) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    if (summary) summary.style.display = 'none';
    return;
  }

  if (summary) summary.style.display = 'block';

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${item.image || '/images/placeholder.png'}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>$${formatPrice(item.price)} x <span class="cart-qty">${item.quantity}</span></p>
        <div class="cart-controls">
          <button class="decrease">-</button>
          <button class="increase">+</button>
          <button class="remove">Remove</button>
        </div>
      </div>
    `;

    // Event listeners
    itemDiv.querySelector('.increase').addEventListener('click', () => {
      item.quantity++;
      saveCart(cart);
      renderCart();
    });

    itemDiv.querySelector('.decrease').addEventListener('click', () => {
      if (item.quantity > 1) item.quantity--;
      else cart.splice(index, 1); // remove if 1 and click -
      saveCart(cart);
      renderCart();
    });

    itemDiv.querySelector('.remove').addEventListener('click', () => {
      cart.splice(index, 1);
      saveCart(cart);
      renderCart();
    });

    container.appendChild(itemDiv);
  });

  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = formatPrice(total);
}

// ----------------------
// 🏁 Checkout Handler
// ----------------------
function initCheckout() {
  const button = document.getElementById('checkout-button');
  if (!button) return;

  button.addEventListener('click', async () => {
    const cart = getCart();
    if (!cart.length) {
      alert('Your cart is empty');
      return;
    }

    // Prevent double clicks
    button.disabled = true;

    try {
      const res = await fetch('https://essential-oils-backend-1.onrender.com/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
      });

      const data = await res.json();
      if (data.url) {
        window.location = data.url; // redirect to Stripe checkout
      } else {
        console.error('Checkout error:', data);
        alert('Failed to start checkout.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Error creating checkout session');
    } finally {
      button.disabled = false;
    }
  });
}

// ----------------------
// 🔧 Initialization
// ----------------------
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  initCheckout();
});