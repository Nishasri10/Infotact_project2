// Orders Page Component
let userOrders = [];

async function loadOrders() {
    if (!window.currentUser || !window.currentUser.token) {
        userOrders = [];
        renderOrdersList();
        return;
    }
    
    const result = await API.orders.getMyOrders(window.currentUser.token);
    if (result.success) {
        userOrders = result.orders || [];
    } else {
        // Mock orders for demo
        userOrders = [
            { orderId: 'ORD12345', restaurantId: { name: 'Biryani House' }, totalAmount: 460, status: 'delivered', createdAt: new Date() },
            { orderId: 'ORD12346', restaurantId: { name: 'Pizza Paradise' }, totalAmount: 520, status: 'preparing', createdAt: new Date() }
        ];
    }
    renderOrdersList();
}

function renderOrdersList() {
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    if (userOrders.length === 0) {
        container.innerHTML = `
            <div class="hero">
                <h3>No Orders Yet</h3>
                <p>Start exploring restaurants and place your first order!</p>
                <button class="btn-primary" onclick="window.navigateTo('restaurants')" style="width: auto;">Browse Restaurants</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userOrders.map(order => `
        <div class="restaurant-card" style="margin-bottom: 1rem;">
            <div class="restaurant-info">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="restaurant-name">${order.restaurantId?.name || 'Restaurant'}</div>
                    <div class="rating" style="color: ${order.status === 'delivered' ? 'var(--success)' : 'var(--warning)'}">
                        ${order.status === 'delivered' ? '✅ Delivered' : 
                          order.status === 'cancelled' ? '❌ Cancelled' :
                          '🔄 In Progress'}
                    </div>
                </div>
                <div class="restaurant-meta">
                    <div>Order ID: ${order.orderId}</div>
                    <div>Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
                    <div>Total: ₹${order.totalAmount}</div>
                </div>
                <button class="btn-delivery" onclick="window.viewOrder('${order.orderId}')" style="margin-top: 1rem;">
                    ${order.status === 'delivered' ? 'Leave a Review' : 'Track Order'}
                </button>
            </div>
        </div>
    `).join('');
}

function viewOrder(orderId) {
    const order = userOrders.find(o => o.orderId === orderId);
    if (order && order.status === 'delivered') {
        openReviewModal(order);
    } else {
        showNotification(`Tracking order ${orderId}. Real-time updates coming!`);
    }
}

function OrdersPage() {
    setTimeout(() => loadOrders(), 100);
    
    return `
        <div class="dashboard">
            <h2>My Orders</h2>
            <div id="ordersList" style="margin-top: 2rem;">
                <div class="loading">Loading orders...</div>
            </div>
        </div>
    `;
}