// ===============================
// API BASE (VERY TOP OF FILE)
// ===============================
const API_BASE =
  location.hostname === 'localhost'
    ? 'http://localhost:4242'
    : 'https://essential-oils-backend-1.onrender.com';

const ordersList = document.getElementById('orders-list');
const refreshBtn = document.getElementById('refresh');
const filterSelect = document.getElementById('filter-status');

async function loadOrders() {
  ordersList.innerHTML = 'Loading orders...';

  try {
    const res = await fetch('${API_BASE}/api/admin/orders');
    const orders = await res.json();

    const filter = filterSelect.value;
    const filtered = filter ? orders.filter(o => o.status === filter) : orders;

    if (!filtered.length) {
      ordersList.innerHTML = '<p>No orders.</p>';
      return;
    }

    ordersList.innerHTML = filtered.map(order => {
      const created = new Date(order.createdAt).toLocaleString();
      const total = (order.amount_total / 100).toFixed(2); // amount_total in cents
      const email = order.customer_email || '—';
      const status = order.status || 'paid';

      const itemsHtml = (order.items || []).map(i => `<li>${i.name} — $${i.price} × ${i.quantity}</li>`).join('');

      return `
        <div class="order-card" data-id="${order._id}">
          <div><strong>Order:</strong> ${order._id}</div>
          <div><strong>Date:</strong> ${created}</div>
          <div><strong>Total:</strong> $${total}</div>
          <div><strong>Email:</strong> ${email}</div>
          <div><strong>Status:</strong> <span class="order-status status-${status}">${status}</span></div>

          <div><strong>Items:</strong>
            <ul>${itemsHtml}</ul>
          </div>

          <div class="order-actions">
            <button class="btn-mark-shipped" data-id="${order._id}">Mark as shipped</button>
            <button class="btn-mark-processing" data-id="${order._id}">Mark as processing</button>
          </div>
        </div>
      `;
    }).join('');

    // attach handlers
    document.querySelectorAll('.btn-mark-shipped').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        await updateOrderStatus(id, 'shipped');
      });
    });
    document.querySelectorAll('.btn-mark-processing').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        await updateOrderStatus(id, 'processing');
      });
    });

  } catch (err) {
    ordersList.innerHTML = '<p>Error loading orders.</p>';
    console.error(err);
  }
}

async function updateOrderStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (json.success) {
      loadOrders();
    } else {
      alert('Failed to update order');
    }
  } catch (err) {
    console.error(err);
    alert('Error updating order');
  }
}

refreshBtn.addEventListener('click', loadOrders);
filterSelect.addEventListener('change', loadOrders);

// initial load
loadOrders();