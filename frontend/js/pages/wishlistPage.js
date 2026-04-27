function renderWishlistPage() {
    const wishlistItems = foodItems.filter(f => favorites.includes(f.id));
    const container = document.getElementById('pageContent');
    
    if (wishlistItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart-broken"></i>
                <h2>Your Wishlist is Empty</h2>
                <p>Save your favorite dishes by clicking the heart icon on any food item!</p>
                <button class="btn-primary" onclick="navigateTo('home')">Browse Food Items</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="section-title"><i class="fas fa-heart" style="color:var(--danger)"></i> My Wishlist (${wishlistItems.length} items)</div>
        <div class="food-grid" id="wishlistGrid"></div>
    `;
    
    const grid = document.getElementById('wishlistGrid');
    grid.innerHTML = wishlistItems.map(food => `
        <div class="food-card">
            <div class="food-image" style="background-image: url('${food.image}')">
                <div class="food-badge ${food.isVeg ? 'veg-badge' : 'non-veg-badge'}">${food.isVeg ? '🌱 Veg' : '🍖 Non-Veg'}</div>
                <button class="favorite-btn active" onclick="event.stopPropagation(); toggleFavorite(${food.id})">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="food-info">
                <div class="food-name">${food.name}</div>
                <div class="food-desc">${food.description}</div>
                <div class="food-meta">
                    <div class="rating"><i class="fas fa-star"></i> ${food.rating}</div>
                    <div><i class="fas fa-clock"></i> ${food.deliveryTime}</div>
                    <div class="price">${formatPrice(food.price)}</div>
                </div>
                <div class="food-actions">
                    <button class="btn-delivery" onclick="addToCart(${JSON.stringify(food).replace(/"/g, '&quot;')})"><i class="fas fa-motorcycle"></i> Delivery</button>
                    <button class="btn-reserve" onclick="openReserveModal(${JSON.stringify(food).replace(/"/g, '&quot;')})"><i class="fas fa-calendar"></i> Dine In</button>
                    <button class="btn-view" onclick="openFoodDetail(${JSON.stringify(food).replace(/"/g, '&quot;')})"><i class="fas fa-eye"></i> View</button>
                </div>
            </div>
        </div>
    `).join('');
}