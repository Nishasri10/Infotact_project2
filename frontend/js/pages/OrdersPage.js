let userOrders = [];

function loadOrders() {
    userOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const container = document.getElementById('ordersList');
    if (!container) return;
    if (userOrders.length === 0) { container.innerHTML = `<div style="text-align:center;padding:4rem"><i class="fas fa-shopping-bag" style="font-size:4rem"></i><h2>No Orders Yet</h2><button class="btn-primary" onclick="window.navigateTo('restaurants')">Browse Restaurants</button></div>`; return; }
    container.innerHTML = userOrders.map(order => `
        <div style="background:rgba(255,255,255,0.05);border-radius:16px;padding:1.5rem;margin-bottom:1rem"><div style="display:flex;justify-content:space-between"><h3>Order #${order.id}</h3><span style="background:${order.status === 'delivered' ? '#2E7D32' : '#F57C00'};padding:0.25rem 0.75rem;border-radius:20px">${order.status === 'delivered' ? '✅ Delivered' : '🔄 In Progress'}</span></div>
        <div><i class="fas fa-store"></i> ${order.restaurantName}</div><div><i class="fas fa-calendar"></i> ${formatDate(order.date)}</div><div><strong>Total: ${formatPrice(order.total ? order.total + 40 : 0)}</strong></div>
        ${order.status === 'delivered' ? `<button class="btn-primary" style="margin-top:1rem;background:var(--secondary)" onclick="window.openReviewModalForOrder(${JSON.stringify(order).replace(/"/g, '&quot;')})"><i class="fas fa-star"></i> Leave Review</button>` : ''}
        </div>`).join('');
}

function openReviewModalForOrder(order) { openReviewModal(order); }

function OrdersPage() { setTimeout(() => loadOrders(), 100); return `<h1><i class="fas fa-shopping-bag"></i> My Orders</h1><div id="ordersList"><div class="loading">Loading...</div></div>`; }