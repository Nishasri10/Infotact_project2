// Order Tracking Page - Complete with Real World Map
let trackingInterval = null;
let currentTrackingOrder = null;
let map = null;
let deliveryMarker = null;
let restaurantMarker = null;
let userMarker = null;
let routeLayer = null;

// Real coordinates for Delhi locations
const locationCoordinates = {
    // Restaurant locations
    restaurants: {
        "Biryani House": { lat: 28.6139, lng: 77.2090, name: "Biryani House" },
        "Pizza Paradise": { lat: 28.6200, lng: 77.2150, name: "Pizza Paradise" },
        "Sushi Master": { lat: 28.6000, lng: 77.2000, name: "Sushi Master" },
        "Spice Garden": { lat: 28.6100, lng: 77.2050, name: "Spice Garden" },
        "Dragon Wok": { lat: 28.6300, lng: 77.2200, name: "Dragon Wok" },
        "Cafe Arabia": { lat: 28.6050, lng: 77.2100, name: "Cafe Arabia" }
    },
    // Default delivery areas (user locations)
    deliveryAreas: {
        "Connaught Place": { lat: 28.6300, lng: 77.2200, name: "Connaught Place" },
        "Saket": { lat: 28.5250, lng: 77.2100, name: "Saket" },
        "Hauz Khas": { lat: 28.5490, lng: 77.2000, name: "Hauz Khas" },
        "Koramangala": { lat: 12.9279, lng: 77.6271, name: "Koramangala" },
        "Indiranagar": { lat: 12.9784, lng: 77.6408, name: "Indiranagar" },
        "MG Road": { lat: 12.9752, lng: 77.6073, name: "MG Road" },
        "default": { lat: 28.6400, lng: 77.2250, name: "Delivery Location" }
    }
};

function renderOrderTrackingPage() {
    const container = document.getElementById('pageContent');
    const recentOrders = orders.slice(0, 10);
    
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
                <h1><i class="fas fa-map-marked-alt" style="color: var(--primary);"></i> Track Your Orders</h1>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Real-time order tracking with live GPS location</p>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem;">
            <!-- Left Panel - Order List -->
            <div>
                <h3><i class="fas fa-list"></i> Your Orders</h3>
                <div class="dashboard-container" style="margin-top: 1rem; max-height: 500px; overflow-y: auto;">
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
                    <h3><i class="fas fa-map-marked-alt"></i> Live GPS Tracking</h3>
                    <div id="trackingMap" style="height: 400px; border-radius: 12px; margin: 1rem 0; background: #e8eaf6; overflow: hidden;">
                        <div id="map" style="height: 100%; width: 100%;"></div>
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
                        <div style="display: flex; justify-content: space-between; position: relative;">
                            ${['Order Placed', 'Preparing', 'On the Way', 'Delivered'].map((step, idx) => `
                                <div class="tracking-step" style="text-align: center; flex: 1;" id="step-${idx}">
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
    
    // Load Leaflet CSS and JS dynamically
    if (!document.querySelector('#leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
            if (currentTrackingOrder) {
                initRealMap(currentTrackingOrder);
            }
        };
        document.head.appendChild(script);
    } else if (currentTrackingOrder) {
        initRealMap(currentTrackingOrder);
    }
}

// Initialize real map with Leaflet
function initRealMap(order) {
    if (map) {
        map.remove();
        map = null;
    }
    
    // Get restaurant coordinates
    const restaurantName = order.items?.[0]?.restaurant || order.restaurantName || 'Biryani House';
    const restaurantLoc = locationCoordinates.restaurants[restaurantName] || locationCoordinates.restaurants['Biryani House'];
    
    // Get delivery coordinates (based on address or default)
    let deliveryLoc = locationCoordinates.deliveryAreas['Connaught Place'];
    if (order.address) {
        for (const [area, coords] of Object.entries(locationCoordinates.deliveryAreas)) {
            if (order.address.toLowerCase().includes(area.toLowerCase())) {
                deliveryLoc = coords;
                break;
            }
        }
    }
    
    // Center map between restaurant and delivery location
    const centerLat = (restaurantLoc.lat + deliveryLoc.lat) / 2;
    const centerLng = (restaurantLoc.lng + deliveryLoc.lng) / 2;
    
    // Initialize map
    map = L.map('map').setView([centerLat, centerLng], 13);
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 3
    }).addTo(map);
    
    // Add restaurant marker
    const restaurantIcon = L.divIcon({
        html: '<div style="background: #FF4757; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><i class="fas fa-store" style="color: white; font-size: 18px;"></i></div>',
        className: 'custom-div-icon',
        iconSize: [40, 40],
        popupAnchor: [0, -20]
    });
    
    restaurantMarker = L.marker([restaurantLoc.lat, restaurantLoc.lng], { icon: restaurantIcon })
        .addTo(map)
        .bindPopup(`
            <b>🍽️ ${restaurantLoc.name}</b><br>
            <small>Restaurant</small>
        `)
        .openPopup();
    
    // Add delivery location marker (user)
    const userIcon = L.divIcon({
        html: '<div style="background: #2ED573; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><i class="fas fa-home" style="color: white; font-size: 18px;"></i></div>',
        className: 'custom-div-icon',
        iconSize: [40, 40],
        popupAnchor: [0, -20]
    });
    
    userMarker = L.marker([deliveryLoc.lat, deliveryLoc.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`
            <b>🏠 Your Location</b><br>
            <small>${order.address || deliveryLoc.name}</small>
        `);
    
    // Add delivery marker (moving vehicle)
    const deliveryIcon = L.divIcon({
        html: '<div style="background: #FFA502; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); animation: pulse 1.5s infinite;"><i class="fas fa-motorcycle" style="color: white; font-size: 16px;"></i></div>',
        className: 'custom-div-icon',
        iconSize: [35, 35],
        popupAnchor: [0, -18]
    });
    
    // Initial delivery position (near restaurant)
    const initialDeliveryPos = { lat: restaurantLoc.lat + 0.002, lng: restaurantLoc.lng + 0.002 };
    deliveryMarker = L.marker([initialDeliveryPos.lat, initialDeliveryPos.lng], { icon: deliveryIcon })
        .addTo(map)
        .bindPopup('<b>🚚 Delivery Partner</b><br>On the way to you!');
    
    // Draw route between restaurant and delivery location
    const routePoints = [
        [restaurantLoc.lat, restaurantLoc.lng],
        [deliveryLoc.lat, deliveryLoc.lng]
    ];
    
    routeLayer = L.polyline(routePoints, {
        color: '#FFA502',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
    }).addTo(map);
    
    // Add distance label
    const distance = calculateDistance(restaurantLoc.lat, restaurantLoc.lng, deliveryLoc.lat, deliveryLoc.lng);
    const midPoint = [(restaurantLoc.lat + deliveryLoc.lat) / 2, (restaurantLoc.lng + deliveryLoc.lng) / 2];
    
    L.marker(midPoint, {
        icon: L.divIcon({
            html: `<div style="background: rgba(0,0,0,0.7); padding: 2px 8px; border-radius: 20px; font-size: 11px; color: white;">${distance.toFixed(1)} km • ~${Math.ceil(distance * 3)} min</div>`,
            className: 'distance-label'
        })
    }).addTo(map);
    
    // Store tracking data
    currentTrackingOrder = {
        ...order,
        restaurantLoc: restaurantLoc,
        deliveryLoc: deliveryLoc,
        currentProgress: 0,
        distance: distance
    };
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Update delivery marker position based on progress
function updateDeliveryPosition(progress) {
    if (!currentTrackingOrder || !deliveryMarker || !map) return;
    
    const start = currentTrackingOrder.restaurantLoc;
    const end = currentTrackingOrder.deliveryLoc;
    
    const lat = start.lat + (end.lat - start.lat) * (progress / 100);
    const lng = start.lng + (end.lng - start.lng) * (progress / 100);
    
    deliveryMarker.setLatLng([lat, lng]);
    
    // Center map on delivery marker when progress > 20%
    if (progress > 20 && progress < 95) {
        map.setView([lat, lng], 14);
    }
    
    // Update popup with ETA
    const remainingDistance = currentTrackingOrder.distance * (1 - progress / 100);
    const etaMinutes = Math.ceil(remainingDistance * 3);
    deliveryMarker.bindPopup(`<b>🚚 Delivery Partner</b><br>📍 ${progress.toFixed(0)}% complete<br>⏱️ ~${etaMinutes} min away`);
    
    // Update route line style based on progress
    if (routeLayer) {
        const completedPoints = [
            [start.lat, start.lng],
            [lat, lng]
        ];
        const remainingPoints = [
            [lat, lng],
            [end.lat, end.lng]
        ];
        
        // Remove old route and add new segmented route
        map.removeLayer(routeLayer);
        
        const completedRoute = L.polyline(completedPoints, { color: '#2ED573', weight: 5, opacity: 0.8 });
        const remainingRoute = L.polyline(remainingPoints, { color: '#FFA502', weight: 4, opacity: 0.5, dashArray: '5, 10' });
        
        completedRoute.addTo(map);
        remainingRoute.addTo(map);
        routeLayer = [completedRoute, remainingRoute];
    }
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
    
    // Stop existing tracking
    if (trackingInterval) {
        clearInterval(trackingInterval);
    }
    
    // Initialize real map
    if (typeof L !== 'undefined') {
        initRealMap(order);
    } else {
        // Wait for Leaflet to load
        const checkLeaflet = setInterval(() => {
            if (typeof L !== 'undefined') {
                clearInterval(checkLeaflet);
                initRealMap(order);
            }
        }, 100);
    }
    
    // Update order details
    updateTrackingDetails(order);
    
    // Update progress steps
    updateOrderProgress(order.status);
    
    // Start simulated location updates (in real app, use WebSocket)
    if (order.status !== 'delivered' && order.status !== 'cancelled') {
        startRealTimeTracking(order);
    }
}

// Start real-time tracking simulation
function startRealTimeTracking(order) {
    let progress = 0;
    const totalDuration = 60000; // 60 seconds for demo
    const intervalTime = 1000; // Update every second
    
    // Set initial progress based on status
    if (order.status === 'preparing') progress = 25;
    else if (order.status === 'out_for_delivery') progress = 60;
    else progress = 5;
    
    trackingInterval = setInterval(() => {
        progress += (intervalTime / totalDuration) * 100;
        
        if (progress >= 100) {
            // Order delivered
            order.status = 'delivered';
            updateOrderProgress('delivered');
            updateTrackingDetails(order);
            clearInterval(trackingInterval);
            
            // Update UI
            const orderItem = document.getElementById(`order-item-${order.id}`);
            if (orderItem) {
                const statusSpan = orderItem.querySelector('.order-status-badge');
                if (statusSpan) {
                    statusSpan.style.background = getStatusColor('delivered');
                    statusSpan.innerHTML = `${getStatusIcon('delivered')} delivered`;
                }
            }
            
            showNotification('🎉 Your order has been delivered! Enjoy your meal!');
        } else {
            // Update delivery marker position
            updateDeliveryPosition(progress);
            
            // Update status based on progress
            if (progress > 70 && order.status !== 'out_for_delivery') {
                order.status = 'out_for_delivery';
                updateOrderProgress('out_for_delivery');
                updateTrackingDetails(order);
                
                // Update order item status
                const orderItem = document.getElementById(`order-item-${order.id}`);
                if (orderItem) {
                    const statusSpan = orderItem.querySelector('.order-status-badge');
                    if (statusSpan) {
                        statusSpan.style.background = getStatusColor('out_for_delivery');
                        statusSpan.innerHTML = `${getStatusIcon('out_for_delivery')} out_for_delivery`;
                    }
                }
            } else if (progress > 30 && order.status !== 'preparing' && order.status !== 'out_for_delivery') {
                order.status = 'preparing';
                updateOrderProgress('preparing');
                updateTrackingDetails(order);
            }
        }
    }, intervalTime);
}

// Stop tracking
function stopTracking() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
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
            
            renderOrderTrackingPage();
        }
    }
}

// Make functions globally available
window.selectOrderToTrack = selectOrderToTrack;
window.cancelOrder = cancelOrder;
window.stopTracking = stopTracking;
window.initRealMap = initRealMap;