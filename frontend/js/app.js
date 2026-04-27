// Main Application
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
                <button class="nav-link" onclick="navigateTo('events')"><i class="fas fa-ticket-alt"></i> Events</button>
                <button class="nav-link" onclick="navigateTo('cart')"><i class="fas fa-shopping-cart"></i> Cart</button>
                <button class="nav-link" onclick="navigateTo('profile')"><i class="fas fa-user"></i> Profile</button>
            </div>
            <div class="nav-actions">
                <button class="cart-btn" onclick="toggleCart()">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count" id="cartCount">${getCartCount()}</span>
                </button>
                <div class="points-badge"><i class="fas fa-star"></i> ${currentUser?.points || 0} pts</div>
                <button class="profile-btn" onclick="navigateTo('profile')"><i class="fas fa-user-circle"></i> ${currentUser?.name || 'Guest'}</button>
            </div>
        </div>
    `;
}

function navigateTo(page) {
    currentPage = page;
    // Update active state on nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick') === `navigateTo('${page}')`) {
            link.classList.add('active');
        }
    });
    
    // Render the selected page
    if (page === 'home') renderHomePage();
    else if (page === 'dashboard') renderDashboardPage();
    else if (page === 'wishlist') renderWishlistPage();
    else if (page === 'reservations') renderReservationsPage();
    else if (page === 'events') renderEventsPage();
    else if (page === 'cart') renderCartPage();
    else if (page === 'profile') renderProfilePage();
    
    // Close mobile menu if open
    const navMenu = document.getElementById('navMenu');
    if (navMenu) navMenu.classList.remove('active');
    
    // Close cart sidebar when navigating
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) cartSidebar.classList.remove('open');
}

function renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <nav class="navbar"></nav>
        <div class="main-content" id="pageContent"></div>
        
        <!-- Cart Sidebar -->
        <div class="cart-sidebar" id="cartSidebar">
            <div class="cart-header">
                <h3><i class="fas fa-shopping-cart"></i> Your Cart</h3>
                <button class="modal-close" onclick="toggleCart()">&times;</button>
            </div>
            <div class="cart-body">
                <div id="cartItemsList"></div>
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Total (inc. delivery)</span>
                    <span id="cartTotalAmount">₹0</span>
                </div>
                <button class="btn-primary" style="width:100%" onclick="processCheckout()">
                    <i class="fas fa-credit-card"></i> Proceed to Checkout
                </button>
            </div>
        </div>
        
        <!-- Table Reservation Modal -->
        <div class="modal" id="reserveModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar-check"></i> Reserve Table</h3>
                    <button class="modal-close" onclick="document.getElementById('reserveModal').classList.remove('active')">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Food:</strong> <span id="reserveFoodName"></span></p>
                    <p><strong>Restaurant:</strong> <span id="reserveRestaurant"></span></p>
                    <div class="member-selector">
                        <span>Number of Guests:</span>
                        <button class="member-btn" onclick="updateReserveMembers(-1)">-</button>
                        <span class="member-count" id="reserveMembers">2</span>
                        <button class="member-btn" onclick="updateReserveMembers(1)">+</button>
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" class="form-input" id="reserveDate" min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label>Time</label>
                        <select class="form-input" id="reserveTime">
                            <option>12:00 PM</option>
                            <option>1:00 PM</option>
                            <option>2:00 PM</option>
                            <option>6:00 PM</option>
                            <option>7:00 PM</option>
                            <option>8:00 PM</option>
                            <option>9:00 PM</option>
                        </select>
                    </div>
                    <button class="btn-primary" style="width:100%;margin-top:1rem" onclick="confirmReservation()">
                        Confirm Reservation
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Food Detail Modal -->
        <div class="modal" id="foodDetailModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Food Details</h3>
                    <button class="modal-close" onclick="document.getElementById('foodDetailModal').classList.remove('active')">&times;</button>
                </div>
                <div class="modal-body" id="foodDetailContent"></div>
            </div>
        </div>
        
  <!-- Event Booking Modal -->
<div class="modal" id="eventBookingModal">
    <div class="modal-content" style="max-width:550px">
        <div class="modal-header">
            <h3><i class="fas fa-ticket-alt"></i> Book Event Tickets</h3>
            <button class="modal-close" onclick="document.getElementById('eventBookingModal').classList.remove('active')">&times;</button>
        </div>
        <div class="modal-body">
            <div style="text-align:center;margin-bottom:1rem">
                <i class="fas fa-calendar-check" style="font-size:3rem;color:var(--primary)"></i>
            </div>
            <h3 id="eventNameDisplay" style="text-align:center;margin-bottom:0.5rem"></h3>
            <p style="text-align:center;color:var(--gray);font-size:0.8rem" id="eventVenueDisplay"></p>
            <p style="text-align:center;color:var(--gray)" id="eventPriceDisplay"></p>
            
            <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:1rem;margin:1rem 0">
                <div class="member-selector" style="justify-content:space-between;flex-wrap:wrap">
                    <span><i class="fas fa-ticket"></i> Number of Tickets:</span>
                    <div style="display:flex;align-items:center;gap:0.5rem">
                        <button class="member-btn" onclick="updateEventTicketCount(-1)">-</button>
                        <span class="member-count" id="eventTicketCount">1</span>
                        <button class="member-btn" onclick="updateEventTicketCount(1)">+</button>
                    </div>
                </div>
                <div style="margin-top:0.5rem;font-size:0.7rem;color:var(--gray)" id="availableSeatsDisplay"></div>
                <div id="ticketWarning" style="margin-top:0.5rem;font-size:0.7rem;color:var(--warning);display:none"></div>
            </div>
            
            <div class="cart-total" style="margin:1rem 0;background:rgba(255,255,255,0.05);padding:1rem;border-radius:12px">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
                    <span>Total Amount:</span>
                    <span id="eventTotalDisplay" style="color:var(--primary);font-size:1.2rem;font-weight:700">₹0</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.8rem" id="pointsTotalDisplay">
                    <span><i class="fas fa-star"></i> Points to earn:</span>
                    <span>0 points</span>
                </div>
            </div>
            
            <div style="background:rgba(255,255,255,0.05);padding:0.8rem;border-radius:12px;margin:1rem 0">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
                    <i class="fas fa-gift" style="color:var(--primary)"></i>
                    <strong>What's Included:</strong>
                </div>
                <div id="eventIncludes" style="font-size:0.75rem;padding-left:1rem"></div>
            </div>
            
            <button class="btn-primary" style="width:100%" onclick="confirmEventBooking()">
                <i class="fas fa-check-circle"></i> Confirm Booking
            </button>
        </div>
    </div>
</div>
        <!-- Footer -->
        <footer class="footer">
            <div class="footer-container">
                <div class="footer-section">
                    <h3><i class="fas fa-utensils"></i> PROMAX</h3>
                    <p>Premium food delivery & dining experience</p>
                    <div class="social-links">
                        <a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
                    </div>
                </div>
                <div class="footer-section">
                    <h3>Quick Links</h3>
                    <ul class="footer-links">
                        <li><a onclick="navigateTo('home')">Home</a></li>
                        <li><a onclick="navigateTo('dashboard')">Dashboard</a></li>
                        <li><a onclick="navigateTo('wishlist')">Wishlist</a></li>
                        <li><a onclick="navigateTo('reservations')">Reservations</a></li>
                        <li><a onclick="navigateTo('events')">Events</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Contact</h3>
                    <p><i class="fas fa-envelope"></i> support@promax.com</p>
                    <p><i class="fas fa-phone"></i> +91 98765 43210</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 PROMAX. All rights reserved. | Premium Food Experience</p>
            </div>
        </footer>
    `;
    
    renderNavbar();
    updateCartUI();
    navigateTo('home'); // Start on home page
}

// Make functions global
window.navigateTo = navigateTo;
window.toggleCart = toggleCart;
window.processCheckout = processCheckout;
window.handleAuth = handleAuth;
window.updateProfile = updateProfile;
window.openEventBookingModal = openEventBookingModal;
window.updateEventTicketCount = updateEventTicketCount;
window.confirmEventBooking = confirmEventBooking;
window.cancelEventBooking = cancelEventBooking;

// Initialize
loadData();
renderApp();