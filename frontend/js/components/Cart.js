let cartItems = [];

function loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) cartItems = JSON.parse(saved);
    updateCartUI();
}

function saveCart() { localStorage.setItem('cart', JSON.stringify(cartItems)); }

function addToCart(item) {
    const existing = cartItems.find(i => i.id === item.id);
    if (existing) existing.quantity++;
    else cartItems.push({ ...item, quantity: 1, id: Date.now() });
    saveCart();
    updateCartUI();
    showNotification(`${item.name} added to cart!`);
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    saveCart();
    updateCartUI();
    showNotification('Item removed from cart');
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = cartItems.reduce((s, i) => s + i.quantity, 0);
    
    const container = document.getElementById('cartItems');
    if (container) {
        if (cartItems.length === 0) container.innerHTML = '<p style="text-align: center; padding: 2rem;">Your cart is empty</p>';
        else container.innerHTML = cartItems.map((item, idx) => `
            <div class="cart-item">
                <div><strong>${item.name}</strong><br><small>Quantity: ${item.quantity}</small><br><small>${formatPrice(item.price * item.quantity)}</small></div>
                <button onclick="removeFromCart(${idx})" style="background: none; border: none; color: var(--error); font-size: 1.2rem; cursor: pointer;"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
    }
    
    const total = document.getElementById('cartTotal');
    if (total) total.innerHTML = `<strong>Total:</strong> ${formatPrice(cartItems.reduce((s, i) => s + (i.price * i.quantity), 0))}`;
}

function getCartTotal() { return cartItems.reduce((s, i) => s + (i.price * i.quantity), 0); }
function getCartCount() { return cartItems.reduce((s, i) => s + i.quantity, 0); }
function toggleCart() { document.getElementById('cartSidebar').classList.toggle('open'); }

function CartSidebar() {
    return `
        <div class="cart-sidebar" id="cartSidebar">
            <div class="cart-header"><h3><i class="fas fa-shopping-cart"></i> Your Cart</h3><button class="modal-close" onclick="toggleCart()">&times;</button></div>
            <div class="cart-body"><div id="cartItems"></div></div>
            <div class="cart-footer">
                <div class="cart-total" id="cartTotal"></div>
                <button class="checkout-btn" onclick="window.proceedToCheckout()"><i class="fas fa-credit-card"></i> Proceed to Checkout</button>
            </div>
        </div>
    `;
}