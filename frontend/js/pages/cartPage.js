function renderCartPage() {
    const container = document.getElementById('pageContent');
    const subtotal = getCartTotal();
    const deliveryFee = subtotal > 0 ? 40 : 0;
    const total = subtotal + deliveryFee;
    
    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart" style="font-size:4rem;color:var(--gray);margin-bottom:1rem"></i>
                <h2>Your Cart is Empty</h2>
                <p>Add some delicious food items to your cart!</p>
                <button class="btn-primary" onclick="navigateTo('home')">Browse Food Items</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="section-title">
            <i class="fas fa-shopping-cart"></i> Your Cart 
            <span style="font-size:0.9rem;background:var(--primary);padding:0.2rem 0.8rem;border-radius:20px;margin-left:0.5rem">${getCartCount()} items</span>
        </div>
        
        <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:2rem">
            <div class="dashboard-container">
                <h3 style="margin-bottom:1rem">Order Items</h3>
                ${cartItems.map((item, idx) => `
                    <div class="order-item" style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--border)">
                        <div style="flex:2">
                            <strong>${item.name}</strong><br>
                            <small style="color:var(--gray)">${item.restaurant}</small><br>
                            <small>Quantity: ${item.quantity}</small>
                        </div>
                        <div style="text-align:right">
                            <div class="price" style="font-size:1.1rem">${formatPrice(item.price * item.quantity)}</div>
                            <button class="btn-view" style="background:var(--danger);padding:0.3rem 0.8rem;margin-top:0.5rem;font-size:0.7rem" onclick="removeFromCart(${idx})">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="dashboard-container">
                <h3 style="margin-bottom:1rem">Order Summary</h3>
                <div style="padding:1rem 0">
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.8rem">
                        <span>Subtotal:</span>
                        <span>${formatPrice(subtotal)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.8rem">
                        <span>Delivery Fee:</span>
                        <span>${formatPrice(deliveryFee)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.8rem;padding-top:0.8rem;border-top:1px solid var(--border)">
                        <strong style="font-size:1.2rem">Total:</strong>
                        <strong style="font-size:1.2rem;color:var(--primary)">${formatPrice(total)}</strong>
                    </div>
                    <div style="margin-top:0.5rem;font-size:0.75rem;color:var(--gray)">
                        <i class="fas fa-star"></i> You'll earn ${Math.floor(total / 20)} loyalty points on this order!
                    </div>
                </div>
                
                <div class="form-group" style="margin:1rem 0">
                    <label>Delivery Address</label>
                    <textarea id="checkoutAddress" class="form-input" rows="2" placeholder="Enter your delivery address">${currentUser.address || ''}</textarea>
                </div>
                
                <div class="form-group" style="margin:1rem 0">
                    <label>Payment Method</label>
                    <select id="paymentMethod" class="form-input">
                        <option value="online">💳 Credit/Debit Card</option>
                        <option value="upi">📱 UPI (Google Pay/PhonePe)</option>
                        <option value="cod">💵 Cash on Delivery</option>
                    </select>
                </div>
                
                <button class="btn-primary" style="width:100%;margin-top:1rem" onclick="processCheckout()">
                    <i class="fas fa-check-circle"></i> Place Order
                </button>
            </div>
        </div>
    `;
}

// Add this function for checkout processing
function processCheckout() {
    const address = document.getElementById('checkoutAddress')?.value;
    const paymentMethod = document.getElementById('paymentMethod')?.value;
    
    if (!address || address.trim() === '') {
        showNotification('Please enter delivery address', 'warning');
        return;
    }
    
    if (cartItems.length === 0) {
        showNotification('Cart is empty!', 'warning');
        return;
    }
    
    const subtotal = getCartTotal();
    const deliveryFee = 40;
    const total = subtotal + deliveryFee;
    const pointsEarned = Math.floor(total / 20);
    
    // Create order
    const order = {
        id: 'ORD' + Date.now(),
        items: [...cartItems],
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        address: address,
        paymentMethod: paymentMethod,
        date: new Date().toISOString(),
        status: 'confirmed'
    };
    
    // Save order
    orders.unshift(order);
    
    // Update user points
    currentUser.points = (currentUser.points || 0) + pointsEarned;
    if (address) currentUser.address = address;
    
    // Save all data
    saveData();
    
    // Clear cart
    cartItems = [];
    saveData();
    
    // Update UI
    updateCartUI();
    
    // Show success message
    showNotification(`✅ Order placed successfully!\nOrder ID: ${order.id}\nTotal: ${formatPrice(total)}\nEarned ${pointsEarned} points!`);
    
    // Close cart sidebar
    document.getElementById('cartSidebar')?.classList.remove('open');
    
    // Navigate to orders page or dashboard
    setTimeout(() => {
        if (confirm('Order placed successfully! View your order history?')) {
            navigateTo('dashboard');
        } else {
            navigateTo('home');
        }
    }, 500);
}

// Make processCheckout global
window.processCheckout = processCheckout;