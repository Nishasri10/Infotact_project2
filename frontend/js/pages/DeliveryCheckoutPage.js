let checkoutCart = [], selectedPayment = 'online';

function loadCheckout() {
    checkoutCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (checkoutCart.length === 0) { window.navigateTo('restaurants'); return; }
    renderCheckout();
}

function placeOrder() {
    const address = document.getElementById('deliveryAddress').value;
    if (!address) { showNotification('Enter address', 'warning'); return; }
    const total = checkoutCart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const order = { id: 'ORD' + Date.now(), restaurantName: checkoutCart[0].restaurantName || 'Restaurant', items: checkoutCart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })), total: total, address, payment: selectedPayment, date: new Date().toISOString(), status: 'confirmed' };
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    let user = JSON.parse(localStorage.getItem('user')) || { loyaltyPoints: 100 };
    user.loyaltyPoints += Math.floor(total / 20);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('cart', '[]');
    showNotification(`Order placed! ID: ${order.id}`);
    setTimeout(() => window.navigateTo('orders'), 1500);
}

function renderCheckout() {
    const total = checkoutCart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const container = document.getElementById('checkoutContent');
    if (!container) return;
    container.innerHTML = `
        <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:2rem"><div><h2>Order Summary</h2>${checkoutCart.map(i => `<div class="cart-item"><div><strong>${i.name}</strong><br>Quantity: ${i.quantity}<br>${formatPrice(i.price * i.quantity)}</div></div>`).join('')}<div style="padding:1rem;border-top:2px solid var(--border)"><div>Subtotal: ${formatPrice(total)}</div><div>Delivery: ₹40</div><div style="font-size:1.2rem"><strong>Total: ${formatPrice(total + 40)}</strong></div></div></div>
        <div><h2>Payment & Delivery</h2><textarea id="deliveryAddress" class="form-textarea" rows="3" placeholder="Enter delivery address"></textarea>
        <div class="payment-option selected" onclick="selectedPayment='online';document.querySelectorAll('.payment-option').forEach(o=>o.classList.remove('selected'));this.classList.add('selected')"><i class="fas fa-credit-card"></i> Credit/Debit Card</div>
        <div class="payment-option" onclick="selectedPayment='upi';document.querySelectorAll('.payment-option').forEach(o=>o.classList.remove('selected'));this.classList.add('selected')"><i class="fas fa-mobile-alt"></i> UPI</div>
        <div class="payment-option" onclick="selectedPayment='cod';document.querySelectorAll('.payment-option').forEach(o=>o.classList.remove('selected'));this.classList.add('selected')"><i class="fas fa-money-bill"></i> Cash on Delivery</div>
        <button class="btn-primary" style="width:100%;margin-top:1rem" onclick="placeOrder()">Place Order</button></div></div>
    `;
}

function DeliveryCheckoutPage() { setTimeout(() => loadCheckout(), 100); return `<div id="checkoutContent"><div class="loading">Loading...</div></div>`; }