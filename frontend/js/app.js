// Main Application
let currentUser = null;
let currentPage = 'home';
let cartItems = [];
let restaurants = [];
let userOrders = [];

// Load user from storage
function loadUser() {
    const saved = localStorage.getItem('hospitality_user');
    if (saved) {
        currentUser = JSON.parse(saved);
        if (currentUser.orders) userOrders = currentUser.orders;
    }
}

// Save user to storage
function saveUser() {
    if (currentUser) {
        currentUser.orders = userOrders;
        localStorage.setItem('hospitality_user', JSON.stringify(currentUser));
    }
}

// Load restaurants
async function loadRestaurants() {
    const result = await API.restaurants.getNearby(28.6139, 77.2090);
    if (result.success) {
        restaurants = result.restaurants;
    }
    renderPage();
}

// Add to cart
function addToCart(restaurant) {
    if (!currentUser) {
        showNotification('Please login first!', 'warning');
        handleAuth();
        return;
    }
    
    const existing = cartItems.find(item => item.id === restaurant.id);
    if (existing) {
        existing.quantity++;
    } else {
        cartItems.push({ ...restaurant, quantity: 1 });
    }
    updateCartUI();
    showNotification(`Added ${restaurant.name} to cart`);
}

// Remove from cart
function removeFromCart(index) {
    cartItems.splice(index, 1);
    updateCartUI();
    showNotification('Item removed from cart');
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    const cartItemsContainer = document.getElementById('cartItems');
    if (cartItemsContainer) {
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6);">Your cart is empty</p>';
        } else {
            cartItemsContainer.innerHTML = cartItems.map((item, index) => `
                <div class="cart-item">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>Quantity: ${item.quantity}</small><br>
                        <small>₹${item.priceForTwo * item.quantity}</small>
                    </div>
                    <button onclick="removeFromCart(${index})" style="background: #D32F2F; border: none; color: white; padding: 0.25rem 0.5rem; border-radius: 5px; cursor: pointer;">Remove</button>
                </div>
            `).join('');
        }
    }
    
    const cartTotal = document.getElementById('cartTotal');
    if (cartTotal) {
        const total = cartItems.reduce((sum, item) => sum + (item.priceForTwo * item.quantity), 0);
        cartTotal.textContent = `₹${total}`;
    }
}

// Get cart total
function getCartTotal() {
    return cartItems.reduce((sum, item) => sum + (item.priceForTwo * item.quantity), 0);
}

// Get cart count
function getCartCount() {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

// Toggle cart sidebar
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Checkout
async function checkout() {
    if (cartItems.length === 0) {
        showNotification('Cart is empty!', 'warning');
        return;
    }
    
    if (!currentUser) {
        showNotification('Please login to checkout', 'warning');
        handleAuth();
        return;
    }
    
    const total = getCartTotal();
    
    if (confirm(`Proceed to payment of ₹${total}?`)) {
        const orderData = {
            restaurantId: cartItems[0].id,
            items: cartItems.map(item => ({ name: item.name, quantity: item.quantity, price: item.priceForTwo })),
            totalAmount: total,
            paymentMethod: 'upi'
        };
        
        const result = await API.orders.create(orderData, currentUser.token);
        
        const order = {
            orderId: result.order?.orderId || 'ORD' + Date.now(),
            restaurantName: cartItems[0].name,
            items: [...cartItems],
            totalAmount: total,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        
        userOrders.unshift(order);
        currentUser.loyaltyPoints = (currentUser.loyaltyPoints || 0) + Math.floor(total / 20);
        saveUser();
        
        cartItems = [];
        updateCartUI();
        toggleCart();
        
        showNotification(`Order placed! Order ID: ${order.orderId}`);
        if (currentPage === 'orders') renderPage();
        renderPage();
    }
}

// Handle authentication
async function handleAuth() {
    if (currentUser) {
        currentUser = null;
        userOrders = [];
        cartItems = [];
        saveUser();
        showNotification('Logged out successfully');
        renderPage();
        return;
    }
    
    const name = prompt('Enter your name:', 'Food Lover');
    const email = prompt('Enter your email:', 'foodie@example.com');
    
    if (name && email) {
        const result = await API.auth.login({ email, password: 'password123' });
        
        currentUser = {
            id: Date.now(),
            name: name,
            email: email,
            loyaltyPoints: 250,
            role: 'customer',
            token: 'mock-token-' + Date.now(),
            orders: []
        };
        saveUser();
        showNotification(`Welcome ${name}! You have 250 loyalty points!`);
        renderPage();
    }
}

// Open review modal
function openReviewModal(order) {
    currentOrderForReview = order;
    document.getElementById('reviewModal').classList.add('active');
}

// Close review modal
function closeReviewModal() {
    document.getElementById('reviewModal').classList.remove('active');
    document.getElementById('reviewTitle').value = '';
    document.getElementById('reviewDescription').value = '';
}

// Submit review
async function submitReview() {
    const rating = document.querySelectorAll('.star.active').length;
    const title = document.getElementById('reviewTitle').value;
    const description = document.getElementById('reviewDescription').value;
    
    if (rating === 0) {
        showNotification('Please select a rating', 'warning');
        return;
    }
    
    if (description.length < 10) {
        showNotification('Please write a longer review', 'warning');
        return;
    }
    
    const result = await API.reviews.submit({
        rating, title, description,
        restaurantId: currentOrderForReview?.restaurantId,
        orderId: currentOrderForReview?.orderId
    }, currentUser?.token);
    
    const pointsEarned = result.pointsEarned || calculatePointsForReview(description, rating);
    
    if (currentUser) {
        currentUser.loyaltyPoints += pointsEarned;
        saveUser();
    }
    
    showNotification(`✨ Review submitted! You earned ${pointsEarned} points!`);
    closeReviewModal();
    
    if (currentPage === 'dashboard') renderPage();
}

// Setup star rating
function setupStarRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.onclick = () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach(s => {
                if (parseInt(s.dataset.rating) <= rating) {
                    s.classList.add('active');
                    s.textContent = '★';
                } else {
                    s.classList.remove('active');
                    s.textContent = '☆';
                }
            });
        };
    });
}

// Page Components
function HomePage() {
    const points = currentUser?.loyaltyPoints || 0;
    const level = getLevel(points);
    
    return `
        <div class="hero">
            <h1>Discover Amazing <span style="color: var(--primary)">Food Experiences</span></h1>
            <p>Order delivery, reserve tables, and discover food events all in one place</p>
            <button class="btn-primary" onclick="navigateTo('restaurants')">Explore Restaurants</button>
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
                        <div class="stat-value">${level}</div>
                        <div class="stat-label">Member Level</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${userOrders.length}</div>
                        <div class="stat-label">Orders Placed</div>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
}

function RestaurantsPage() {
    let filtered = [...restaurants];
    
    const searchTerm = document.getElementById('restaurantSearch')?.value.toLowerCase() || '';
    const cuisineFilter = document.getElementById('cuisineFilter')?.value || '';
    const sortFilter = document.getElementById('sortFilter')?.value || 'rating';
    
    if (searchTerm) {
        filtered = filtered.filter(r => 
            r.name.toLowerCase().includes(searchTerm) || 
            (r.cuisine && r.cuisine.some(c => c.toLowerCase().includes(searchTerm)))
        );
    }
    
    if (cuisineFilter) {
        filtered = filtered.filter(r => r.cuisine && r.cuisine.includes(cuisineFilter));
    }
    
    if (sortFilter === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortFilter === 'distance') {
        filtered.sort((a, b) => a.distance - b.distance);
    }
    
    setTimeout(() => {
        const searchInput = document.getElementById('restaurantSearch');
        if (searchInput) searchInput.oninput = () => renderPage();
        const cuisineSelect = document.getElementById('cuisineFilter');
        if (cuisineSelect) cuisineSelect.onchange = () => renderPage();
        const sortSelect = document.getElementById('sortFilter');
        if (sortSelect) sortSelect.onchange = () => renderPage();
    }, 100);
    
    return `
        <div class="search-section">
            <div class="search-bar">
                <input type="text" class="search-input" id="restaurantSearch" placeholder="Search restaurants, cuisines...">
                <button class="search-btn" onclick="renderPage()">Search</button>
            </div>
            <div class="filters">
                <select class="filter-select" id="cuisineFilter">
                    <option value="">All Cuisines</option>
                    <option value="Indian">Indian</option>
                    <option value="Italian">Italian</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Japanese">Japanese</option>
                    <option value="American">American</option>
                </select>
                <select class="filter-select" id="sortFilter">
                    <option value="rating">Sort by Rating</option>
                    <option value="distance">Sort by Distance</option>
                </select>
            </div>
        </div>
        <div class="restaurant-grid">
            ${filtered.map(restaurant => `
                <div class="restaurant-card">
                    <div class="restaurant-image" style="background-image: url('${restaurant.image}')">
                        <div class="restaurant-status" style="background: ${restaurant.isOpen ? '#2E7D32' : '#F57C00'}">
                            ${restaurant.isOpen ? 'Open Now' : 'Closed'}
                        </div>
                    </div>
                    <div class="restaurant-info">
                        <div class="restaurant-name">${restaurant.name}</div>
                        <div class="restaurant-cuisine">${restaurant.cuisine ? restaurant.cuisine.join(' • ') : ''}</div>
                        <div class="restaurant-meta">
                            <div class="rating">⭐ ${restaurant.rating}</div>
                            <div>📍 ${restaurant.distance} km</div>
                            <div>⏱️ ${restaurant.deliveryTime}</div>
                        </div>
                        <div>💰 ₹${restaurant.priceForTwo} for two</div>
                        <div class="restaurant-actions">
                            <button class="btn-delivery" onclick='addToCart(${JSON.stringify(restaurant)})'>🛵 Delivery</button>
                            <button class="btn-reserve" onclick="showNotification('Table reservation coming soon!')">🍽️ Reserve Table</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function OrdersPage() {
    if (userOrders.length === 0) {
        return `
            <div class="hero">
                <h3>No Orders Yet</h3>
                <p>Start exploring restaurants and place your first order!</p>
                <button class="btn-primary" onclick="navigateTo('restaurants')">Browse Restaurants</button>
            </div>
        `;
    }
    
    return `
        <div class="dashboard">
            <h2>My Orders</h2>
            <div style="margin-top: 2rem;">
                ${userOrders.map(order => `
                    <div class="restaurant-card" style="margin-bottom: 1rem;">
                        <div class="restaurant-info">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div class="restaurant-name">${order.restaurantName}</div>
                                <div class="rating" style="color: ${order.status === 'delivered' ? '#2E7D32' : '#F57C00'}">
                                    ${order.status === 'delivered' ? '✅ Delivered' : '🔄 In Progress'}
                                </div>
                            </div>
                            <div class="restaurant-meta">
                                <div>Order ID: ${order.orderId}</div>
                                <div>Date: ${formatDate(order.createdAt)}</div>
                                <div>Total: ₹${order.totalAmount}</div>
                            </div>
                            ${order.status === 'delivered' ? 
                                `<button class="btn-delivery" onclick='openReviewModal(${JSON.stringify(order)})' style="margin-top: 1rem;">⭐ Leave a Review</button>` :
                                `<button class="btn-delivery" onclick="showNotification('Tracking: ${order.status}')" style="margin-top: 1rem;">Track Order</button>`
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function DashboardPage() {
    if (!currentUser) {
        return `
            <div class="hero">
                <h1>Sign In to View Dashboard</h1>
                <button class="btn-primary" onclick="handleAuth()">Sign In</button>
            </div>
        `;
    }
    
    const points = currentUser.loyaltyPoints;
    const level = getLevel(points);
    const nextLevelPoints = 500 - (points % 500);
    
    return `
        <div class="dashboard">
            <h2>Your Dashboard</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${points}</div>
                    <div class="stat-label">Loyalty Points</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${level}</div>
                    <div class="stat-label">Member Level</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${userOrders.length}</div>
                    <div class="stat-label">Orders Placed</div>
                </div>
            </div>
            ${nextLevelPoints > 0 && nextLevelPoints < 500 ? `
                <div class="stat-card" style="margin-top: 1rem;">
                    <div class="stat-label">⭐ ${nextLevelPoints} points needed for next level</div>
                    <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
                        <div style="width: ${((500 - nextLevelPoints) / 500) * 100}%; height: 100%; background: linear-gradient(90deg, #D32F2F, #FF6F00);"></div>
                    </div>
                </div>
            ` : ''}
            <div style="margin-top: 2rem;">
                <h3>How to Earn More Points?</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div>📝 Write detailed reviews</div>
                        <div class="stat-label">+10 to +30 points</div>
                    </div>
                    <div class="stat-card">
                        <div>⭐ Give 4-5 star ratings</div>
                        <div class="stat-label">+10 points</div>
                    </div>
                    <div class="stat-card">
                        <div>🛒 Place orders</div>
                        <div class="stat-label">5% of order value</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function EventsPage() {
    return `
        <div class="hero">
            <h1>Upcoming Food Events</h1>
            <p>Discover chef tables, tasting menus, and food festivals</p>
        </div>
        <div class="restaurant-grid">
            <div class="restaurant-card">
                <div class="restaurant-info">
                    <div class="restaurant-name">Chef's Table Experience</div>
                    <div class="restaurant-cuisine">Exclusive 7-course tasting menu</div>
                    <div class="restaurant-meta">📅 December 15, 2024 • 7:00 PM</div>
                    <div>🎟️ Limited seats available</div>
                    <button class="btn-delivery" style="margin-top: 1rem;" onclick="showNotification('Booking coming soon!')">Book Now →</button>
                </div>
            </div>
            <div class="restaurant-card">
                <div class="restaurant-info">
                    <div class="restaurant-name">Wine & Dine Festival</div>
                    <div class="restaurant-cuisine">International wine tasting</div>
                    <div class="restaurant-meta">📅 December 20, 2024 • 6:00 PM</div>
                    <div>🎟️ Early bird tickets available</div>
                    <button class="btn-delivery" style="margin-top: 1rem;" onclick="showNotification('Booking coming soon!')">Get Tickets →</button>
                </div>
            </div>
        </div>
    `;
}

// Main render function
function renderPage() {
    const app = document.getElementById('app');
    
    let content = `
        <nav class="navbar">
            <div class="nav-container">
                <div class="logo">
                    <span>🍽️</span>
                    <span class="logo-text">HospitalityHub</span>
                </div>
                <div class="nav-menu">
                    <button class="nav-link ${currentPage === 'home' ? 'active' : ''}" onclick="navigateTo('home')">Home</button>
                    <button class="nav-link ${currentPage === 'restaurants' ? 'active' : ''}" onclick="navigateTo('restaurants')">Restaurants</button>
                    <button class="nav-link ${currentPage === 'orders' ? 'active' : ''}" onclick="navigateTo('orders')">My Orders</button>
                    <button class="nav-link ${currentPage === 'events' ? 'active' : ''}" onclick="navigateTo('events')">Events</button>
                    <button class="nav-link ${currentPage === 'dashboard' ? 'active' : ''}" onclick="navigateTo('dashboard')">Dashboard</button>
                </div>
                <div class="nav-actions">
                    <button class="cart-btn" onclick="toggleCart()">
                        🛒 Cart <span class="cart-count" id="cartCount">${getCartCount()}</span>
                    </button>
                    ${currentUser ? `
                        <div class="points-badge">⭐ ${currentUser.loyaltyPoints} pts</div>
                        <button class="auth-btn" onclick="handleAuth()">👤 ${currentUser.name}</button>
                    ` : `
                        <button class="auth-btn" onclick="handleAuth()">Sign In</button>
                    `}
                </div>
            </div>
        </nav>
        
        <div class="main-content">
            ${currentPage === 'home' ? HomePage() : 
              currentPage === 'restaurants' ? RestaurantsPage() :
              currentPage === 'orders' ? OrdersPage() :
              currentPage === 'events' ? EventsPage() :
              currentPage === 'dashboard' ? DashboardPage() : HomePage()}
        </div>
        
        <div class="cart-sidebar" id="cartSidebar">
            <div class="cart-header">
                <h3>Your Cart</h3>
                <button class="modal-close" onclick="toggleCart()">&times;</button>
            </div>
            <div class="cart-body">
                <div id="cartItems"></div>
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Total</span>
                    <span id="cartTotal">₹0</span>
                </div>
                <button class="checkout-btn" onclick="checkout()">Proceed to Checkout</button>
            </div>
        </div>
        
        <div class="modal" id="reviewModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Write a Review</h3>
                    <button class="modal-close" onclick="closeReviewModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Your Rating</label>
                        <div class="star-rating" id="starRating">
                            <span class="star" data-rating="1">☆</span>
                            <span class="star" data-rating="2">☆</span>
                            <span class="star" data-rating="3">☆</span>
                            <span class="star" data-rating="4">☆</span>
                            <span class="star" data-rating="5">☆</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Review Title</label>
                        <input type="text" class="form-input" id="reviewTitle" placeholder="Summarize your experience">
                    </div>
                    <div class="form-group">
                        <label>Your Review</label>
                        <textarea class="form-textarea" id="reviewDescription" placeholder="Share your experience... (Minimum 50 characters for bonus points!)"></textarea>
                    </div>
                    <button class="btn-primary" onclick="submitReview()">Submit Review & Earn Points</button>
                </div>
            </div>
        </div>
    `;
    
    app.innerHTML = content;
    updateCartUI();
    
    // Setup star rating
    setTimeout(() => {
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.onclick = () => {
                const rating = parseInt(star.dataset.rating);
                stars.forEach(s => {
                    if (parseInt(s.dataset.rating) <= rating) {
                        s.classList.add('active');
                        s.textContent = '★';
                    } else {
                        s.classList.remove('active');
                        s.textContent = '☆';
                    }
                });
            };
        });
    }, 100);
}

// Navigate to page
function navigateTo(page) {
    currentPage = page;
    renderPage();
}

// Make functions global
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.checkout = checkout;
window.handleAuth = handleAuth;
window.navigateTo = navigateTo;
window.openReviewModal = openReviewModal;
window.closeReviewModal = closeReviewModal;
window.submitReview = submitReview;
window.showNotification = showNotification;
window.renderPage = renderPage;
window.setupStarRating = setupStarRating;

// Initialize app
loadUser();
loadRestaurants();
renderPage();