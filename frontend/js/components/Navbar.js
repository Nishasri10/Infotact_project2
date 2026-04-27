function Navbar(currentUser, currentPage, onNavigate, onAuth, onCartClick, cartCount) {
    return `
        <nav class="navbar">
            <div class="nav-container">
                <div class="logo" onclick="window.navigateTo('home')">
                    <span class="logo-icon">🍽️</span>
                    <span class="logo-text">HospitalityHub</span>
                </div>
                <button class="menu-toggle" onclick="document.getElementById('navMenu').classList.toggle('active')">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="nav-menu" id="navMenu">
                    <button class="nav-link ${currentPage === 'home' ? 'active' : ''}" onclick="window.navigateTo('home')"><i class="fas fa-home"></i> Home</button>
                    <button class="nav-link ${currentPage === 'restaurants' ? 'active' : ''}" onclick="window.navigateTo('restaurants')"><i class="fas fa-store"></i> Restaurants</button>
                    <button class="nav-link ${currentPage === 'orders' ? 'active' : ''}" onclick="window.navigateTo('orders')"><i class="fas fa-shopping-bag"></i> Orders</button>
                    <button class="nav-link ${currentPage === 'wishlist' ? 'active' : ''}" onclick="window.navigateTo('wishlist')"><i class="fas fa-heart"></i> Wishlist</button>
                    <button class="nav-link ${currentPage === 'events' ? 'active' : ''}" onclick="window.navigateTo('events')"><i class="fas fa-calendar-alt"></i> Events</button>
                </div>
                <div class="nav-actions">
                    <button class="cart-btn" onclick="window.toggleCart()">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="cart-count" id="cartCount">${cartCount}</span>
                    </button>
                    ${currentUser && currentUser.name !== 'Guest User' ? `
                        <div class="points-badge"><i class="fas fa-star"></i> ${currentUser.loyaltyPoints || 0} pts</div>
                        <button class="profile-btn" onclick="window.navigateTo('profile')"><i class="fas fa-user-circle"></i> ${currentUser.name.split(' ')[0]}</button>
                    ` : `
                        <button class="profile-btn" onclick="window.handleAuth()"><i class="fas fa-sign-in-alt"></i> Sign In</button>
                    `}
                </div>
            </div>
        </nav>
    `;
}