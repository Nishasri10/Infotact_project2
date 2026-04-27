function renderHomePage() {
    const container = document.getElementById('pageContent');
    container.innerHTML = `
        <div class="hero"><h1>Discover <span>Amazing</span><br>Food Experiences</h1><p>Order delivery, reserve tables, and explore delicious items</p><button class="btn-primary" onclick="navigateTo('dashboard')">Go to Dashboard</button></div>
        <div class="stats-grid"><div class="stat-card"><div class="stat-icon"><i class="fas fa-store"></i></div><div class="stat-value">50+</div><div class="stat-label">Restaurants</div></div>
        <div class="stat-card"><div class="stat-icon"><i class="fas fa-utensils"></i></div><div class="stat-value">10+</div><div class="stat-label">Food Items</div></div>
        <div class="stat-card"><div class="stat-icon"><i class="fas fa-star"></i></div><div class="stat-value">4.8★</div><div class="stat-label">Avg Rating</div></div>
        <div class="stat-card"><div class="stat-icon"><i class="fas fa-clock"></i></div><div class="stat-value">30min</div><div class="stat-label">Delivery</div></div></div>
        <div class="section-title"><i class="fas fa-fire"></i> Our Special Dishes</div>
        <div class="food-grid" id="foodGrid"></div>
    `;
    const grid = document.getElementById('foodGrid');
    grid.innerHTML = foodItems.map(food => `
        <div class="food-card"><div class="food-image" style="background-image:url('${food.image}')"><div class="food-badge ${food.isVeg ? 'veg-badge' : 'non-veg-badge'}">${food.isVeg ? '🌱 Veg' : '🍖 Non-Veg'}</div>
        <button class="favorite-btn ${favorites.includes(food.id) ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${food.id})"><i class="fas fa-heart"></i></button>
        ${food.popular ? '<div class="food-badge" style="left:auto;right:1rem;top:auto;bottom:1rem;background:var(--warning)">🔥 Popular</div>' : ''}</div>
        <div class="food-info"><div class="food-name">${food.name}</div><div class="food-desc">${food.description.substring(0,80)}...</div>
        <div class="food-meta"><div class="rating"><i class="fas fa-star"></i> ${food.rating}</div><div><i class="fas fa-clock"></i> ${food.deliveryTime}</div><div class="price">${formatPrice(food.price)}</div></div>
        <div class="food-actions"><button class="btn-delivery" onclick="addToCart(${JSON.stringify(food).replace(/"/g, '&quot;')})">Delivery</button>
        <button class="btn-reserve" onclick="openReserveModal(${JSON.stringify(food).replace(/"/g, '&quot;')})">Dine In</button>
        <button class="btn-view" onclick="openFoodDetail(${JSON.stringify(food).replace(/"/g, '&quot;')})">View</button></div></div></div>
    `).join('');
}