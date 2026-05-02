function renderDashboardPage() {
    const level = getLevel(currentUser.points);
    const nextLevel = currentUser.points >= 5000 ? 0 : level.nextLevel - (currentUser.points % level.nextLevel);
    const progress = currentUser.points >= 5000 ? 100 : ((currentUser.points % level.nextLevel) / level.nextLevel) * 100;
    
    // Calculate statistics
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalPointsEarned = orders.reduce((sum, order) => sum + Math.floor((order.total || 0) / 20), 0) + (reservations.length * 20);
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => o.status !== 'delivered').length;
    
    // Get recent activities (last 5)
    const recentActivities = [];
    
    // Add orders to activities
    orders.slice(0, 3).forEach(order => {
        recentActivities.push({
            type: 'order',
            title: `Order #${order.id.slice(-8)}`,
            amount: order.total,
            date: order.date,
            status: order.status
        });
    });
    
    // Add reservations to activities
    reservations.slice(0, 2).forEach(res => {
        recentActivities.push({
            type: 'reservation',
            title: `${res.restaurant}`,
            members: res.members,
            date: res.date,
            time: res.time,
            status: res.status
        });
    });
    
    // Sort by date
    recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const container = document.getElementById('pageContent');
    container.innerHTML = `
        <div class="dashboard-container">
            <!-- Welcome Section with Greeting -->
            <div class="dashboard-header" style="background: linear-gradient(135deg, rgba(255,71,87,0.15), rgba(255,165,2,0.08)); border-radius: 20px; padding: 1.5rem;">
                <div class="welcome-section">
                    <h2><i class="fas fa-user-circle"></i> Welcome back, ${currentUser.name}!</h2>
                    <p>${getGreeting()} • Member since ${new Date().getFullYear()}</p>
                </div>
                <div class="points-badge" style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 0.5rem 1rem; border-radius: 30px;">
                    <i class="fas fa-star"></i> ${currentUser.points} Points
                </div>
            </div>
            
            <!-- Stats Grid with Icons -->
            <div class="dashboard-stats">
                <div class="dash-card" style="background: linear-gradient(135deg, rgba(46,213,115,0.15), rgba(46,213,115,0.05));">
                    <i class="fas fa-shopping-bag" style="color: var(--success);"></i>
                    <div class="dash-number">${orders.length}</div>
                    <div class="dash-label">Total Orders</div>
                    <small style="color: var(--success);">+${completedOrders} completed</small>
                </div>
                <div class="dash-card" style="background: linear-gradient(135deg, rgba(255,71,87,0.15), rgba(255,71,87,0.05));">
                    <i class="fas fa-heart" style="color: var(--danger);"></i>
                    <div class="dash-number">${favorites.length}</div>
                    <div class="dash-label">Favorites</div>
                    <small style="color: var(--danger);">Saved restaurants</small>
                </div>
                <div class="dash-card" style="background: linear-gradient(135deg, rgba(255,165,2,0.15), rgba(255,165,2,0.05));">
                    <i class="fas fa-chair" style="color: var(--secondary);"></i>
                    <div class="dash-number">${reservations.length}</div>
                    <div class="dash-label">Reservations</div>
                    <small style="color: var(--secondary);">Table bookings</small>
                </div>
                <div class="dash-card" style="background: linear-gradient(135deg, rgba(30,144,255,0.15), rgba(30,144,255,0.05));">
                    <i class="fas fa-trophy" style="color: var(--info);"></i>
                    <div class="dash-number">${level.name}</div>
                    <div class="dash-label">Member Level</div>
                    <small style="color: var(--info);">${level.icon} Level ${level.name}</small>
                </div>
            </div>
            
            <!-- Spending Summary Row -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div class="stat-card" style="display: flex; align-items: center; gap: 1rem; justify-content: space-between;">
                    <div><i class="fas fa-rupee-sign" style="font-size: 1.5rem; color: var(--primary);"></i><br>Total Spent</div>
                    <div style="font-size: 1.8rem; font-weight: 800; color: var(--primary);">${formatPrice(totalSpent)}</div>
                </div>
                <div class="stat-card" style="display: flex; align-items: center; gap: 1rem; justify-content: space-between;">
                    <div><i class="fas fa-star" style="font-size: 1.5rem; color: var(--warning);"></i><br>Points Earned</div>
                    <div style="font-size: 1.8rem; font-weight: 800; color: var(--warning);">${totalPointsEarned}</div>
                </div>
                <div class="stat-card" style="display: flex; align-items: center; gap: 1rem; justify-content: space-between;">
                    <div><i class="fas fa-chart-line" style="font-size: 1.5rem; color: var(--info);"></i><br>Pending Orders</div>
                    <div style="font-size: 1.8rem; font-weight: 800; color: var(--info);">${pendingOrders}</div>
                </div>
            </div>
            
            <!-- Level Progress with Enhanced Design -->
            <div class="level-progress" style="background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2)); border-radius: 20px; padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                    <div>
                        <span style="font-size: 1.2rem; font-weight: 700;">${level.name} Member</span>
                        <span style="font-size: 1.5rem; margin-left: 0.5rem;">${level.icon}</span>
                    </div>
                    <div>
                        <span style="font-size: 0.9rem; color: var(--text-muted);">${currentUser.points} / ${level.nextLevel} points</span>
                    </div>
                </div>
                <div class="progress-bar" style="height: 12px; border-radius: 6px; background: rgba(255,255,255,0.1);">
                    <div class="progress-fill" style="width: ${progress}%; height: 100%; border-radius: 6px; background: linear-gradient(90deg, var(--primary), var(--secondary)); position: relative;">
                        <span style="position: absolute; right: 0; top: -20px; font-size: 0.7rem; color: var(--primary);">${Math.round(progress)}%</span>
                    </div>
                </div>
                <div style="font-size:0.8rem; color:rgba(255,255,255,0.6); margin-top: 0.5rem;">
                    ${nextLevel > 0 ? `🎯 ${nextLevel} more points to reach ${getNextLevelName(level.name)} level!` : '🏆 Congratulations! You have reached the maximum level!'}
                </div>
            </div>
            
            <!-- Recent Activities Combined Section -->
            <div style="margin-top: 2rem;">
                <h3><i class="fas fa-history"></i> Recent Activities</h3>
                <div class="dashboard-container" style="padding: 0; margin-top: 1rem;">
                    ${recentActivities.length === 0 ? '<p style="padding:2rem;text-align:center">No recent activities</p>' : recentActivities.map(activity => {
                        if (activity.type === 'order') {
                            return `
                                <div class="order-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border); transition: all 0.3s;">
                                    <div>
                                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                                            <i class="fas fa-shopping-bag" style="color: var(--success);"></i>
                                            <strong>${activity.title}</strong>
                                            <span class="badge" style="background: ${activity.status === 'delivered' ? 'var(--success)' : 'var(--warning)'}; padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.7rem;">${activity.status || 'Confirmed'}</span>
                                        </div>
                                        <small><i class="fas fa-calendar"></i> ${formatDate(activity.date)}</small>
                                    </div>
                                    <div>
                                        <div style="font-weight: 700; color: var(--primary);">${formatPrice(activity.amount || 0)}</div>
                                        <small>${activity.items || activity.items?.length || 0} items</small>
                                    </div>
                                </div>
                            `;
                        } else {
                            return `
                                <div class="order-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border);">
                                    <div>
                                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                                            <i class="fas fa-calendar-check" style="color: var(--secondary);"></i>
                                            <strong>${activity.title}</strong>
                                            <span class="badge" style="background: var(--success); padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.7rem;">${activity.status}</span>
                                        </div>
                                        <small><i class="fas fa-calendar"></i> ${activity.date} at ${activity.time}</small>
                                    </div>
                                    <div>
                                        <div><i class="fas fa-users"></i> ${activity.members} people</div>
                                        <small>Table reserved</small>
                                    </div>
                                </div>
                            `;
                        }
                    }).join('')}
                </div>
            </div>
            
            <!-- Quick Actions Section -->
            <div style="margin-top: 2rem;">
                <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    <button class="btn-primary" onclick="navigateTo('restaurants')" style="background: linear-gradient(135deg, var(--success), #45B7D1);">
                        <i class="fas fa-motorcycle"></i> Order Food
                    </button>
                    <button class="btn-primary" onclick="navigateTo('events')" style="background: linear-gradient(135deg, var(--info), #667eea);">
                        <i class="fas fa-ticket-alt"></i> Book Events
                    </button>
                    <button class="btn-primary" onclick="navigateTo('wishlist')" style="background: linear-gradient(135deg, var(--danger), #ff6b6b);">
                        <i class="fas fa-heart"></i> View Wishlist
                    </button>
                    <button class="btn-primary" onclick="navigateTo('profile')" style="background: linear-gradient(135deg, var(--secondary), #f39c12);">
                        <i class="fas fa-user-edit"></i> Edit Profile
                    </button>
                </div>
            </div>
            
            <!-- Tips Section -->
            <div style="margin-top: 2rem; background: linear-gradient(135deg, rgba(255,71,87,0.1), rgba(255,165,2,0.05)); border-radius: 16px; padding: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-lightbulb" style="color: var(--warning);"></i>
                    <strong>Pro Tip</strong>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-muted);">
                    ${getTipMessage(level.name)}
                </p>
            </div>
        </div>
    `;
}

// Helper function to get greeting based on time
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning! ☀️";
    if (hour < 18) return "Good Afternoon! 🌤️";
    return "Good Evening! 🌙";
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

// Helper function to get tip message based on level
function getTipMessage(level) {
    const tips = {
        'Bronze': '✨ Write detailed reviews to earn more points and level up faster! Each review gives you 10-50 points.',
        'Silver': '🎯 Book tables for events to earn +20 bonus points per reservation!',
        'Gold': '⭐ You\'re close to Platinum! Keep ordering and reviewing to earn more points.',
        'Platinum': '💎 Amazing! You\'re almost at Diamond level. Share your experience with friends!',
        'Diamond': '🏆 Congratulations! You\'ve reached the highest level. Enjoy exclusive benefits!'
    };
    return tips[level] || '📝 Complete your profile to get personalized recommendations!';
}