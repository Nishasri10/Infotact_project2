// Restaurant Card Component
function RestaurantCard(restaurant, onDelivery, onReserve) {
    const isOpen = restaurant.isOpen !== false;
    
    return `
        <div class="restaurant-card">
            <div class="restaurant-image" style="background-image: url('${restaurant.image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500'}')">
                <div class="restaurant-status" style="background: ${isOpen ? 'var(--success)' : 'var(--warning)'}">
                    ${isOpen ? 'Open Now' : 'Closed'}
                </div>
            </div>
            <div class="restaurant-info">
                <div class="restaurant-name">${restaurant.name}</div>
                <div class="restaurant-cuisine">${Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(' • ') : restaurant.cuisine}</div>
                <div class="restaurant-meta">
                    <div class="rating">⭐ ${restaurant.rating || 4.5}</div>
                    <div>📍 ${restaurant.distance ? restaurant.distance.toFixed(1) : '1.5'} km</div>
                    <div>⏱️ ${restaurant.deliveryTime || '25-35 min'}</div>
                </div>
                <div>💰 ₹${restaurant.priceForTwo || 600} for two</div>
                <div class="restaurant-actions">
                    <button class="btn-delivery" onclick="(${onDelivery})(JSON.parse('${JSON.stringify(restaurant).replace(/'/g, "\\'")}'))">
                        🛵 Delivery
                    </button>
                    <button class="btn-reserve" onclick="(${onReserve})(JSON.parse('${JSON.stringify(restaurant).replace(/'/g, "\\'")}'))">
                        🍽️ Reserve Table
                    </button>
                </div>
            </div>
        </div>
    `;
}