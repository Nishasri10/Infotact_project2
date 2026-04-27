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

function updateProfile() {
    currentUser.name = document.getElementById('profileName').value;
    currentUser.email = document.getElementById('profileEmail').value;
    currentUser.phone = document.getElementById('profilePhone').value;
    currentUser.address = document.getElementById('profileAddress').value;
    saveData();
    showNotification('Profile updated!');
    if (typeof renderProfilePage === 'function') renderProfilePage();
    if (typeof renderNavbar === 'function') renderNavbar();
}

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