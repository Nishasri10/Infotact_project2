function renderDashboardPage() {
    const level = getLevel(currentUser.points);
    const nextLevel = currentUser.points >= 5000 ? 0 : level.nextLevel - (currentUser.points % level.nextLevel);
    const progress = currentUser.points >= 5000 ? 100 : ((currentUser.points % level.nextLevel) / level.nextLevel) * 100;
    
    const container = document.getElementById('pageContent');
    container.innerHTML = `
        <div class="dashboard-container">
            <div class="dashboard-header">
                <div class="welcome-section">
                    <h2><i class="fas fa-user-circle"></i> Welcome back, ${currentUser.name}!</h2>
                    <p>Track your activity and manage your account</p>
                </div>
                <div class="points-badge"><i class="fas fa-star"></i> ${currentUser.points} Points</div>
            </div>
            
            <div class="dashboard-stats">
                <div class="dash-card"><i class="fas fa-shopping-bag"></i><div class="dash-number">${orders.length}</div><div class="dash-label">Total Orders</div></div>
                <div class="dash-card"><i class="fas fa-heart"></i><div class="dash-number">${favorites.length}</div><div class="dash-label">Favorites</div></div>
                <div class="dash-card"><i class="fas fa-chair"></i><div class="dash-number">${reservations.length}</div><div class="dash-label">Reservations</div></div>
                <div class="dash-card"><i class="fas fa-trophy"></i><div class="dash-number">${level.name}</div><div class="dash-label">Member Level</div></div>
            </div>
            
            <div class="level-progress">
                <div><strong>${level.name} Member</strong> - ${currentUser.points} / ${level.nextLevel} points</div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
                <div style="font-size:0.8rem; color:rgba(255,255,255,0.6)">${nextLevel > 0 ? `${nextLevel} points to next level` : '🏆 Max Level Achieved!'}</div>
            </div>
            
            <div class="recent-orders">
                <h3><i class="fas fa-clock"></i> Recent Orders</h3>
                ${orders.length === 0 ? '<p style="padding:2rem;text-align:center">No orders yet</p>' : orders.slice(0,3).map(order => `
                    <div class="order-item" style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--border)">
                        <div><strong>Order #${order.id.slice(-8)}</strong><br><small>${formatDate(order.date)}</small></div>
                        <div>${order.items.length} items</div>
                        <div>${formatPrice(order.total)}</div>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 2rem;">
                <h3><i class="fas fa-calendar"></i> Recent Reservations</h3>
                ${reservations.length === 0 ? '<p style="padding:1rem;text-align:center">No reservations yet</p>' : reservations.slice(0,3).map(res => `
                    <div class="order-item" style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--border)">
                        <div><strong>${res.restaurant}</strong><br><small>${res.date} at ${res.time}</small></div>
                        <div>${res.members} people</div>
                        <div><span style="color:var(--success)">${res.status}</span></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
