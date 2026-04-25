// Home Page Component
function HomePage(currentUser) {
    const points = currentUser?.loyaltyPoints || 0;
    const level = Math.floor(points / 500) + 1;
    
    return `
        <div class="hero">
            <h1>Discover Amazing <span style="color: var(--primary)">Food Experiences</span></h1>
            <p>Order delivery, reserve tables, and discover food events all in one place</p>
            <button class="btn-primary" onclick="window.navigateTo('restaurants')" style="width: auto; padding: 0.75rem 2rem;">
                Explore Restaurants
            </button>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">500+</div>
                <div class="stat-label">Partner Restaurants</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">10k+</div>
                <div class="stat-label">Happy Customers</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">4.8★</div>
                <div class="stat-label">Average Rating</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">30min</div>
                <div class="stat-label">Avg Delivery Time</div>
            </div>
        </div>
        
        ${currentUser ? `
            <div class="dashboard" style="margin-top: 2rem;">
                <h2>Your Stats</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${points}</div>
                        <div class="stat-label">Loyalty Points</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">Level ${level}</div>
                        <div class="stat-label">${level === 1 ? 'Bronze' : level === 2 ? 'Silver' : level === 3 ? 'Gold' : 'Platinum'}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${currentUser.orders?.length || 0}</div>
                        <div class="stat-label">Orders Placed</div>
                    </div>
                </div>
            </div>
        ` : ''}
        
        <div style="margin-top: 2rem;">
            <h2>Why Choose Us?</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div style="font-size: 2rem;">📍</div>
                    <div class="stat-value">Geospatial Search</div>
                    <div class="stat-label">Find restaurants near you</div>
                </div>
                <div class="stat-card">
                    <div style="font-size: 2rem;">🛒</div>
                    <div class="stat-value">Unified Cart</div>
                    <div class="stat-label">Delivery & reservations together</div>
                </div>
                <div class="stat-card">
                    <div style="font-size: 2rem;">⭐</div>
                    <div class="stat-value">Gamified Reviews</div>
                    <div class="stat-label">Earn points for reviews</div>
                </div>
            </div>
        </div>
    `;
}