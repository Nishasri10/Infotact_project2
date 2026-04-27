function RestaurantCard(restaurant, isFavorite, onAddToCart, onViewDetails, onToggleFavorite) {
    return `
        <div class="restaurant-card">
            <div class="restaurant-image" style="background-image: url('${restaurant.image}')">
                <div class="restaurant-status" style="background: ${restaurant.isOpen ? '#2E7D32' : '#F57C00'}">${restaurant.isOpen ? 'Open Now' : 'Closed'}</div>
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); onToggleFavorite(${restaurant.id})"><i class="fas fa-heart"></i></button>
                <div class="distance-badge"><i class="fas fa-location-dot"></i> ${restaurant.distance} km</div>
            </div>
            <div class="restaurant-info">
                <div class="restaurant-name">${restaurant.name}</div>
                <div class="restaurant-cuisine">${restaurant.cuisine.join(' • ')}</div>
                <div class="restaurant-meta"><div class="rating">⭐ ${restaurant.rating}</div><div>⏱️ ${restaurant.deliveryTime}</div><div>💰 ₹${restaurant.priceForTwo}</div></div>
                <div class="restaurant-actions">
                    <button class="btn-delivery" onclick="onAddToCart(${JSON.stringify(restaurant).replace(/"/g, '&quot;')})"><i class="fas fa-motorcycle"></i> Delivery</button>
                    <button class="btn-view" onclick="onViewDetails(${restaurant.id})"><i class="fas fa-eye"></i> View Details</button>
                </div>
            </div>
        </div>
    `;
}