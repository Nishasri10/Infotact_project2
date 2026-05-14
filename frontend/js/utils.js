let currentUser = null;
let cartItems = [];
let favorites = [];
let orders = [];
let reservations = [];
let currentPage = 'home';
let reserveSelectedFood = null;
let reserveMembers = 2;
let selectedEvent = null;
let eventTicketCount = 1;
let bookedEvents = [];

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function formatPrice(price) { return `₹${price}`; }

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function saveData() {
    localStorage.setItem('promax_cart', JSON.stringify(cartItems));
    localStorage.setItem('promax_favorites', JSON.stringify(favorites));
    localStorage.setItem('promax_orders', JSON.stringify(orders));
    localStorage.setItem('promax_reservations', JSON.stringify(reservations));
    localStorage.setItem('promax_booked_events', JSON.stringify(bookedEvents));
    if (currentUser) localStorage.setItem('promax_user', JSON.stringify(currentUser));
}

function loadData() {
    const savedCart = localStorage.getItem('promax_cart');
    const savedFav = localStorage.getItem('promax_favorites');
    const savedOrders = localStorage.getItem('promax_orders');
    const savedRes = localStorage.getItem('promax_reservations');
    const savedEvents = localStorage.getItem('promax_booked_events');
    const savedUser = localStorage.getItem('promax_user');
    if (savedCart) cartItems = JSON.parse(savedCart);
    if (savedFav) favorites = JSON.parse(savedFav);
    if (savedOrders) orders = JSON.parse(savedOrders);
    if (savedRes) reservations = JSON.parse(savedRes);
    if (savedEvents) bookedEvents = JSON.parse(savedEvents);
    if (savedUser) currentUser = JSON.parse(savedUser);
    else currentUser = { name: 'Food Lover', email: 'foodie@example.com', points: 250, phone: '', address: '' };
}

function getLevel(points) {
    if (points >= 5000) return { name: 'Diamond', icon: '💎', nextLevel: 10000 };
    if (points >= 2000) return { name: 'Platinum', icon: '⭐', nextLevel: 5000 };
    if (points >= 1000) return { name: 'Gold', icon: '🏆', nextLevel: 2000 };
    if (points >= 500) return { name: 'Silver', icon: '🥈', nextLevel: 1000 };
    return { name: 'Bronze', icon: '🥉', nextLevel: 500 };
}

function getCartTotal() { return cartItems.reduce((s, i) => s + (i.price * i.quantity), 0); }
function getCartCount() { return cartItems.reduce((s, i) => s + i.quantity, 0); }

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = getCartCount();
    const container = document.getElementById('cartItemsList');
    if (container) {
        if (cartItems.length === 0) container.innerHTML = '<p style="text-align:center;padding:2rem">Your cart is empty</p>';
        else container.innerHTML = cartItems.map((item, idx) => `
            <div class="cart-item"><div><strong>${item.name}</strong><br><small>${item.restaurant}</small><br><small>Qty: ${item.quantity}</small><br><strong>${formatPrice(item.price * item.quantity)}</strong></div>
            <button onclick="removeFromCart(${idx})" style="background:none;border:none;color:var(--danger);cursor:pointer"><i class="fas fa-trash"></i></button></div>
        `).join('');
    }
    const total = document.getElementById('cartTotalAmount');
    if (total) total.textContent = formatPrice(getCartTotal() + (getCartTotal() > 0 ? 40 : 0));
}

function toggleCart() { document.getElementById('cartSidebar').classList.toggle('open'); }

function addToCart(food) {
    const existing = cartItems.find(i => i.id === food.id);
    if (existing) existing.quantity++;
    else cartItems.push({ id: food.id, name: food.name, price: food.price, quantity: 1, restaurant: food.restaurant, image: food.image });
    saveData();
    updateCartUI();
    showNotification(`${food.name} added to cart!`);
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    saveData();
    updateCartUI();
    showNotification('Item removed');
    if (currentPage === 'cart' && typeof renderCartPage === 'function') renderCartPage();
}

function toggleFavorite(foodId) {
    if (favorites.includes(foodId)) favorites = favorites.filter(id => id !== foodId);
    else favorites.push(foodId);
    saveData();
    if (currentPage === 'wishlist' && typeof renderWishlistPage === 'function') renderWishlistPage();
    else if (currentPage === 'home' && typeof renderHomePage === 'function') renderHomePage();
}

function processCheckout() {
    const address = document.getElementById('checkoutAddress')?.value;
    if (!address) { showNotification('Please enter address', 'warning'); return; }
    if (cartItems.length === 0) { showNotification('Cart is empty!', 'warning'); return; }
    const total = getCartTotal() + 40;
    const pointsEarned = Math.floor(total / 20);
    const order = { id: 'ORD' + Date.now(), items: [...cartItems], total: total, address: address, date: new Date().toISOString(), status: 'confirmed' };
    orders.unshift(order);
    currentUser.points = (currentUser.points || 0) + pointsEarned;
    if (address) currentUser.address = address;
    saveData();
    cartItems = [];
    saveData();
    updateCartUI();
    document.getElementById('cartSidebar')?.classList.remove('open');
    showNotification(`✅ Order placed! Total: ${formatPrice(total)}\nEarned ${pointsEarned} points!`);
    if (currentPage === 'cart' && typeof renderCartPage === 'function') renderCartPage();
    if (currentPage === 'dashboard' && typeof renderDashboardPage === 'function') renderDashboardPage();
}

function openReserveModal(food) {
    reserveSelectedFood = food;
    reserveMembers = 2;
    document.getElementById('reserveModal').classList.add('active');
    document.getElementById('reserveMembers').innerText = reserveMembers;
    document.getElementById('reserveFoodName').innerText = food.name;
    document.getElementById('reserveRestaurant').innerText = food.restaurant;
}

function updateReserveMembers(change) {
    const newCount = reserveMembers + change;
    if (newCount >= 1 && newCount <= 10) {
        reserveMembers = newCount;
        document.getElementById('reserveMembers').innerText = reserveMembers;
    }
}

function confirmReservation() {
    const date = document.getElementById('reserveDate').value;
    const time = document.getElementById('reserveTime').value;
    if (!date || !time) { showNotification('Please select date and time', 'warning'); return; }
    const reservation = { id: 'RES' + Date.now(), food: reserveSelectedFood.name, restaurant: reserveSelectedFood.restaurant, members: reserveMembers, date: date, time: time, status: 'confirmed', createdAt: new Date().toISOString() };
    reservations.push(reservation);
    currentUser.points = (currentUser.points || 0) + 20;
    saveData();
    document.getElementById('reserveModal').classList.remove('active');
    showNotification(`🎉 Table reserved for ${reserveMembers} people at ${reserveSelectedFood.restaurant} on ${date} at ${time}! +20 points!`);
    if (currentPage === 'reservations' && typeof renderReservationsPage === 'function') renderReservationsPage();
    if (currentPage === 'dashboard' && typeof renderDashboardPage === 'function') renderDashboardPage();
}

function openFoodDetail(food) {
    window.selectedFood = food;
    const modalContent = document.getElementById('foodDetailContent');
    modalContent.innerHTML = `
        <div class="food-detail-image" style="background-image:url('${food.image}');height:200px;background-size:cover;background-position:center;border-radius:16px 16px 0 0"></div>
        <div style="padding:1.5rem"><h2>${food.name}</h2><div class="rating"><i class="fas fa-star"></i> ${food.rating} ⭐</div>
        <p>${food.description}</p><div><strong>Restaurant:</strong> ${food.restaurant}</div>
        <div><strong>Delivery Time:</strong> ${food.deliveryTime}</div>
        <div class="price" style="font-size:1.5rem;margin:1rem 0">${formatPrice(food.price)}</div>
        <div class="food-actions"><button class="btn-delivery" onclick="addToCart(window.selectedFood);document.getElementById('foodDetailModal').classList.remove('active')">Order Delivery</button>
        <button class="btn-reserve" onclick="openReserveModal(window.selectedFood);document.getElementById('foodDetailModal').classList.remove('active')">Reserve Table</button></div></div>
    `;
    document.getElementById('foodDetailModal').classList.add('active');
}

function handleAuth() {
    if (currentUser && currentUser.name !== 'Food Lover') {
        currentUser = { name: 'Food Lover', email: 'foodie@example.com', points: 250, phone: '', address: '' };
        saveData();
        showNotification('Logged out');
        if (currentPage === 'profile' && typeof renderProfilePage === 'function') renderProfilePage();
        if (typeof renderNavbar === 'function') renderNavbar();
        return;
    }
    const name = prompt('Enter your name:', 'Foodie');
    const email = prompt('Enter your email:', 'foodie@example.com');
    if (name && email) {
        currentUser = { name, email, points: 250, phone: '', address: '' };
        saveData();
        showNotification(`Welcome ${name}! You have 250 points!`);
        if (currentPage === 'profile' && typeof renderProfilePage === 'function') renderProfilePage();
        if (typeof renderNavbar === 'function') renderNavbar();
    }
}

// Add these functions to your existing utils.js

// Update profile function
function updateProfile() {
    const nameField = document.getElementById('profileName');
    const emailField = document.getElementById('profileEmail');
    const phoneField = document.getElementById('profilePhone');
    const addressField = document.getElementById('profileAddress');
    
    if (nameField) currentUser.name = nameField.value;
    if (emailField) currentUser.email = emailField.value;
    if (phoneField) currentUser.phone = phoneField.value;
    if (addressField) currentUser.address = addressField.value;
    
    saveData();
    showNotification('Profile updated successfully!');
    
    // Re-render profile page if currently on it
    if (currentPage === 'profile' && typeof renderProfilePage === 'function') {
        renderProfilePage();
    }
    
    // Update navbar
    if (typeof renderNavbar === 'function') {
        renderNavbar();
    }
}

// Logout user function
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        const defaultUser = { 
            name: 'Food Lover', 
            email: 'foodie@example.com', 
            points: 250, 
            phone: '', 
            address: '' 
        };
        currentUser = defaultUser;
        localStorage.setItem('promax_user', JSON.stringify(defaultUser));
        showNotification('Logged out successfully!');
        
        if (typeof navigateTo === 'function') {
            navigateTo('home');
        }
        if (typeof renderNavbar === 'function') {
            renderNavbar();
        }
    }
}

// Clear all user data
function clearAllUserData() {
    if (confirm('⚠️ WARNING: This will delete all your data including cart, orders, reservations, and bookings. This action cannot be undone. Are you sure?')) {
        localStorage.removeItem('promax_cart');
        localStorage.removeItem('promax_favorites');
        localStorage.removeItem('promax_orders');
        localStorage.removeItem('promax_reservations');
        localStorage.removeItem('promax_booked_events');
        localStorage.removeItem('promax_user');
        localStorage.removeItem('event_reminders');
        
        // Reset global variables
        cartItems = [];
        favorites = [];
        orders = [];
        reservations = [];
        bookedEvents = [];
        currentUser = { name: 'Food Lover', email: 'foodie@example.com', points: 250, phone: '', address: '' };
        
        // Save default user
        localStorage.setItem('promax_user', JSON.stringify(currentUser));
        
        showNotification('All data cleared successfully!');
        
        if (typeof navigateTo === 'function') {
            navigateTo('home');
        }
        if (typeof renderNavbar === 'function') {
            renderNavbar();
        }
    }
}

// Make functions globally available
window.updateProfile = updateProfile;
window.logoutUser = logoutUser;
window.clearAllUserData = clearAllUserData;
function openEventBookingModal(event) {
    selectedEvent = event;
    eventTicketCount = 1;
    document.getElementById('eventBookingModal').classList.add('active');
    document.getElementById('eventTicketCount').innerText = eventTicketCount;
    document.getElementById('eventNameDisplay').innerText = event.name;
    document.getElementById('eventPriceDisplay').innerHTML = `${event.discountedPrice ? `<span style="text-decoration:line-through;color:var(--gray)">${formatPrice(event.price)}</span> ${formatPrice(event.discountedPrice)}` : formatPrice(event.price)} per person`;
    document.getElementById('eventTotalDisplay').innerText = formatPrice(event.discountedPrice || event.price);
}

function updateEventTicketCount(change) {
    const newCount = eventTicketCount + change;
    if (newCount >= 1 && newCount <= selectedEvent.availableSeats) {
        eventTicketCount = newCount;
        document.getElementById('eventTicketCount').innerText = eventTicketCount;
        const total = (selectedEvent.discountedPrice || selectedEvent.price) * eventTicketCount;
        document.getElementById('eventTotalDisplay').innerText = formatPrice(total);
    }
}

function confirmEventBooking() {
    if (!currentUser || currentUser.name === 'Food Lover') {
        showNotification('Please login first!', 'warning');
        document.getElementById('eventBookingModal').classList.remove('active');
        handleAuth();
        return;
    }
    const alreadyBooked = bookedEvents.some(b => b.eventId === selectedEvent.id);
    if (alreadyBooked) { showNotification('Already booked!', 'warning'); document.getElementById('eventBookingModal').classList.remove('active'); return; }
    const totalPrice = (selectedEvent.discountedPrice || selectedEvent.price) * eventTicketCount;
    const pointsEarned = Math.floor(totalPrice / 20);
    const booking = { id: 'EVT' + Date.now(), eventId: selectedEvent.id, eventName: selectedEvent.name, venue: selectedEvent.venue, date: selectedEvent.date, time: selectedEvent.time, tickets: eventTicketCount, totalPrice: totalPrice, bookingDate: new Date().toISOString(), status: 'confirmed' };
    bookedEvents.push(booking);
    saveData();
    selectedEvent.availableSeats -= eventTicketCount;
    currentUser.points = (currentUser.points || 0) + pointsEarned;
    saveData();
    showNotification(`✅ Booked ${eventTicketCount} ticket(s) for ${selectedEvent.name}! Earned ${pointsEarned} points!`);
    document.getElementById('eventBookingModal').classList.remove('active');
    if (currentPage === 'events' && typeof renderEventsPage === 'function') renderEventsPage();
}

function cancelEventBooking(bookingId) {
    if (confirm('Cancel this booking? 50% points refund.')) {
        const bookingIndex = bookedEvents.findIndex(b => b.id === bookingId);
        if (bookingIndex !== -1) {
            const booking = bookedEvents[bookingIndex];
            const refundPoints = Math.floor(booking.totalPrice / 40);
            currentUser.points = (currentUser.points || 0) + refundPoints;
            bookedEvents.splice(bookingIndex, 1);
            saveData();
            showNotification(`Booking cancelled! Refunded ${refundPoints} points.`);
            if (currentPage === 'events' && typeof renderEventsPage === 'function') renderEventsPage();
        }
    }
}
// ============ ADD THESE FUNCTIONS ============

// Enhanced Toast Notification
function showToast(message, type = 'success', duration = 3000) {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.success}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Theme Toggle Function
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLightMode = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = isLightMode ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    showToast(`${isLightMode ? 'Light' : 'Dark'} mode activated`, 'info', 1500);
}

// Load Theme Preference
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Scroll Progress Bar
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Breadcrumb Navigation
function updateBreadcrumb(pageName) {
    let breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) {
        breadcrumb = document.createElement('div');
        breadcrumb.className = 'breadcrumb';
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(breadcrumb, mainContent.firstChild);
        }
    }
    
    breadcrumb.innerHTML = `
        <span class="breadcrumb-item" onclick="navigateTo('home')">Home</span>
        <span class="breadcrumb-separator"><i class="fas fa-chevron-right"></i></span>
        <span class="breadcrumb-item active">${pageName}</span>
    `;
}

// Floating Action Button for Cart
function createFAB() {
    if (document.querySelector('.fab')) return;
    
    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-count">${getCartCount()}</span>
    `;
    fab.onclick = () => navigateTo('cart');
    document.body.appendChild(fab);
    
    // Update FAB count when cart changes
    const originalUpdateCartUI = window.updateCartUI;
    window.updateCartUI = function() {
        if (originalUpdateCartUI) originalUpdateCartUI();
        const fabCount = document.querySelector('.fab .cart-count');
        if (fabCount) fabCount.textContent = getCartCount();
    };
}

// Skeleton Loader
function showSkeleton(containerId, type = 'food') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let skeletonHtml = '';
    if (type === 'food') {
        skeletonHtml = `
            <div class="skeleton skeleton-image" style="height: 200px; border-radius: 12px;"></div>
            <div style="padding: 1rem;">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text" style="width: 80%;"></div>
                <div class="skeleton skeleton-text" style="width: 60%;"></div>
            </div>
        `;
    } else if (type === 'grid') {
        skeletonHtml = Array(6).fill(`
            <div class="food-card">
                <div class="skeleton skeleton-image" style="height: 200px;"></div>
                <div style="padding: 1rem;">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text" style="width: 80%;"></div>
                    <div class="skeleton skeleton-text" style="width: 60%;"></div>
                </div>
            </div>
        `).join('');
    }
    
    container.innerHTML = skeletonHtml;
}

// Confetti Effect
function showConfetti() {
    const colors = ['#FF4757', '#FFA502', '#2ED573', '#1E90FF', '#FFD700'];
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '10000';
        confetti.style.animation = `confetti ${2 + Math.random() * 2}s linear forwards`;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}

// Initialize all UI enhancements
function initUIEnhancements() {
    initScrollProgress();
    createFAB();
    loadTheme();
    
    // Add theme toggle button if not exists
    if (!document.querySelector('.theme-toggle')) {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.onclick = toggleTheme;
        document.body.appendChild(themeToggle);
    }
}

// Override showNotification to use toast
const originalShowNotification = window.showNotification;
window.showNotification = function(message, type = 'success') {
    showToast(message, type);
};

// Add confetti on order success
const originalProcessCheckout = window.processCheckout;
window.processCheckout = function() {
    if (originalProcessCheckout) originalProcessCheckout();
    showConfetti();
};
// Add these functions to your utils.js

// ============ LOADING INDICATORS ============
function showLoading(containerId, type = 'spinner') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (type === 'spinner') {
        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; padding: 3rem;">
                <div class="loading-spinner"></div>
                <span style="margin-left: 1rem; color: var(--text-muted);">Loading...</span>
            </div>
        `;
    } else if (type === 'skeleton') {
        container.innerHTML = `
            <div class="skeleton-grid">
                ${Array(6).fill(`
                    <div class="skeleton-card">
                        <div class="skeleton skeleton-image"></div>
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text" style="width: 60%;"></div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        // Clear loading content
    }
}

// ============ ERROR HANDLING ============
function showError(containerId, errorMessage, retryCallback = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-container" style="text-align: center; padding: 3rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--error); margin-bottom: 1rem;"></i>
            <h3>Oops! Something went wrong</h3>
            <p style="color: var(--text-muted); margin: 0.5rem 0;">${errorMessage}</p>
            ${retryCallback ? `<button class="btn-primary" onclick="(${retryCallback})()" style="margin-top: 1rem;">Try Again</button>` : ''}
        </div>
    `;
}

// ============ FORM VALIDATION ============
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
}

function validateName(name) {
    return name && name.trim().length >= 2;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
        field.style.borderColor = 'var(--error)';
        
        let errorDiv = field.parentElement.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            field.parentElement.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.style.color = 'var(--error)';
        errorDiv.style.fontSize = '0.7rem';
        errorDiv.style.marginTop = '0.25rem';
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('error');
        field.style.borderColor = 'var(--border)';
        
        const errorDiv = field.parentElement.querySelector('.field-error');
        if (errorDiv) errorDiv.remove();
    }
}

// ============ DEBOUNCE FUNCTION (for search) ============
function debounce(func, delay) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, delay);
    };
}

// ============ INFINITE SCROLL ============
function setupInfiniteScroll(loadMoreCallback) {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadMoreCallback();
        }
    }, { threshold: 0.1 });
    
    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.style.height = '10px';
    document.body.appendChild(sentinel);
    observer.observe(sentinel);
    
    return observer;
}

// ============ PUSH NOTIFICATIONS ============
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted');
            return true;
        }
    }
    return false;
}

function sendNotification(title, body, icon = null) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon });
    }
}

// ============ OFFLINE DETECTION ============
function initOfflineDetection() {
    window.addEventListener('online', () => {
        showToast('You are back online!', 'success');
        location.reload();
    });
    
    window.addEventListener('offline', () => {
        showToast('You are offline. Some features may be limited.', 'warning');
    });
}

// ============ IMAGE LAZY LOADING ============
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ============ SCROLL TO TOP BUTTON ============
function createScrollToTopButton() {
    const button = document.createElement('button');
    button.className = 'scroll-top-btn';
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: var(--primary);
        color: white;
        border: none;
        cursor: pointer;
        display: none;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    button.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
        } else {
            button.style.display = 'none';
        }
    });
}

// ============ COOKIE CONSENT ============
function showCookieConsent() {
    if (localStorage.getItem('cookieConsent')) return;
    
    const consent = document.createElement('div');
    consent.className = 'cookie-consent';
    consent.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--dark-bg);
        padding: 1rem;
        text-align: center;
        border-top: 1px solid var(--border);
        z-index: 1000;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    `;
    consent.innerHTML = `
        <p style="margin: 0; font-size: 0.85rem;">We use cookies to enhance your experience. By continuing, you agree to our cookie policy.</p>
        <div>
            <button class="btn-primary" onclick="acceptCookies()" style="padding: 0.3rem 1rem;">Accept</button>
            <button class="btn-view" onclick="rejectCookies()" style="padding: 0.3rem 1rem;">Decline</button>
        </div>
    `;
    document.body.appendChild(consent);
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.querySelector('.cookie-consent')?.remove();
    showToast('Cookies accepted!', 'success');
}

function rejectCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    document.querySelector('.cookie-consent')?.remove();
}

// ============ EXPORT FUNCTION ============
function initFrontendEnhancements() {
    initOfflineDetection();
    createScrollToTopButton();
    requestNotificationPermission();
    
    // Show cookie consent after 2 seconds
    setTimeout(showCookieConsent, 2000);
}

// Make functions global
window.showLoading = showLoading;
window.showError = showError;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.validateName = validateName;
window.showFieldError = showFieldError;
window.clearFieldError = clearFieldError;
window.debounce = debounce;
window.sendNotification = sendNotification;
window.initFrontendEnhancements = initFrontendEnhancements;
window.acceptCookies = acceptCookies;
window.rejectCookies = rejectCookies;

// Call this when app initializes
window.initUIEnhancements = initUIEnhancements;

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleFavorite = toggleFavorite;
window.openReserveModal = openReserveModal;
window.updateReserveMembers = updateReserveMembers;
window.confirmReservation = confirmReservation;
window.openFoodDetail = openFoodDetail;
window.processCheckout = processCheckout;
window.toggleCart = toggleCart;
window.handleAuth = handleAuth;
window.updateProfile = updateProfile;
window.openEventBookingModal = openEventBookingModal;
window.updateEventTicketCount = updateEventTicketCount;
window.confirmEventBooking = confirmEventBooking;
window.cancelEventBooking = cancelEventBooking;