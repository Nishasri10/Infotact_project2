// Orders Page Component
function renderOrdersPage() {
    const container = document.getElementById('pageContent');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 4rem;">
                <i class="fas fa-shopping-bag" style="font-size: 4rem; color: var(--gray); margin-bottom: 1rem;"></i>
                <h2>No Orders Yet</h2>
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Order delicious food items from our restaurants!</p>
                <button class="btn-primary" onclick="navigateTo('home')">
                    <i class="fas fa-utensils"></i> Browse Food Items
                </button>
            </div>
        `;
        return;
    }
    
    const deliveredCount = orders.filter(o => o.status === 'delivered').length;
    const inProgressCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
    
    container.innerHTML = `
        <div class="dashboard-header" style="background: linear-gradient(135deg, rgba(255,71,87,0.15), rgba(255,165,2,0.08)); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <div>
                <h1><i class="fas fa-shopping-bag"></i> My Orders</h1>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">View all your order history and track deliveries</p>
            </div>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem;">
                <div class="stat-card" style="padding: 0.5rem 1rem;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">${orders.length}</div>
                    <div style="font-size: 0.8rem;">Total Orders</div>
                </div>
                <div class="stat-card" style="padding: 0.5rem 1rem;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--success);">${deliveredCount}</div>
                    <div style="font-size: 0.8rem;">Delivered</div>
                </div>
                <div class="stat-card" style="padding: 0.5rem 1rem;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--warning);">${inProgressCount}</div>
                    <div style="font-size: 0.8rem;">In Progress</div>
                </div>
            </div>
        </div>
        
        <div class="section-title">
            <i class="fas fa-clock"></i> Recent Orders
        </div>
        <div class="dashboard-container">
            ${orders.map(order => `
                <div class="order-item" style="padding: 1rem; border-bottom: 1px solid var(--border); margin-bottom: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <div>
                            <strong>Order #${order.id.slice(-8)}</strong>
                            <span style="margin-left: 0.5rem; background: ${getStatusColor(order.status)}; padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.7rem;">
                                ${getStatusIcon(order.status)} ${order.status}
                            </span>
                        </div>
                        <div style="text-align: right;">
                            <div class="price">${formatPrice(order.total)}</div>
                            <small style="color: var(--gray);">${new Date(order.date).toLocaleDateString()}</small>
                        </div>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--gray); margin-bottom: 0.5rem;">
                        <i class="fas fa-store"></i> ${order.items?.[0]?.restaurant || order.restaurantName || 'Restaurant'}
                    </div>
                    <div style="font-size: 0.8rem;">
                        ${order.items?.slice(0, 2).map(i => `${i.quantity}x ${i.name}`).join(', ')}${order.items?.length > 2 ? ` +${order.items.length - 2} more` : ''}
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.8rem;">
                        ${order.status !== 'delivered' && order.status !== 'cancelled' ? `
                            <button class="btn-view" style="padding: 0.3rem 0.8rem; background: var(--info);" onclick="window.trackThisOrder('${order.id}')">
                                <i class="fas fa-map-marked-alt"></i> Track Order
                            </button>
                        ` : ''}
                        ${order.status === 'delivered' ? `
                            <button class="btn-view" style="padding: 0.3rem 0.8rem; background: var(--warning);" onclick="openReviewModal(${JSON.stringify(order).replace(/"/g, '&quot;')})">
                                <i class="fas fa-star"></i> Write Review
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Helper functions for status display
function getStatusColor(status) {
    const colors = {
        'pending': '#F57C00',
        'confirmed': '#2196F3',
        'preparing': '#FF9800',
        'out_for_delivery': '#9C27B0',
        'delivered': '#4CAF50',
        'cancelled': '#F44336'
    };
    return colors[status?.toLowerCase()] || '#757575';
}

function getStatusIcon(status) {
    const icons = {
        'pending': '⏳',
        'confirmed': '✓',
        'preparing': '🍳',
        'out_for_delivery': '🚚',
        'delivered': '✅',
        'cancelled': '❌'
    };
    return icons[status?.toLowerCase()] || '📦';
}

// Function to track a specific order
function trackThisOrder(orderId) {
    console.log('Tracking order:', orderId);
    // Store the order ID to track
    window.orderToTrack = orderId;
    // Navigate to tracking page
    navigateTo('tracking');
}

// Make function global
window.trackThisOrder = trackThisOrder;