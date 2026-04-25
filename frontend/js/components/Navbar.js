// Navbar Component
function Navbar(currentUser, currentPage, onNavigate, onAuth, onCartClick) {
    return `
        <nav class="navbar">
            <div class="nav-container">
                <div class="logo">
                    <span>🍽️</span>
                    <span class="logo-text">HospitalityHub</span>
                </div>
                <div class="nav-menu">
                    <button class="nav-link ${currentPage === 'home' ? 'active' : ''}" onclick="window.navigateTo('home')">
                        Home
                    </button>
                    <button class="nav-link ${currentPage === 'restaurants' ? 'active' : ''}" onclick="window.navigateTo('restaurants')">
                        Restaurants
                    </button>
                    <button class="nav-link ${currentPage === 'orders' ? 'active' : ''}" onclick="window.navigateTo('orders')">
                        My Orders
                    </button>
                    <button class="nav-link ${currentPage === 'events' ? 'active' : ''}" onclick="window.navigateTo('events')">
                        Events
                    </button>
                    <button class="nav-link ${currentPage === 'dashboard' ? 'active' : ''}" onclick="window.navigateTo('dashboard')">
                        Dashboard
                    </button>
                </div>
                <div class="nav-actions">
                    <button class="cart-btn" onclick="window.toggleCart()">
                        🛒 Cart
                        <span class="cart-count" id="cartCount">${window.getCartCount ? window.getCartCount() : 0}</span>
                    </button>
                    ${currentUser ? `
                        <div class="points-badge">
                            ⭐ ${currentUser.loyaltyPoints || 0} pts
                        </div>
                        <button class="auth-btn" onclick="window.handleAuth()">
                            👤 ${currentUser.name}
                        </button>
                    ` : `
                        <button class="auth-btn" onclick="window.handleAuth()">
                            Sign In
                        </button>
                    `}
                </div>
            </div>
        </nav>
    `;
}