// Order Tracking Page - Complete with Live Location
let trackingInterval = null;
let currentTrackingOrder = null;
let map = null;
let deliveryMarker = null;
let restaurantMarker = null;
let userMarker = null;

function renderOrderTrackingPage() {
    const container = document.getElementById('pageContent');
    const recentOrders = orders.slice(0, 10); // Get recent orders
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 4rem;">
                <i class="fas fa-shopping-bag" style="font-size: 4rem; color: var(--gray); margin-bottom: 1rem;"></i>
                <h2>No Orders Yet</h2>
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">You haven't placed any orders yet. Start ordering now!</p>
                <button class="btn-primary" onclick="navigateTo('home')">
                    <i class="fas fa-utensils"></i> Browse Food
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="dashboard-header" style="background: linear-gradient(135deg, rgba(255,71,87,0.15), rgba(255,165,2,0.08)); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <div>
                <h1><i class="fas fa-truck" style="color: var(--primary);"></i> Track Your Orders</h1>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Real-time order tracking and delivery status</p>
            </div>
        </div>
        
        <!-- Order List Section -->
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem;">
            <!-- Left Panel - Order List -->
            <div>
                <h3><i class="fas fa-list"></i> Your Orders</h3>
                <div class="dashboard-container" style="margin-top: 1rem; max-height: 600px; overflow-y: auto;">
                    ${orders.map((order, index) => `
                        <div class="order-tracking-item" onclick="selectOrderToTrack('${order.id}')" 
                             style="padding: 1rem; border-bottom: 1px solid var(--border); cursor: pointer; transition: all 0.3s; ${currentTrackingOrder?.id === order.id ? 'background: rgba(255,71,87,0.1); border-left: 3px solid var(--primary);' : ''}"
                             id="order-item-${order.id}">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                                <div>
                                    <strong>Order #${order.id.slice(-8)}</strong>
                                    <div style="font-size: 0.8rem; color: var(--gray);">${new Date(order.date).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <span class="order-status-badge" style="background: ${getStatusColor(order.status)}; padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.7rem;">
                                        ${getStatusIcon(order.status)} ${order.status}
                                    </span>
                                </div>
                            </div>
                            <div style="margin-top: 0.5rem; font-size: 0.85rem;">
                                <i class="fas fa-store"></i> ${order.items?.[0]?.restaurant || order.restaurantName || 'Restaurant'}
                            </div>
                            <div style="font-size: 0.8rem; color: var(--gray);">
                                <i class="fas fa-rupee-sign"></i> ${formatPrice(order.total)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Right Panel - Tracking Map & Details -->
            <div>
                <div class="dashboard-container">
                    <h3><i class="fas fa-map-marked-alt"></i> Live Tracking</h3>
                    <div id="trackingMap" style="height: 350px; border-radius: 12px; margin: 1rem 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                        <div style="text-align: center;">
                            <i class="fas fa-map" style="font-size: 3rem; color: var(--gray);"></i>
                            <p style="margin-top: 0.5rem;">Select an order to start tracking</p>
                        </div>
                    </div>
                    
                    <!-- Order Details -->
                    <div id="trackingDetails" style="margin-top: 1rem;">
                        <div style="text-align: center; padding: 2rem;">
                            <i class="fas fa-truck" style="font-size: 3rem; color: var(--gray);"></i>
                            <p>Select an order to see delivery status</p>
                        </div>
                    </div>
                    
                    <!-- Order Progress Steps -->
                    <div id="orderProgress" style="margin-top: 1rem; display: none;">
                        <div class="tracking-steps-container" style="display: flex; justify-content: space-between; position: relative;">
                            <div class="progress-line" style="position: absolute; top: 20px; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.1); z-index: 0;"></div>
                            ${['Order Placed', 'Preparing', 'On the Way', 'Delivered'].map((step, idx) => `
                                <div class="tracking-step" style="text-align: center; flex: 1; position: relative; z-index: 1;" id="step-${idx}">
                                    <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; transition: all 0.3s;">
                                        <i class="fas ${idx === 0 ? 'fa-receipt' : idx === 1 ? 'fa-utensils' : idx === 2 ? 'fa-truck' : 'fa-home'}"></i>
                                    </div>
                                    <div style="font-size: 0.7rem; margin-top: 0.5rem;">${step}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Helper function to get status color
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

// Helper function to get status icon
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

// Function to select and track an order
function selectOrderToTrack(orderId) {
    // Remove highlight from all order items
    document.querySelectorAll('.order-tracking-item').forEach(item => {
        item.style.background = '';
        item.style.borderLeft = '';
    });
    
    // Highlight selected order
    const selectedItem = document.getElementById(`order-item-${orderId}`);
    if (selectedItem) {
        selectedItem.style.background = 'rgba(255,71,87,0.1)';
        selectedItem.style.borderLeft = '3px solid var(--primary)';
    }
    
    // Find the order
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    currentTrackingOrder = order;
    
    // Start tracking
    startOrderTracking(order);
}

// Function to start tracking an order
function startOrderTracking(order) {
    if (trackingInterval) {
        clearInterval(trackingInterval);
    }
    
    // Initialize map if not already done
    initTrackingMap(order);
    
    // Update order details
    updateTrackingDetails(order);
    
    // Update progress steps
    updateOrderProgress(order.status);
    
    // Start simulated location updates (in real app, this would be WebSocket)
    startSimulatedTracking(order);
}

// Initialize tracking map
function initTrackingMap(order) {
    const mapContainer = document.getElementById('trackingMap');
    
    // For demo, we'll use a simulated map with coordinates
    // In production, you would use Leaflet or Google Maps API
    
    // Restaurant coordinates (simulated)
    const restaurantCoords = { lat: 28.6139, lng: 77.2090 };
    // Delivery location (simulated based on order address)
    const deliveryCoords = { lat: 28.6200, lng: 77.2150 };
    
    mapContainer.innerHTML = `
        <div id="actualMap" style="height: 100%; width: 100%; border-radius: 12px; position: relative; background: linear-gradient(135deg, #1a1a2e, #16213e);">
            <div style="position: relative; height: 100%; width: 100%;">
                <!-- Simulated Map -->
                <svg style="width: 100%; height: 100%; border-radius: 12px;" viewBox="0 0 800 400">
                    <!-- Background -->
                    <rect width="800" height="400" fill="#1a1a2e" rx="12"/>
                    
                    <!-- Roads -->
                    <path d="M 0 200 L 800 200" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
                    <path d="M 400 0 L 400 400" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
                    
                    <!-- Restaurant Marker -->
                    <g id="restaurant-marker">
                        <circle cx="150" cy="200" r="15" fill="#FF4757"/>
                        <circle cx="150" cy="200" r="20" fill="none" stroke="#FF4757" stroke-width="2" opacity="0.5"/>
                        <text x="150" y="205" text-anchor="middle" fill="white" font-size="12">🍽️</text>
                        <text x="150" y="175" text-anchor="middle" fill="white" font-size="10">Restaurant</text>
                    </g>
                    
                    <!-- Delivery Marker -->
                    <g id="delivery-marker">
                        <circle cx="150" cy="200" r="12" fill="#FFA502"/>
                        <text x="150" y="205" text-anchor="middle" fill="white" font-size="10">🚚</text>
                    </g>
                    
                    <!-- User Marker -->
                    <g id="user-marker">
                        <circle cx="650" cy="200" r="15" fill="#2ED573"/>
                        <circle cx="650" cy="200" r="20" fill="none" stroke="#2ED573" stroke-width="2" opacity="0.5"/>
                        <text x="650" y="205" text-anchor="middle" fill="white" font-size="12">🏠</text>
                        <text x="650" y="175" text-anchor="middle" fill="white" font-size="10">You</text>
                    </g>
                    
                    <!-- Route Path -->
                    <path id="route-path" d="M 150 200 C 300 200, 500 200, 650 200" fill="none" stroke="#FFA502" stroke-width="3" stroke-dasharray="10,5" opacity="0.7"/>
                    
                    <!-- Distance Label -->
                    <text x="400" y="190" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="11">3.2 km • Estimated 15 min</text>
                </svg>
            </div>
        </div>
    `;
}

// Update tracking details
function updateTrackingDetails(order) {
    const detailsContainer = document.getElementById('trackingDetails');
    const subtotal = order.subtotal || order.total - 40;
    
    let estimatedTime = '25-35 minutes';
    let deliveryPartner = 'Rajesh (Partner ID: DLV456)';
    let vehicleNumber = 'KA-01-AB-1234';
    
    if (order.status === 'preparing') {
        estimatedTime = '15-20 minutes';
    } else if (order.status === 'out_for_delivery') {
        estimatedTime = '5-10 minutes';
    } else if (order.status === 'delivered') {
        estimatedTime = 'Delivered';
    }
    
    detailsContainer.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <h4>Order #${order.id.slice(-8)}</h4>
                    <p style="color: var(--gray); font-size: 0.85rem;">Placed on ${new Date(order.date).toLocaleString()}</p>
                </div>
                <div class="order-status-badge" style="background: ${getStatusColor(order.status)}; padding: 0.3rem 0.8rem; border-radius: 20px;">
                    ${getStatusIcon(order.status)} ${order.status.toUpperCase()}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <i class="fas fa-store" style="color: var(--primary);"></i>
                        <strong>Restaurant</strong>
                    </div>
                    <p style="font-size: 0.85rem;">${order.items?.[0]?.restaurant || order.restaurantName || 'Restaurant'}</p>
                    <p style="font-size: 0.75rem; color: var(--gray);">Connaught Place, New Delhi</p>
                </div>
                
                <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <i class="fas fa-home" style="color: var(--success);"></i>
                        <strong>Delivery Address</strong>
                    </div>
                    <p style="font-size: 0.85rem;">${order.address || 'Your saved address'}</p>
                </div>
                
                <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <i class="fas fa-motorcycle" style="color: var(--warning);"></i>
                        <strong>Delivery Partner</strong>
                    </div>
                    <p style="font-size: 0.85rem;">${deliveryPartner}</p>
                    <p style="font-size: 0.75rem; color: var(--gray);">Vehicle: ${vehicleNumber}</p>
                </div>
            </div>
            
            <div style="border-top: 1px solid var(--border); padding-top: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Items:</span>
                    <span>${order.items?.length || 0} items</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Subtotal:</span>
                    <span>${formatPrice(subtotal)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Delivery Fee:</span>
                    <span>${formatPrice(40)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border);">
                    <span>Total Paid:</span>
                    <span style="color: var(--primary);">${formatPrice(order.total)}</span>
                </div>
            </div>
            
            <div style="margin-top: 1rem; background: rgba(46,213,115,0.1); border-radius: 8px; padding: 0.5rem; text-align: center;">
                <i class="fas fa-clock"></i>
                <span style="margin-left: 0.5rem;">Estimated Delivery: ${estimatedTime}</span>
            </div>
            
            ${order.status !== 'delivered' && order.status !== 'cancelled' ? `
                <button class="btn-primary" style="width: 100%; margin-top: 1rem; background: var(--danger);" onclick="cancelOrder('${order.id}')">
                    <i class="fas fa-times"></i> Cancel Order
                </button>
            ` : ''}
        </div>
    `;
}

// Update order progress steps
function updateOrderProgress(status) {
    const progressContainer = document.getElementById('orderProgress');
    progressContainer.style.display = 'block';
    
    const steps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentStepIndex = steps.indexOf(status?.toLowerCase());
    
    for (let i = 0; i <= 3; i++) {
        const stepElement = document.getElementById(`step-${i}`);
        if (stepElement) {
            const stepDiv = stepElement.querySelector('div:first-child');
            if (i <= currentStepIndex) {
                stepDiv.style.background = 'var(--primary)';
                stepDiv.style.boxShadow = '0 0 10px var(--primary)';
            } else {
                stepDiv.style.background = 'rgba(255,255,255,0.1)';
                stepDiv.style.boxShadow = 'none';
            }
        }
    }
}

// Simulated real-time tracking (in production, use WebSocket)
function startSimulatedTracking(order) {
    if (order.status === 'delivered' || order.status === 'cancelled') {
        return;
    }
    
    let progress = 0;
    const totalDuration = 60000; // 60 seconds for demo
    const intervalTime = 2000; // Update every 2 seconds
    
    trackingInterval = setInterval(() => {
        progress += (intervalTime / totalDuration) * 100;
        
        // Update delivery marker position
        const deliveryMarker = document.querySelector('#delivery-marker circle:first-child');
        if (deliveryMarker) {
            const startX = 150;
            const endX = 650;
            const currentX = startX + (progress / 100) * (endX - startX);
            deliveryMarker.setAttribute('cx', Math.min(currentX, endX));
            
            const deliveryIcon = document.querySelector('#delivery-marker text');
            if (deliveryIcon) {
                deliveryIcon.setAttribute('x', Math.min(currentX, endX));
            }
        }
        
        // Update status based on progress
        if (progress >= 100 && order.status !== 'delivered') {
            // Order delivered
            order.status = 'delivered';
            updateOrderProgress('delivered');
            updateTrackingDetails(order);
            clearInterval(trackingInterval);
            
            // Update the order in the list
            const orderItem = document.getElementById(`order-item-${order.id}`);
            if (orderItem) {
                const statusSpan = orderItem.querySelector('.order-status-badge');
                if (statusSpan) {
                    statusSpan.style.background = getStatusColor('delivered');
                    statusSpan.innerHTML = `${getStatusIcon('delivered')} delivered`;
                }
            }
            
            showNotification('🎉 Your order has been delivered! Enjoy your meal!');
        } else if (progress > 30 && order.status === 'confirmed') {
            order.status = 'preparing';
            updateOrderProgress('preparing');
            updateTrackingDetails(order);
        } else if (progress > 60 && order.status === 'preparing') {
            order.status = 'out_for_delivery';
            updateOrderProgress('out_for_delivery');
            updateTrackingDetails(order);
        }
    }, intervalTime);
}

// Function to cancel an order
function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].status = 'cancelled';
            saveData();
            showNotification('Order cancelled successfully');
            
            if (currentTrackingOrder?.id === orderId) {
                currentTrackingOrder.status = 'cancelled';
                updateTrackingDetails(currentTrackingOrder);
                updateOrderProgress('cancelled');
                if (trackingInterval) {
                    clearInterval(trackingInterval);
                }
            }
            
            // Refresh the order list
            renderOrderTrackingPage();
        }
    }
}

// Function to stop tracking (cleanup)
function stopTracking() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
}

// Make functions globally available
window.selectOrderToTrack = selectOrderToTrack;
window.cancelOrder = cancelOrder;
window.stopTracking = stopTracking;