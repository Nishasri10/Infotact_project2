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
    localStorage.setItem('cart', JSON.stringify(cartItems));
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('reservations', JSON.stringify(reservations));
    if (currentUser) localStorage.setItem('user', JSON.stringify(currentUser));
}

function loadData() {
    const savedCart = localStorage.getItem('cart');
    const savedFav = localStorage.getItem('favorites');
    const savedOrders = localStorage.getItem('orders');
    const savedRes = localStorage.getItem('reservations');
    const savedUser = localStorage.getItem('user');
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
    if (existing) existing.quantity++;
    else cartItems.push({ ...food, quantity: 1 });
    saveData();
    updateCartUI();
    showNotification(`${food.name} added to cart!`);
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    saveData();
    updateCartUI();
    showNotification('Item removed');
}

function getCartTotal() { return cartItems.reduce((s, i) => s + (i.price * i.quantity), 0); }
function getCartCount() { return cartItems.reduce((s, i) => s + i.quantity, 0); }

function toggleFavorite(foodId) {
    if (favorites.includes(foodId)) favorites = favorites.filter(id => id !== foodId);
    else favorites.push(foodId);
    saveData();
    if (currentPage === 'wishlist') renderWishlistPage();
    else if (currentPage === 'home') renderHomePage();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = getCartCount();
    const container = document.getElementById('cartItemsList');
    if (container) {
        if (cartItems.length === 0) container.innerHTML = '<p style="text-align:center;padding:2rem">Cart is empty</p>';
        else container.innerHTML = cartItems.map((item, idx) => `
            <div class="cart-item">
                <div><strong>${item.name}</strong><br><small>Qty: ${item.quantity}</small><br>${formatPrice(item.price * item.quantity)}</div>
                <button onclick="removeFromCart(${idx})" style="background:none;border:none;color:var(--danger);cursor:pointer"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
    }
    const total = document.getElementById('cartTotalAmount');
    if (total) total.textContent = formatPrice(getCartTotal() + 40);
}

function toggleCart() { document.getElementById('cartSidebar').classList.toggle('open'); }

function checkout() {
    if (cartItems.length === 0) { showNotification('Cart is empty!', 'warning'); return; }
    const total = getCartTotal() + 40;
    const order = { id: 'ORD' + Date.now(), items: [...cartItems], total: total, date: new Date().toISOString(), status: 'confirmed' };
    orders.unshift(order);
    currentUser.points += Math.floor(total / 20);
    saveData();
    cartItems = [];
    updateCartUI();
    toggleCart();
    showNotification(`Order placed! Total: ${formatPrice(total)}`);
    if (currentPage === 'dashboard') renderDashboardPage();
    if (currentPage === 'cart') renderCartPage();
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
    const reservation = {
        id: 'RES' + Date.now(),
        food: reserveSelectedFood.name,
        restaurant: reserveSelectedFood.restaurant,
        members: reserveMembers,
        date: date,
        time: time,
        status: 'confirmed'
    };
    reservations.push(reservation);
    currentUser.points += 20;
    saveData();
    document.getElementById('reserveModal').classList.remove('active');
    showNotification(`Table reserved for ${reserveMembers} people at ${reserveSelectedFood.restaurant}!`);
    if (currentPage === 'reservations') renderReservationsPage();
    if (currentPage === 'dashboard') renderDashboardPage();
}

function openFoodDetail(food) {
    const modalContent = document.getElementById('foodDetailContent');
    const isGarlicBread = food.name === "Garlic Bread";
    modalContent.innerHTML = `
        <div class="food-detail-image" style="background-image:url('${food.image}');height:200px;background-size:cover;background-position:center"></div>
        <div style="padding:1rem">
            <h2>${food.name}</h2>
            <div class="rating"><i class="fas fa-star"></i> ${food.rating}</div>
            <p>${food.description}</p>
            ${isGarlicBread ? `<div style="margin:1rem 0;padding:1rem;background:rgba(255,255,255,0.05);border-radius:12px;display:flex;align-items:center;gap:1rem"><img src="${food.chefImage}" style="width:60px;height:60px;border-radius:50%;object-fit:cover"><div><strong>👩‍🍳 Made by Chef Maria</strong><br>Our signature garlic bread made with love!</div></div>` : ''}
            <p><strong>Restaurant:</strong> ${food.restaurant}</p>
            <p><strong>Delivery Time:</strong> ${food.deliveryTime}</p>
            <p><strong>Category:</strong> ${food.category}</p>
            <p class="price" style="font-size:1.3rem">${formatPrice(food.price)}</p>
            <div class="food-actions" style="margin-top:1rem">
                <button class="btn-delivery" onclick="addToCart(selectedFood);document.getElementById('foodDetailModal').classList.remove('active')"><i class="fas fa-motorcycle"></i> Order Delivery</button>
                <button class="btn-reserve" onclick="openReserveModal(selectedFood);document.getElementById('foodDetailModal').classList.remove('active')"><i class="fas fa-calendar"></i> Reserve Table</button>
            </div>
        </div>
    `;
    selectedFood = food;
    document.getElementById('foodDetailModal').classList.add('active');
}

function handleAuth() {
    if (currentUser && currentUser.name !== 'Food Lover') {
        currentUser = { name: 'Food Lover', email: 'foodie@example.com', points: 250, phone: '', address: '' };
        saveData();
        showNotification('Logged out');
        if (currentPage === 'profile') renderProfilePage();
        else if (currentPage === 'dashboard') renderDashboardPage();
        renderNavbar();
        return;
    }
    const name = prompt('Enter your name:', 'Foodie');
    const email = prompt('Enter your email:', 'foodie@example.com');
    if (name && email) {
        currentUser = { name, email, points: 250, phone: '', address: '' };
        saveData();
        showNotification(`Welcome ${name}! You have 250 loyalty points!`);
        if (currentPage === 'profile') renderProfilePage();
        renderNavbar();
    }
}

function updateProfile() {
    currentUser.name = document.getElementById('profileName').value;
    currentUser.email = document.getElementById('profileEmail').value;
    currentUser.phone = document.getElementById('profilePhone').value;
    currentUser.address = document.getElementById('profileAddress').value;
    saveData();
    showNotification('Profile updated!');
    renderProfilePage();
}