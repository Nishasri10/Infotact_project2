function renderCartPage() {
    const container = document.getElementById('pageContent');
    const total = getCartTotal();
    
    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h2>Your Cart is Empty</h2>
                <p>Add some delicious food items to your cart!</p>
                <button class="btn-primary" onclick="navigateTo('home')">Browse Food Items</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="section-title"><i class="fas fa-shopping-cart"></i> Your Cart (${getCartCount()} items)</div>
        <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:2rem">
            <div class="dashboard-container">
                ${cartItems.map((item, idx) => `
                    <div class="order-item" style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--border)">
                        <div>
                            <strong>${item.name}</strong><br>
                            <small>${item.restaurant}</small><br>
                            <small>Quantity: ${item.quantity}</small>
                        </div>
                        <div>
                            <div class="price">${formatPrice(item.price * item.quantity)}</div>
                            <button class="btn-view" style="background:var(--danger);margin-top:0.5rem" onclick="removeFromCart(${idx})">Remove</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="dashboard-container">
                <h3>Order Summary</h3>
                <div style="padding:1rem 0;border-bottom:1px solid var(--border)">
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
                        <span>Subtotal:</span><span>${formatPrice(total)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
                        <span>Delivery Fee:</span><span>₹40</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:1.2rem;margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid var(--border)">
                        <strong>Total:</strong><strong style="color:var(--primary)">${formatPrice(total + 40)}</strong>
                    </div>
                </div>
                <button class="btn-primary" style="width:100%;margin-top:1rem" onclick="checkout()">Proceed to Checkout</button>
            </div>
        </div>
    `;
}