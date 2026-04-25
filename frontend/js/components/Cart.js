// Cart Component
let cartItems = [];

function addToCart(restaurant) {
    const existing = cartItems.find(item => item.id === restaurant.id);
    if (existing) {
        existing.quantity++;
    } else {
        cartItems.push({ ...restaurant, quantity: 1 });
    }
    updateCartUI();
    showNotification(`Added ${restaurant.name} to cart`);
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    updateCartUI();
    showNotification('Item removed from cart');
}

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
                    <button onclick="removeFromCart(${index})" style="background: var(--error); border: none; color: white; padding: 0.25rem 0.5rem; border-radius: 5px; cursor: pointer;">Remove</button>
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

function getCartTotal() {
    return cartItems.reduce((sum, item) => sum + (item.priceForTwo * item.quantity), 0);
}

function getCartCount() {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

function CartSidebar() {
    return `
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
                <button class="checkout-btn" onclick="window.checkout()">Proceed to Checkout</button>
            </div>
        </div>
    `;
}