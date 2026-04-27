// Utility Functions
let currentUser = null;
let cartItems = [];
let favorites = [];
let orders = [];
let reservations = [];
let currentPage = 'home';
let reserveSelectedFood = null;
let reserveMembers = 2;

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
    if (currentUser) localStorage.setItem('promax_user', JSON.stringify(currentUser));
}

function loadData() {
    const savedCart = localStorage.getItem('promax_cart');
    const savedFav = localStorage.getItem('promax_favorites');
    const savedOrders = localStorage.getItem('promax_orders');
    const savedRes = localStorage.getItem('promax_reservations');
    const savedUser = localStorage.getItem('promax_user');
    if (savedCart) cartItems = JSON.parse(savedCart);
    if (savedFav) favorites = JSON.parse(savedFav);
    if (savedOrders) orders = JSON.parse(savedOrders);
    if (savedRes) reservations = JSON.parse(savedRes);
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

function addToCart(food) {
    const existing = cartItems.find(i => i.id === food.id);
    if (existing) {
        existing.quantity++;
    } else {
        cartItems.push({ 
            id: food.id, 
            name: food.name, 
            price: food.price, 
            quantity: 1, 
            restaurant: food.restaurant,
            image: food.image 
        });
    }
    saveData();
    updateCartUI();
    showNotification(`${food.name} added to cart!`);
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    saveData();
    updateCartUI();
    showNotification('Item removed from cart');
    if (currentPage === 'cart') {
        renderCartPage();
    }
}

function getCartTotal() { 
    return cartItems.reduce((s, i) => s + (i.price * i.quantity), 0); 
}

function getCartCount() { 
    return cartItems.reduce((s, i) => s + i.quantity, 0); 
}

function toggleFavorite(foodId) {
    if (favorites.includes(foodId)) {
        favorites = favorites.filter(id => id !== foodId);
        showNotification('Removed from wishlist');
    } else {
        favorites.push(foodId);
        showNotification('Added to wishlist!');
    }
    saveData();
    if (currentPage === 'wishlist') renderWishlistPage();
    else if (currentPage === 'home') renderHomePage();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = getCartCount();
    
    const container = document.getElementById('cartItemsList');
    if (container) {
        if (cartItems.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:2rem">Your cart is empty</p>';
        } else {
            container.innerHTML = cartItems.map((item, idx) => `
                <div class="cart-item">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>${item.restaurant}</small><br>
                        <small>Qty: ${item.quantity}</small><br>
                        <strong>${formatPrice(item.price * item.quantity)}</strong>
                    </div>
                    <button onclick="removeFromCart(${idx})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:1.2rem">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
    }
    
    const total = document.getElementById('cartTotalAmount');
    if (total) {
        const subtotal = getCartTotal();
        const deliveryFee = subtotal > 0 ? 40 : 0;
        total.textContent = formatPrice(subtotal + deliveryFee);
    }
}

function toggleCart() { 
    document.getElementById('cartSidebar').classList.toggle('open'); 
}

function checkout() {
    if (cartItems.length === 0) { 
        showNotification('Cart is empty!', 'warning'); 
        return; 
    }
    
    const subtotal = getCartTotal();
    const deliveryFee = 40;
    const total = subtotal + deliveryFee;
    
    // Create order object
    const order = { 
        id: 'ORD' + Date.now(), 
        items: [...cartItems], 
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total, 
        date: new Date().toISOString(), 
        status: 'confirmed' 
    };
    
    // Add to orders array
    orders.unshift(order);
    
    // Add loyalty points (5% of total)
    const pointsEarned = Math.floor(total / 20);
    currentUser.points = (currentUser.points || 0) + pointsEarned;
    
    // Save everything
    saveData();
    
    // Clear cart
    cartItems = [];
    saveData();
    
    // Update UI
    updateCartUI();
    
    // Close cart sidebar if open
    document.getElementById('cartSidebar').classList.remove('open');
    
    // Show success message
    showNotification(`✅ Order placed successfully! Order ID: ${order.id}\nTotal: ${formatPrice(total)}\nEarned ${pointsEarned} points!`);
    
    // Refresh current page if needed
    if (currentPage === 'cart') {
        renderCartPage();
    }
    if (currentPage === 'dashboard') {
        renderDashboardPage();
    }
}

function openReserveModal(food) {
    reserveSelectedFood = food;
    reserveMembers = 2;
    document.getElementById('reserveModal').classList.add('active');
    document.getElementById('reserveMembers').innerText = reserveMembers;
    document.getElementById('reserveFoodName').innerText = food.name;
    document.getElementById('reserveRestaurant').innerText = food.restaurant;
    // Clear previous values
    document.getElementById('reserveDate').value = '';
    document.getElementById('reserveTime').value = '7:00 PM';
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
    
    if (!date) { 
        showNotification('Please select a date', 'warning'); 
        return; 
    }
    if (!time) { 
        showNotification('Please select a time', 'warning'); 
        return; 
    }
    
    const reservation = {
        id: 'RES' + Date.now(),
        food: reserveSelectedFood.name,
        restaurant: reserveSelectedFood.restaurant,
        members: reserveMembers,
        date: date,
        time: time,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    reservations.push(reservation);
    currentUser.points = (currentUser.points || 0) + 20;
    saveData();
    
    // Close modal
    document.getElementById('reserveModal').classList.remove('active');
    
    showNotification(`🎉 Table reserved for ${reserveMembers} people at ${reserveSelectedFood.restaurant} on ${date} at ${time}! +20 points earned!`);
    
    // Refresh pages if needed
    if (currentPage === 'reservations') renderReservationsPage();
    if (currentPage === 'dashboard') renderDashboardPage();
}

function openFoodDetail(food) {
    window.selectedFood = food;
    const modalContent = document.getElementById('foodDetailContent');
    const isGarlicBread = food.name === "Garlic Bread";
    
    modalContent.innerHTML = `
        <div class="food-detail-image" style="background-image:url('${food.image}');height:200px;background-size:cover;background-position:center;border-radius:16px 16px 0 0"></div>
        <div style="padding:1.5rem">
            <h2>${food.name}</h2>
            <div class="rating"><i class="fas fa-star"></i> ${food.rating} ⭐</div>
            <p style="margin:0.5rem 0">${food.description}</p>
            ${isGarlicBread ? `
                <div style="margin:1rem 0;padding:1rem;background:rgba(255,255,255,0.08);border-radius:12px;display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
                    <img src="${food.chefImage}" style="width:60px;height:60px;border-radius:50%;object-fit:cover">
                    <div>
                        <strong>👩‍🍳 Made by Chef Maria</strong><br>
                        <span style="font-size:0.8rem">Our signature garlic bread made with love and secret herbs!</span>
                    </div>
                </div>
            ` : ''}
            <div style="margin:0.5rem 0"><strong>🏪 Restaurant:</strong> ${food.restaurant}</div>
            <div style="margin:0.5rem 0"><strong>⏱️ Delivery Time:</strong> ${food.deliveryTime}</div>
            <div style="margin:0.5rem 0"><strong>🍽️ Category:</strong> ${food.category}</div>
            <div class="price" style="font-size:1.5rem;margin:1rem 0">${formatPrice(food.price)}</div>
            <div class="food-actions" style="margin-top:1rem;display:flex;gap:0.5rem">
                <button class="btn-delivery" onclick="addToCart(window.selectedFood);document.getElementById('foodDetailModal').classList.remove('active')">
                    <i class="fas fa-motorcycle"></i> Order Delivery
                </button>
                <button class="btn-reserve" onclick="openReserveModal(window.selectedFood);document.getElementById('foodDetailModal').classList.remove('active')">
                    <i class="fas fa-calendar"></i> Reserve Table
                </button>
            </div>
        </div>
    `;
    document.getElementById('foodDetailModal').classList.add('active');
}

function handleAuth() {
    if (currentUser && currentUser.name !== 'Food Lover') {
        currentUser = { name: 'Food Lover', email: 'foodie@example.com', points: 250, phone: '', address: '' };
        saveData();
        showNotification('Logged out successfully');
        if (currentPage === 'profile') renderProfilePage();
        if (currentPage === 'dashboard') renderDashboardPage();
        renderNavbar();
        return;
    }
    
    const name = prompt('Enter your name:', 'Foodie');
    const email = prompt('Enter your email:', 'foodie@example.com');
    if (name && email) {
        currentUser = { name, email, points: 250, phone: '', address: '' };
        saveData();
        showNotification(`🎉 Welcome ${name}! You have 250 loyalty points!`);
        if (currentPage === 'profile') renderProfilePage();
        if (currentPage === 'dashboard') renderDashboardPage();
        renderNavbar();
    }
}

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
    renderProfilePage();
    renderNavbar();
}

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleFavorite = toggleFavorite;
window.openReserveModal = openReserveModal;
window.updateReserveMembers = updateReserveMembers;
window.confirmReservation = confirmReservation;
window.openFoodDetail = openFoodDetail;
window.checkout = checkout;
window.handleAuth = handleAuth;
window.updateProfile = updateProfile;
window.toggleCart = toggleCart;