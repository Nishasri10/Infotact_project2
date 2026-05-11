function renderProfilePage() {
    const level = getLevel(currentUser.points);
    const nextLevelPoints = currentUser.points >= 5000 ? 0 : level.nextLevel - (currentUser.points % level.nextLevel);
    const progress = currentUser.points >= 5000 ? 100 : ((currentUser.points % level.nextLevel) / level.nextLevel) * 100;
    
    // Calculate statistics
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const activeBookings = reservations.filter(r => new Date(r.date) >= new Date()).length;
    const bookedEventsCount = bookedEvents.length;
    
    // Get member since date (from localStorage or default)
    const memberSince = localStorage.getItem('memberSince') || '2024';
    
    const container = document.getElementById('pageContent');
    
    container.innerHTML = `
        <!-- Profile Header with Cover Image -->
        <div style="position: relative; margin-bottom: 4rem;">
            <div style="height: 180px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 24px; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50%; right: -10%; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                <div style="position: absolute; bottom: -30%; left: -5%; width: 150px; height: 150px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
            </div>
            
            <!-- Profile Avatar Card -->
            <div style="position: absolute; bottom: -50px; left: 2rem; display: flex; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap;">
                <div style="position: relative;">
                    <div style="width: 120px; height: 120px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid var(--light); box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                        <i class="fas fa-user" style="font-size: 3rem; color: white;"></i>
                    </div>
                    <button class="edit-avatar-btn" style="position: absolute; bottom: 5px; right: 5px; background: var(--dark); border: none; width: 32px; height: 32px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);" onclick="document.getElementById('avatarInput').click()">
                        <i class="fas fa-camera" style="font-size: 0.8rem;"></i>
                    </button>
                    <input type="file" id="avatarInput" style="display: none;" accept="image/*">
                </div>
                <div style="margin-bottom: 0.5rem;">
                    <h1 style="font-size: 1.8rem; margin-bottom: 0.25rem;">${currentUser.name}</h1>
                    <p style="color: var(--text-muted);"><i class="fas fa-calendar-alt"></i> Member since ${memberSince}</p>
                </div>
            </div>
        </div>
        
        <!-- Quick Stats Row -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; margin-top: 2rem;">
            <div class="stat-card" style="display: flex; align-items: center; gap: 1rem; padding: 1rem;">
                <div style="background: rgba(255,71,87,0.2); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-shopping-bag" style="font-size: 1.5rem; color: var(--primary);"></i>
                </div>
                <div>
                    <div style="font-size: 1.5rem; font-weight: 800;">${totalOrders}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Total Orders</div>
                </div>
            </div>
            <div class="stat-card" style="display: flex; align-items: center; gap: 1rem; padding: 1rem;">
                <div style="background: rgba(46,213,115,0.2); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-rupee-sign" style="font-size: 1.5rem; color: var(--success);"></i>
                </div>
                <div>
                    <div style="font-size: 1.5rem; font-weight: 800;">${formatPrice(totalSpent)}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Total Spent</div>
                </div>
            </div>
            <div class="stat-card" style="display: flex; align-items: center; gap: 1rem; padding: 1rem;">
                <div style="background: rgba(255,165,2,0.2); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-star" style="font-size: 1.5rem; color: var(--warning);"></i>
                </div>
                <div>
                    <div style="font-size: 1.5rem; font-weight: 800;">${currentUser.points}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Loyalty Points</div>
                </div>
            </div>
            <div class="stat-card" style="display: flex; align-items: center; gap: 1rem; padding: 1rem;">
                <div style="background: rgba(30,144,255,0.2); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-trophy" style="font-size: 1.5rem; color: var(--info);"></i>
                </div>
                <div>
                    <div style="font-size: 1.5rem; font-weight: 800;">${level.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Member Level</div>
                </div>
            </div>
        </div>
        
        <!-- Main Profile Content -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem;">
            <!-- Personal Information Card -->
            <div style="background: rgba(255,255,255,0.05); border-radius: 20px; padding: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border);">
                    <i class="fas fa-user-edit" style="color: var(--primary);"></i>
                    <h3 style="margin: 0;">Personal Information</h3>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-user"></i> Full Name</label>
                    <input type="text" id="profileName" class="form-input" value="${currentUser.name}" placeholder="Enter your full name">
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-envelope"></i> Email Address</label>
                    <input type="email" id="profileEmail" class="form-input" value="${currentUser.email}" placeholder="Enter your email">
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-phone"></i> Phone Number</label>
                    <input type="tel" id="profilePhone" class="form-input" value="${currentUser.phone || ''}" placeholder="Enter your phone number">
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-map-marker-alt"></i> Delivery Address</label>
                    <textarea id="profileAddress" class="form-textarea" rows="3" placeholder="Enter your complete delivery address">${currentUser.address || ''}</textarea>
                </div>
                
                <button class="btn-primary" onclick="updateProfile()" style="width: 100%; margin-top: 1rem;">
                    <i class="fas fa-save"></i> Update Profile
                </button>
            </div>
            
            <!-- Account Statistics & Activity Card -->
            <div style="background: rgba(255,255,255,0.05); border-radius: 20px; padding: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border);">
                    <i class="fas fa-chart-line" style="color: var(--success);"></i>
                    <h3 style="margin: 0;">Account Statistics</h3>
                </div>
                
                <!-- Stats Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="text-align: center; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 12px;">
                        <div style="font-size: 1.8rem; font-weight: 800; color: var(--primary);">${completedOrders}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Completed Orders</div>
                    </div>
                    <div style="text-align: center; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 12px;">
                        <div style="font-size: 1.8rem; font-weight: 800; color: var(--warning);">${favorites.length}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Favorite Items</div>
                    </div>
                    <div style="text-align: center; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 12px;">
                        <div style="font-size: 1.8rem; font-weight: 800; color: var(--secondary);">${activeBookings}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Active Bookings</div>
                    </div>
                    <div style="text-align: center; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 12px;">
                        <div style="font-size: 1.8rem; font-weight: 800; color: var(--info);">${bookedEventsCount}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Event Bookings</div>
                    </div>
                </div>
                
                <!-- Level Progress -->
                <div style="margin-top: 1rem; background: rgba(0,0,0,0.3); border-radius: 16px; padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span><i class="fas fa-chart-simple"></i> Progress to ${getNextLevelName(level.name)}</span>
                        <span>${currentUser.points} / ${level.nextLevel}</span>
                    </div>
                    <div class="progress-bar" style="height: 10px; border-radius: 5px;">
                        <div class="progress-fill" style="width: ${progress}%; height: 100%; border-radius: 5px;"></div>
                    </div>
                    <div style="margin-top: 0.5rem; font-size: 0.7rem; color: var(--text-muted);">
                        ${nextLevelPoints > 0 ? `✨ ${nextLevelPoints} more points to reach ${getNextLevelName(level.name)} level!` : '🏆 Congratulations! You\'ve reached the highest level!'}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Recent Activity Section -->
        <div style="margin-top: 2rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <i class="fas fa-history" style="color: var(--warning);"></i>
                <h3>Recent Activity</h3>
            </div>
            <div class="dashboard-container" style="padding: 0;">
                ${orders.length === 0 && reservations.length === 0 && bookedEvents.length === 0 ? `
                    <div style="text-align: center; padding: 3rem;">
                        <i class="fas fa-inbox" style="font-size: 3rem; color: var(--gray); margin-bottom: 1rem;"></i>
                        <p>No recent activity yet</p>
                        <button class="btn-view" onclick="navigateTo('home')">Start Ordering</button>
                    </div>
                ` : `
                    ${orders.slice(0, 3).map(order => `
                        <div class="activity-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--border);">
                            <div style="background: rgba(46,213,115,0.2); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-shopping-bag" style="color: var(--success);"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">Order #${order.id.slice(-8)}</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">${formatPrice(order.total)} • ${new Date(order.date).toLocaleDateString()}</div>
                            </div>
                            <div><span style="background: ${getStatusColor(order.status)}; padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.7rem;">${order.status}</span></div>
                        </div>
                    `).join('')}
                    ${reservations.slice(0, 2).map(res => `
                        <div class="activity-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--border);">
                            <div style="background: rgba(255,165,2,0.2); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-calendar-check" style="color: var(--warning);"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">${res.restaurant}</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">${res.date} • ${res.members} people</div>
                            </div>
                            <div><span style="background: var(--success); padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.7rem;">Confirmed</span></div>
                        </div>
                    `).join('')}
                `}
            </div>
        </div>
        
        <!-- Action Buttons -->
        <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
            <button class="btn-primary" onclick="navigateTo('orders')" style="background: transparent; border: 1px solid var(--primary);">
                <i class="fas fa-shopping-bag"></i> View All Orders
            </button>
            <button class="btn-primary" onclick="navigateTo('reservations')" style="background: transparent; border: 1px solid var(--secondary);">
                <i class="fas fa-calendar"></i> View Reservations
            </button>
            <button class="btn-primary" onclick="navigateTo('events')" style="background: transparent; border: 1px solid var(--info);">
                <i class="fas fa-ticket-alt"></i> View Events
            </button>
            <button class="btn-primary" onclick="clearAllUserData()" style="background: var(--error);">
                <i class="fas fa-trash"></i> Clear Data
            </button>
            <button class="btn-primary" onclick="logoutUser()" style="background: var(--danger);">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `;
}

// Helper function to get next level name
function getNextLevelName(currentLevel) {
    const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const index = levels.indexOf(currentLevel);
    if (index !== -1 && index < levels.length - 1) {
        return levels[index + 1];
    }
    return 'Maximum';
}

// Function to get status color (reused from orders)
function getStatusColor(status) {
    const colors = {
        'pending': '#F57C00',
        'confirmed': '#2196F3',
        'preparing': '#FF9800',
        'out_for_delivery': '#9C27B0',
        'delivered': '#4CAF50',
        'cancelled': '#F44336'
    };
    return colors[status?.toLowerCase()] || '#757575';
}

// Keep existing functions
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
    if (typeof renderNavbar === 'function') renderNavbar();
}

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
        navigateTo('home');
        if (typeof renderNavbar === 'function') renderNavbar();
    }
}

function clearAllUserData() {
    if (confirm('⚠️ WARNING: This will delete all your data including cart, orders, reservations, and bookings. This action cannot be undone. Are you sure?')) {
        localStorage.removeItem('promax_cart');
        localStorage.removeItem('promax_favorites');
        localStorage.removeItem('promax_orders');
        localStorage.removeItem('promax_reservations');
        localStorage.removeItem('promax_booked_events');
        localStorage.removeItem('promax_user');
        
        cartItems = [];
        favorites = [];
        orders = [];
        reservations = [];
        bookedEvents = [];
        currentUser = { name: 'Food Lover', email: 'foodie@example.com', points: 250, phone: '', address: '' };
        localStorage.setItem('promax_user', JSON.stringify(currentUser));
        
        showNotification('All data cleared successfully!');
        navigateTo('home');
        if (typeof renderNavbar === 'function') renderNavbar();
    }
}

// Make functions global
window.updateProfile = updateProfile;
window.logoutUser = logoutUser;
window.clearAllUserData = clearAllUserData;
window.getNextLevelName = getNextLevelName;