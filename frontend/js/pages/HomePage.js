// Home Page Component - Complete with all 10 food items
function renderHomePage() {
    const container = document.getElementById('pageContent');
    
    // Check if foodItems exists and has data
    if (typeof foodItems === 'undefined' || !foodItems || foodItems.length === 0) {
        container.innerHTML = `
            <div class="hero">
                <h1>Discover <span>Amazing</span><br>Food Experiences</h1>
                <p>Order delivery, reserve tables, and explore delicious items from top restaurants</p>
                <button class="btn-primary" onclick="navigateTo('dashboard')">Go to Dashboard</button>
            </div>
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>No Food Items Found</h2>
                <p>Please check your data connection.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="hero">
            <h1>Discover <span>Amazing</span><br>Food Experiences</h1>
            <p>Order delivery, reserve tables, and explore delicious items from top restaurants</p>
            <button class="btn-primary" onclick="navigateTo('dashboard')">Go to Dashboard</button>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-store"></i></div>
                <div class="stat-value">50+</div>
                <div class="stat-label">Partner Restaurants</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-utensils"></i></div>
                <div class="stat-value">10+</div>
                <div class="stat-label">Food Items</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-star"></i></div>
                <div class="stat-value">4.8★</div>
                <div class="stat-label">Average Rating</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-clock"></i></div>
                <div class="stat-value">30min</div>
                <div class="stat-label">Delivery Time</div>
            </div>
        </div>
        
        <div class="section-title">
            <i class="fas fa-fire" style="color:var(--warning)"></i> Our Special Dishes
        </div>
        <div class="food-grid" id="foodGrid"></div>
    `;
    
    // Render food items grid
    const foodGrid = document.getElementById('foodGrid');
    
    // Get current favorites from localStorage
    let currentFavorites = [];
    try {
        currentFavorites = JSON.parse(localStorage.getItem('promax_favorites') || '[]');
    } catch(e) {
        currentFavorites = [];
    }
    
    console.log("Rendering food items:", foodItems.length);
    console.log("Current favorites:", currentFavorites);
    
    foodGrid.innerHTML = foodItems.map(food => {
        const isFavorite = currentFavorites.includes(food.id);
        
        return `
            <div class="food-card" data-food-id="${food.id}">
                <div class="food-image" style="background-image: url('${food.image}');height:220px">
                    <div class="food-badge ${food.isVeg ? 'veg-badge' : 'non-veg-badge'}">
                        ${food.isVeg ? '🌱 Vegetarian' : '🍖 Non-Vegetarian'}
                    </div>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${food.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                    ${food.popular ? '<div class="food-badge" style="left:auto;right:1rem;top:auto;bottom:1rem;background:var(--warning)">🔥 Popular</div>' : ''}
                </div>
                <div class="food-info">
                    <div class="food-name">${food.name}</div>
                    <div class="food-desc">${food.description.substring(0, 80)}${food.description.length > 80 ? '...' : ''}</div>
                    <div class="food-meta">
                        <div class="rating"><i class="fas fa-star"></i> ${food.rating}</div>
                        <div><i class="fas fa-clock"></i> ${food.deliveryTime}</div>
                        <div class="price">${formatPrice(food.price)}</div>
                    </div>
                    <div class="food-actions">
                        <button class="btn-delivery" onclick="addToCart(${JSON.stringify(food).replace(/"/g, '&quot;')})">
                            <i class="fas fa-motorcycle"></i> Delivery
                        </button>
                        <button class="btn-reserve" onclick="openReserveModal(${JSON.stringify(food).replace(/"/g, '&quot;')})">
                            <i class="fas fa-calendar"></i> Dine In
                        </button>
                        <button class="btn-view" onclick="openFoodDetail(${JSON.stringify(food).replace(/"/g, '&quot;')})">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    if (foodItems.length === 0) {
        foodGrid.innerHTML = '<div class="empty-state"><i class="fas fa-utensils"></i><h3>No food items available</h3><p>Check back later for delicious dishes!</p></div>';
    }
}