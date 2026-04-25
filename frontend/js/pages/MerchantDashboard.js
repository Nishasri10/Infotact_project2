// Merchant Dashboard Component (for restaurant owners)
let merchantRestaurants = [];

async function loadMerchantData() {
    if (!window.currentUser || window.currentUser.role !== 'restaurant_owner') return;
    
    // Load restaurant data
    const lat = 28.6139;
    const lng = 77.2090;
    const result = await API.restaurants.getNearby(lat, lng);
    if (result.success) {
        merchantRestaurants = result.restaurants.filter(r => r.ownerId === window.currentUser.id);
        renderMerchantStats();
    }
}

function renderMerchantStats() {
    const container = document.getElementById('merchantStats');
    if (!container) return;
    
    if (merchantRestaurants.length === 0) {
        container.innerHTML = `
            <div class="hero">
                <h3>No Restaurants Registered</h3>
                <p>Add your restaurant to start receiving orders</p>
                <button class="btn-primary">Add Restaurant</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = merchantRestaurants.map(restaurant => `
        <div class="restaurant-card" style="margin-bottom: 1rem;">
            <div class="restaurant-info">
                <div class="restaurant-name">${restaurant.name}</div>
                <div class="restaurant-meta">
                    <div>⭐ ${restaurant.rating} (${restaurant.totalReviews} reviews)</div>
                    <div>📍 ${restaurant.address?.city || 'N/A'}</div>
                </div>
                <div class="restaurant-actions">
                    <button class="btn-delivery" onclick="toggleDeliveryStatus('${restaurant._id}')">
                        ${restaurant.isDeliveryActive ? '🟢 Delivery Active' : '🔴 Delivery Off'}
                    </button>
                    <button class="btn-reserve" onclick="toggleDineInStatus('${restaurant._id}')">
                        ${restaurant.isDineInActive ? '🟢 Dine-In Active' : '🔴 Dine-In Off'}
                    </button>
                </div>
                <div style="margin-top: 1rem;">
                    <h4>Today's Orders: 12</h4>
                    <h4>Revenue Today: ₹8,450</h4>
                </div>
            </div>
        </div>
    `).join('');
}

async function toggleDeliveryStatus(restaurantId) {
    showNotification('Updating status...');
    // API call would go here
    setTimeout(() => showNotification('Status updated!'), 1000);
}

function MerchantDashboard() {
    if (!window.currentUser) {
        return `
            <div class="hero">
                <h1>Restaurant Owner Login Required</h1>
                <button class="btn-primary" onclick="window.handleAuth()">Sign In as Owner</button>
            </div>
        `;
    }
    
    if (window.currentUser.role !== 'restaurant_owner') {
        return `
            <div class="hero">
                <h1>Restaurant Owner Access Only</h1>
                <p>Please login with a restaurant owner account</p>
            </div>
        `;
    }
    
    setTimeout(() => loadMerchantData(), 100);
    
    return `
        <div class="dashboard">
            <h2>Merchant Dashboard</h2>
            <div id="merchantStats">
                <div class="loading">Loading restaurant data...</div>
            </div>
        </div>
    `;
}