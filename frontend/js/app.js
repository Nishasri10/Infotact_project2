// Main Application
let selectedFood = null;

function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    if (page === 'home') document.querySelector('.nav-link[onclick="navigateTo(\'home\')"]')?.classList.add('active');
    if (page === 'dashboard') document.querySelector('.nav-link[onclick="navigateTo(\'dashboard\')"]')?.classList.add('active');
    if (page === 'wishlist') document.querySelector('.nav-link[onclick="navigateTo(\'wishlist\')"]')?.classList.add('active');
    if (page === 'reservations') document.querySelector('.nav-link[onclick="navigateTo(\'reservations\')"]')?.classList.add('active');
    if (page === 'cart') document.querySelector('.nav-link[onclick="navigateTo(\'cart\')"]')?.classList.add('active');
    if (page === 'profile') document.querySelector('.nav-link[onclick="navigateTo(\'profile\')"]')?.classList.add('active');
    
    if (page === 'home') renderHomePage();
    else if (page === 'dashboard') renderDashboardPage();
    else if (page === 'wishlist') renderWishlistPage();
    else if (page === 'reservations') renderReservationsPage();
    else if (page === 'cart') renderCartPage();
    else if (page === 'profile') renderProfilePage();
    
    document.getElementById('navMenu')?.classList.remove('active');
}

function renderNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    navbar.innerHTML = `
        <div class="nav-container">
            <div class="logo" onclick="navigateTo('home')">
                <span class="logo-icon">🍽️</span>
                <span class="logo-text">PROMAX</span>
            </div>
            <button class="menu-toggle" onclick="document.getElementById('navMenu').classList.toggle('active')">
                <i class="fas fa-bars"></i>
            </button>
            <div class="nav-menu" id="navMenu">
                <button class="nav-link" onclick="navigateTo('home')"><i class="fas fa-home"></i> Home</button>
                <button class="nav-link" onclick="navigateTo('dashboard')"><i class="fas fa-chart-line"></i> Dashboard</button>
                <button class="nav-link" onclick="navigateTo('wishlist')"><i class="fas fa-heart"></i> Wishlist</button>
                <button class="nav-link" onclick="navigateTo('reservations')"><i class="fas fa-calendar"></i> Reservations</button>
                <button class="nav-link" onclick="navigateTo('cart')"><i class="fas fa-shopping-cart"></i> Cart</button>
                <button class="nav-link" onclick="navigateTo('profile')"><i class="fas fa-user"></i> Profile</button>
            </div>
            <div class="nav-actions">
                <button class="cart-btn" onclick="toggleCart()">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count" id="cartCount">${getCartCount()}</span>
                </button>
                <div class="points-badge"><i class="fas fa-star"></i> ${currentUser.points} pts</div>
                <button class="profile-btn" onclick="navigateTo('profile')"><i class="fas fa-user-circle"></i> ${currentUser.name}</button>
            </div>
        </div>
    `;
}

function renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <nav class="navbar"></nav>
        <div class="main-content" id="pageContent"></div>
        
        <div class="cart-sidebar" id="cartSidebar">
            <div class="cart-header"><h3>Your Cart</h3><button class="modal-close" onclick="toggleCart()">&times;</button></div>
            <div class="cart-body"><div id="cartItemsList"></div></div>
            <div class="cart-footer">
                <div class="cart-total"><span>Total (inc. delivery)</span><span id="cartTotalAmount">₹0</span></div>
                <button class="btn-primary" style="width:100%" onclick="checkout()">Checkout <i class="fas fa-arrow-right"></i></button>
            </div>
        </div>
        
        <div class="modal" id="reserveModal">
            <div class="modal-content">
                <div class="modal-header"><h3><i class="fas fa-calendar-check"></i> Reserve Table</h3><button class="modal-close" onclick="document.getElementById('reserveModal').classList.remove('active')">&times;</button></div>
                <div class="modal-body">
                    <p><strong>Food:</strong> <span id="reserveFoodName"></span></p>
                    <p><strong>Restaurant:</strong> <span id="reserveRestaurant"></span></p>
                    <div class="member-selector">
                        <span>Number of Guests:</span>
                        <button class="member-btn" onclick="updateReserveMembers(-1)">-</button>
                        <span class="member-count" id="reserveMembers">2</span>
                        <button class="member-btn" onclick="updateReserveMembers(1)">+</button>
                    </div>
                    <div class="form-group"><label>Date</label><input type="date" class="form-input" id="reserveDate" min="${new Date().toISOString().split('T')[0]}"></div>
                    <div class="form-group"><label>Time</label><select class="form-input" id="reserveTime"><option>12:00 PM</option><option>1:00 PM</option><option>2:00 PM</option><option>6:00 PM</option><option>7:00 PM</option><option>8:00 PM</option><option>9:00 PM</option></select></div>
                    <button class="btn-primary" style="width:100%;margin-top:1rem" onclick="confirmReservation()">Confirm Reservation</button>
                </div>
            </div>
        </div>
        
        <div class="modal" id="foodDetailModal">
            <div class="modal-content">
                <div class="modal-header"><h3>Food Details</h3><button class="modal-close" onclick="document.getElementById('foodDetailModal').classList.remove('active')">&times;</button></div>
                <div class="modal-body" id="foodDetailContent"></div>
            </div>
        </div>
        
        <footer class="footer">
            <div class="footer-container">
                <div class="footer-section"><h3><i class="fas fa-utensils"></i> PROMAX</h3><p>Premium food delivery & dining experience</p><div class="social-links"><a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a><a href="#" class="social-link"><i class="fab fa-instagram"></i></a><a href="#" class="social-link"><i class="fab fa-twitter"></i></a></div></div>
                <div class="footer-section"><h3>Quick Links</h3><ul class="footer-links"><li><a onclick="navigateTo('home')">Home</a></li><li><a onclick="navigateTo('dashboard')">Dashboard</a></li><li><a onclick="navigateTo('wishlist')">Wishlist</a></li><li><a onclick="navigateTo('reservations')">Reservations</a></li></ul></div>
                <div class="footer-section"><h3>Contact</h3><p>support@promax.com</p><p>+91 98765 43210</p></div>
            </div>
            <div class="footer-bottom"><p>&copy; 2024 PROMAX. All rights reserved. | Premium Food Experience</p></div>
        </footer>
    `;
    
    renderNavbar();
    updateCartUI();
    navigateTo(currentPage);
}

// Make functions global
window.navigateTo = navigateTo;
window.toggleCart = toggleCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleFavorite = toggleFavorite;
window.openReserveModal = openReserveModal;
window.openFoodDetail = openFoodDetail;
window.updateReserveMembers = updateReserveMembers;
window.confirmReservation = confirmReservation;
window.checkout = checkout;
window.handleAuth = handleAuth;
window.updateProfile = updateProfile;

// Initialize
loadData();
renderApp();