// Global variables for coupon
let appliedDiscount = 0;
let appliedCoupon = '';
let selectedPayment = 'online';

// Function to update item quantity
function updateItemQuantity(index, change) {
    if (cartItems[index]) {
        const newQuantity = cartItems[index].quantity + change;
        if (newQuantity >= 1 && newQuantity <= 10) {
            cartItems[index].quantity = newQuantity;
            saveData();
            updateCartUI();
            renderCartPage();
        } else if (newQuantity < 1) {
            removeFromCart(index);
        } else {
            showNotification('Maximum 10 items per dish!', 'warning');
        }
    }
}

// Function to select payment method
function selectPaymentMethod(method) {
    selectedPayment = method;
    // Update radio button
    const radio = document.querySelector(`input[name="payment"][value="${method}"]`);
    if (radio) radio.checked = true;
    
    // Update visual selection
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    if (method === 'online') document.getElementById('paymentOnline')?.classList.add('selected');
    if (method === 'upi') document.getElementById('paymentUpi')?.classList.add('selected');
    if (method === 'cod') document.getElementById('paymentCod')?.classList.add('selected');
}

// Function to apply coupon
function applyCoupon() {
    const couponCode = document.getElementById('couponCode')?.value.toUpperCase().trim();
    if (!couponCode) {
        showNotification('Please enter a coupon code', 'warning');
        return;
    }
    
    const subtotal = getCartTotal();
    
    if (couponCode === 'WELCOME10') {
        appliedDiscount = Math.floor(subtotal * 0.1);
        appliedCoupon = 'WELCOME10';
        showNotification(`🎉 Coupon applied! You saved ${formatPrice(appliedDiscount)}`, 'success');
        renderCartPage();
    } else if (couponCode === 'SAVE20') {
        appliedDiscount = 20;
        appliedCoupon = 'SAVE20';
        showNotification(`🎉 Coupon applied! You saved ${formatPrice(appliedDiscount)}`, 'success');
        renderCartPage();
    } else {
        showNotification('Invalid coupon code', 'warning');
    }
}

// Function to show field-specific error
function showFieldError(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.border = '2px solid var(--danger)';
        
        // Remove existing error message
        const existingError = field.parentElement?.querySelector('.field-error');
        if (existingError) existingError.remove();
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = 'var(--danger)';
        errorDiv.style.fontSize = '0.7rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
        field.parentElement?.appendChild(errorDiv);
        
        // Remove error on input
        field.addEventListener('input', () => {
            field.style.border = '1px solid var(--border)';
            const err = field.parentElement?.querySelector('.field-error');
            if (err) err.remove();
        }, { once: true });
    }
}

// Function to show payment error
function showPaymentError(errorMessage) {
    const paymentContainer = document.querySelector('.payment-options-container') || document.querySelector('.payment-option')?.parentElement;
    if (paymentContainer) {
        const existingError = paymentContainer.querySelector('.field-error');
        if (existingError) existingError.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = 'var(--danger)';
        errorDiv.style.fontSize = '0.7rem';
        errorDiv.style.marginTop = '0.5rem';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
        paymentContainer.appendChild(errorDiv);
    }
}

// Function to clear validation errors
function clearValidationErrors() {
    const fields = ['checkoutAddress', 'checkoutPhone'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.border = '1px solid var(--border)';
            const err = field.parentElement?.querySelector('.field-error');
            if (err) err.remove();
        }
    });
    
    const paymentContainer = document.querySelector('.payment-options-container') || document.querySelector('.payment-option')?.parentElement;
    if (paymentContainer) {
        const err = paymentContainer.querySelector('.field-error');
        if (err) err.remove();
    }
}

// Function to validate and place order
function validateAndPlaceOrder() {
    clearValidationErrors();
    
    let isValid = true;
    
    // Validate Delivery Address
    const address = document.getElementById('checkoutAddress')?.value;
    if (!address || address.trim() === '') {
        showFieldError('checkoutAddress', 'Please enter your delivery address');
        isValid = false;
    } else if (address.trim().length < 10) {
        showFieldError('checkoutAddress', 'Please enter a complete address (minimum 10 characters)');
        isValid = false;
    }
    
    // Validate Phone Number
    const phone = document.getElementById('checkoutPhone')?.value;
    if (!phone || phone.trim() === '') {
        showFieldError('checkoutPhone', 'Please enter your phone number');
        isValid = false;
    } else if (!/^[0-9]{10}$/.test(phone)) {
        showFieldError('checkoutPhone', 'Please enter a valid 10-digit mobile number');
        isValid = false;
    }
    
    // Validate Payment Method
    const selectedPaymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    if (!selectedPaymentMethod) {
        showPaymentError('Please select a payment method');
        isValid = false;
    }
    
    if (!isValid) {
        showNotification('Please fill all required fields correctly', 'warning');
        return;
    }
    
    // Proceed with checkout
    processCheckoutWithValidation();
}

// Process checkout with validation
function processCheckoutWithValidation() {
    const address = document.getElementById('checkoutAddress')?.value;
    const phone = document.getElementById('checkoutPhone')?.value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    const orderNotes = document.getElementById('orderNotes')?.value;
    
    if (cartItems.length === 0) {
        showNotification('Cart is empty!', 'warning');
        return;
    }
    
    // Save phone to user profile
    currentUser.phone = phone;
    if (address) currentUser.address = address;
    
    const subtotal = getCartTotal();
    const deliveryFee = 40;
    const platformFee = 10;
    const gst = Math.floor((subtotal + deliveryFee) * 0.05);
    let total = subtotal + deliveryFee + platformFee + gst;
    
    if (appliedDiscount > 0) {
        total = total - appliedDiscount;
    }
    
    const pointsEarned = Math.floor(total / 20);
    
    // Create order
    const order = {
        id: 'ORD' + Date.now(),
        items: [...cartItems],
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        platformFee: platformFee,
        gst: gst,
        discount: appliedDiscount,
        coupon: appliedCoupon,
        total: total,
        address: address,
        phone: phone,
        paymentMethod: paymentMethod,
        notes: orderNotes,
        date: new Date().toISOString(),
        status: 'confirmed'
    };
    
    // Save order
    orders.unshift(order);
    currentUser.points = (currentUser.points || 0) + pointsEarned;
    saveData();
    
    // Clear cart and coupon
    cartItems = [];
    appliedDiscount = 0;
    appliedCoupon = '';
    saveData();
    updateCartUI();
    
    // Close cart sidebar
    document.getElementById('cartSidebar')?.classList.remove('open');
    
    showNotification(`✅ Order placed successfully!\nOrder ID: ${order.id}\nTotal: ${formatPrice(total)}\nEarned ${pointsEarned} points!`);
    
    setTimeout(() => {
        if (confirm('Order placed successfully! View your order history?')) {
            navigateTo('orders');
        } else {
            navigateTo('home');
        }
    }, 500);
}

// Main render function
function renderCartPage() {
    const container = document.getElementById('pageContent');
    const subtotal = getCartTotal();
    const deliveryFee = subtotal > 0 ? 40 : 0;
    const platformFee = 10;
    const gst = Math.floor((subtotal + deliveryFee) * 0.05);
    const total = subtotal + deliveryFee + platformFee + gst;
    const pointsEarned = Math.floor(total / 20);
    
    // Group items by restaurant
    const groupedItems = {};
    cartItems.forEach(item => {
        if (!groupedItems[item.restaurant]) {
            groupedItems[item.restaurant] = [];
        }
        groupedItems[item.restaurant].push(item);
    });
    
    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 4rem;">
                <i class="fas fa-shopping-cart" style="font-size: 4rem; color: var(--gray); margin-bottom: 1rem;"></i>
                <h2>Your Cart is Empty</h2>
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Add some delicious food items to your cart!</p>
                <button class="btn-primary" onclick="navigateTo('home')">
                    <i class="fas fa-utensils"></i> Browse Food Items
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="dashboard-header" style="background: linear-gradient(135deg, rgba(255,71,87,0.15), rgba(255,165,2,0.08)); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <div>
                <h1><i class="fas fa-shopping-cart" style="color: var(--primary);"></i> Your Cart</h1>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Review your items before placing order</p>
            </div>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem;">
                <div class="stat-card" style="padding: 0.5rem 1rem;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">${getCartCount()}</div>
                    <div style="font-size: 0.8rem;">Items</div>
                </div>
                <div class="stat-card" style="padding: 0.5rem 1rem;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--success);">${Object.keys(groupedItems).length}</div>
                    <div style="font-size: 0.8rem;">Restaurants</div>
                </div>
                <div class="stat-card" style="padding: 0.5rem 1rem;">
                    <div style="font-size: 1rem; font-weight: bold; color: var(--warning);"><i class="fas fa-star"></i> +${pointsEarned}</div>
                    <div style="font-size: 0.8rem;">Points to Earn</div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem;">
            <!-- Left Column - Order Items -->
            <div>
                <h3><i class="fas fa-box"></i> Order Items</h3>
                <div class="dashboard-container" style="margin-top: 1rem; padding: 0;">
                    ${Object.entries(groupedItems).map(([restaurant, items]) => `
                        <div style="margin-bottom: 1.5rem;">
                            <div style="background: rgba(255,255,255,0.05); padding: 0.5rem 1rem; border-radius: 8px; margin-bottom: 0.5rem;">
                                <i class="fas fa-store"></i> <strong>${restaurant}</strong>
                            </div>
                            ${items.map((item, idx) => {
                                const originalIndex = cartItems.findIndex(i => i.id === item.id);
                                return `
                                    <div class="order-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border);">
                                        <div style="flex: 2;">
                                            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                                <strong style="font-size: 1rem;">${item.name}</strong>
                                                ${item.popular ? '<span style="background: var(--warning); padding: 0.1rem 0.4rem; border-radius: 20px; font-size: 0.7rem;">🔥 Popular</span>' : ''}
                                            </div>
                                            <small style="color: var(--gray);"><i class="fas fa-tag"></i> ₹${item.price} each</small>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                                <button class="quantity-btn" onclick="updateItemQuantity(${originalIndex}, -1)" style="background: rgba(255,255,255,0.1); border: none; width: 28px; height: 28px; border-radius: 6px; color: white; cursor: pointer;">
                                                    <i class="fas fa-minus"></i>
                                                </button>
                                                <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                                                <button class="quantity-btn" onclick="updateItemQuantity(${originalIndex}, 1)" style="background: rgba(255,255,255,0.1); border: none; width: 28px; height: 28px; border-radius: 6px; color: white; cursor: pointer;">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                            <div class="price" style="font-size: 1.1rem;">${formatPrice(item.price * item.quantity)}</div>
                                            <button class="btn-view" style="background: var(--danger); padding: 0.2rem 0.6rem; margin-top: 0.3rem; font-size: 0.7rem;" onclick="removeFromCart(${originalIndex})">
                                                <i class="fas fa-trash"></i> Remove
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `).join('')}
                </div>
                
                <button class="btn-view" onclick="navigateTo('home')" style="margin-top: 1rem; width: 100%; background: rgba(255,255,255,0.1);">
                    <i class="fas fa-arrow-left"></i> Continue Shopping
                </button>
            </div>
            
            <!-- Right Column - Order Summary -->
            <div>
                <h3><i class="fas fa-receipt"></i> Order Summary</h3>
                <div class="dashboard-container" style="margin-top: 1rem;">
                    <div style="padding: 1rem;">
                        <div style="margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                                <span>Subtotal</span>
                                <span>${formatPrice(subtotal)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                                <span>Delivery Fee</span>
                                <span>${formatPrice(deliveryFee)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                                <span>Platform Fee</span>
                                <span>${formatPrice(platformFee)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                                <span>GST (5%)</span>
                                <span>${formatPrice(gst)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem; padding-top: 0.8rem; border-top: 1px solid var(--border);">
                                <strong style="font-size: 1.2rem;">Total Amount</strong>
                                <strong style="font-size: 1.2rem; color: var(--primary);">${formatPrice(total)}</strong>
                            </div>
                        </div>
                        
                        <div style="background: rgba(46,213,115,0.1); border-radius: 8px; padding: 0.5rem; margin-bottom: 1rem; text-align: center;">
                            <i class="fas fa-tag" style="color: var(--success);"></i>
                            <span style="font-size: 0.8rem;">You saved approximately ₹${Math.floor(subtotal * 0.1)} on this order!</span>
                        </div>
                        
                        <div style="background: rgba(255,215,0,0.1); border-radius: 8px; padding: 0.5rem; margin-bottom: 1rem; text-align: center;">
                            <i class="fas fa-star" style="color: var(--warning);"></i>
                            <span style="font-size: 0.8rem;">You'll earn <strong>${pointsEarned} loyalty points</strong> on this order!</span>
                        </div>
                        
                        <details style="margin-bottom: 1rem;">
                            <summary style="cursor: pointer; color: var(--primary); font-size: 0.85rem;">
                                <i class="fas fa-ticket"></i> Apply Coupon
                            </summary>
                            <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                                <input type="text" id="couponCode" class="form-input" placeholder="Enter coupon code" style="flex: 1;">
                                <button class="btn-primary" onclick="applyCoupon()" style="padding: 0.5rem 1rem;">Apply</button>
                            </div>
                            <div style="margin-top: 0.5rem; font-size: 0.7rem; color: var(--gray);">
                                <i class="fas fa-gift"></i> Available: WELCOME10 (10% off), SAVE20 (₹20 off)
                            </div>
                        </details>
                        
                        <div style="border: 1px solid var(--border); border-radius: 12px; padding: 1rem; margin: 1rem 0;">
                            <p style="margin-bottom: 0.5rem; color: var(--danger); font-size: 0.8rem;">
                                <i class="fas fa-asterisk"></i> Required fields are marked with *
                            </p>
                            
                            <div class="form-group" style="margin: 1rem 0;">
                                <label><i class="fas fa-map-marker-alt"></i> Delivery Address <span style="color: var(--danger);">*</span></label>
                                <textarea id="checkoutAddress" class="form-input" rows="2" placeholder="Enter your complete delivery address">${currentUser.address || ''}</textarea>
                                <small style="color: var(--text-muted); font-size: 0.7rem;">Please enter your full address with landmark</small>
                            </div>
                            
                            <div class="form-group" style="margin: 1rem 0;">
                                <label><i class="fas fa-phone"></i> Phone Number <span style="color: var(--danger);">*</span></label>
                                <input type="tel" id="checkoutPhone" class="form-input" value="${currentUser.phone || ''}" placeholder="10-digit mobile number">
                                <small style="color: var(--text-muted); font-size: 0.7rem;">Delivery partner will contact you on this number</small>
                            </div>
                            
                            <div class="form-group" style="margin: 1rem 0;">
                                <label><i class="fas fa-credit-card"></i> Payment Method <span style="color: var(--danger);">*</span></label>
                                <div style="display: flex; flex-direction: column; gap: 0.5rem;" class="payment-options-container">
                                    <div class="payment-option selected" onclick="selectPaymentMethod('online')" id="paymentOnline">
                                        <input type="radio" name="payment" value="online" checked> 💳 Credit/Debit Card
                                    </div>
                                    <div class="payment-option" onclick="selectPaymentMethod('upi')" id="paymentUpi">
                                        <input type="radio" name="payment" value="upi"> 📱 UPI (Google Pay/PhonePe)
                                    </div>
                                    <div class="payment-option" onclick="selectPaymentMethod('cod')" id="paymentCod">
                                        <input type="radio" name="payment" value="cod"> 💵 Cash on Delivery
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin: 1rem 0;">
                            <label><i class="fas fa-pen"></i> Order Notes (Optional)</label>
                            <textarea id="orderNotes" class="form-input" rows="2" placeholder="Special instructions for the restaurant"></textarea>
                        </div>
                        
                        <button class="btn-primary" style="width: 100%; margin-top: 1rem;" onclick="validateAndPlaceOrder()">
                            <i class="fas fa-check-circle"></i> Place Order
                        </button>
                        
                        <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 1rem; font-size: 0.7rem; color: var(--gray);">
                            <span><i class="fas fa-lock"></i> Secure Payment</span>
                            <span><i class="fas fa-truck"></i> Fast Delivery</span>
                            <span><i class="fas fa-undo"></i> Easy Returns</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Make all functions globally available
window.updateItemQuantity = updateItemQuantity;
window.selectPaymentMethod = selectPaymentMethod;
window.applyCoupon = applyCoupon;
window.validateAndPlaceOrder = validateAndPlaceOrder;
window.processCheckoutWithValidation = processCheckoutWithValidation;