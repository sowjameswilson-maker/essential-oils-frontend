// ===============================
// API BASE (VERY TOP OF FILE)
// ===============================
const API_BASE=
  location.hostname === 'localhost'
    ? 'http://localhost:4242'
    : 'https://essential-oils-backend-1.onrender.com';

const form = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const clearBtn = document.getElementById('clear-form');

// -------------------- Load all products --------------------
async function loadProducts() {
  try {
    const res = await fetch(API_BASE);
    const products = await res.json();
    productList.innerHTML = '';

    products.forEach(prod => {
      const div = document.createElement('div');
      div.className = 'product-item';
      div.innerHTML = `
        <strong>${prod.name}</strong> - $${prod.price.toFixed(2)} - Stock: ${prod.stock || 0}
        <button class="edit-btn" data-id="${prod._id}">Edit</button>
        <button class="delete-btn" data-id="${prod._id}">Delete</button>
      `;
      productList.appendChild(div);
    });

    // Add event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => loadProductForm(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
    });

  } catch (err) {
    console.error('Error loading products:', err);
  }
}

// -------------------- Load single product into form --------------------
async function loadProductForm(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const product = await res.json();

    form.dataset.id = id; // store ID for update
    document.getElementById('product-id').value = product._id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-desc').value = product.description || '';
    document.getElementById('product-image-url').value = product.image || '';
    document.getElementById('product-stock').value = product.stock || 0;

  } catch (err) {
    console.error('Error loading product:', err);
  }
}

// -------------------- Clear form --------------------
clearBtn.addEventListener('click', () => {
  form.reset();
  form.dataset.id = '';
});

// -------------------- Submit form (create or update) --------------------
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = form.dataset.id; // if empty → create, else → update
  const formData = new FormData(form);

  try {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/${id}` : API_BASE;

    const res = await fetch(url, {
      method,
      body: formData
    });

    const result = await res.json();
    console.log('Product saved:', result);
    alert('Product saved successfully!');

    form.reset();
    form.dataset.id = '';
    loadProducts(); // refresh product list

  } catch (err) {
    console.error('Error saving product:', err);
  }
});

// -------------------- Delete product --------------------
async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const result = await res.json();
    console.log('Deleted:', result);
    loadProducts();
  } catch (err) {
    console.error('Error deleting product:', err);
  }
}

// -------------------- Initialize --------------------
loadProducts();

async function checkAdminAccess() {
  const password = prompt("Enter admin password:");

  if (!password) {
    alert("Access denied");
    window.location.href = "/";
    return;
  }

  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });

  if (!res.ok) {
    alert("Wrong password");
    window.location.href = "/";
    return;
  }

  // Success
  document.getElementById("admin-content").style.display = "block";
}

checkAdminAccess();