// Order Tracker Component
let currentOrder = null;
let trackingInterval = null;

function OrderTracker(order) {
    const steps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentStep = steps.indexOf(order.status);
    
    return `
        <div class="order-tracker">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(currentStep / (steps.length - 1)) * 100}%"></div>
            </div>
            <div class="tracking-steps">
                <div class="tracking-step ${currentStep >= 0 ? 'active' : ''}">
                    <div class="step-icon">📝</div>
                    <div class="step-label">Ordered</div>
                </div>
                <div class="tracking-step ${currentStep >= 1 ? 'active' : ''}">
                    <div class="step-icon">✅</div>
                    <div class="step-label">Confirmed</div>
                </div>
                <div class="tracking-step ${currentStep >= 2 ? 'active' : ''}">
                    <div class="step-icon">🍳</div>
                    <div class="step-label">Preparing</div>
                </div>
                <div class="tracking-step ${currentStep >= 3 ? 'active' : ''}">
                    <div class="step-icon">🚚</div>
                    <div class="step-label">On the Way</div>
                </div>
                <div class="tracking-step ${currentStep >= 4 ? 'active' : ''}">
                    <div class="step-icon">🏠</div>
                    <div class="step-label">Delivered</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 1rem;">
                <p style="color: rgba(255,255,255,0.7); font-size: 0.875rem;">
                    ${order.status === 'delivered' ? '🎉 Order Delivered! Leave a review to earn points!' : 
                      order.status === 'out_for_delivery' ? '🚚 Your order is on the way!' :
                      '⏳ Your order is being prepared...'}
                </p>
            </div>
        </div>
    `;
}

function startTracking(orderId) {
    if (trackingInterval) clearInterval(trackingInterval);
    
    // Join WebSocket room for real-time updates
    if (window.WebSocketService) {
        window.WebSocketService.joinOrder(orderId);
    }
    
    // Poll for updates every 5 seconds as fallback
    trackingInterval = setInterval(async () => {
        if (window.currentUser && window.currentUser.token) {
            const result = await API.orders.trackOrder(orderId, window.currentUser.token);
            if (result.success && result.tracking) {
                const order = { status: result.tracking.status, orderId, ...result.tracking };
                if (currentOrder && currentOrder.status !== order.status) {
                    showNotification(`Order status updated: ${order.status}`);
                }
                currentOrder = order;
                if (window.updateOrderTracker) window.updateOrderTracker(order);
            }
        }
    }, 5000);
}

function stopTracking() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
}