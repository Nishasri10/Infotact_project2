// Dashboard Page Component
let userStats = { orders: 0, reviews: 0, points: 0, level: 1 };

async function loadDashboard() {
    if (!window.currentUser) return;
    
    userStats.points = window.currentUser.loyaltyPoints || 0;
    userStats.level = Math.floor(userStats.points / 500) + 1;
    userStats.nextLevelPoints = 500 - (userStats.points % 500);
    
    const ordersResult = await API.orders.getMyOrders(window.currentUser.token);
    if (ordersResult.success) {
        userStats.orders = ordersResult.orders?.length || 0;
    }
    
    const reviewsResult = await API.reviews.getMyReviews(window.currentUser.token);
    if (reviewsResult.success) {
        userStats.reviews = reviewsResult.reviews?.length || 0;
    }
    
    renderDashboardStats();
}

function renderDashboardStats() {
    const container = document.getElementById('dashboardStats');
    if (!container) return;
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${userStats.points}</div>
                <div class="stat-label">Loyalty Points</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">Level ${userStats.level}</div>
                <div class="stat-label">${userStats.level === 1 ? '🥉 Bronze Member' : userStats.level === 2 ? '🥈 Silver Member' : userStats.level === 3 ? '🥇 Gold Member' : '💎 Diamond Member'}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${userStats.orders}</div>
                <div class="stat-label">Orders Placed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${userStats.reviews}</div>
                <div class="stat-label">Reviews Written</div>
            </div>
        </div>
        ${userStats.nextLevelPoints > 0 && userStats.nextLevelPoints < 500 ? `
            <div class="stat-card" style="margin-top: 1rem;">
                <div class="stat-label">⭐ ${userStats.nextLevelPoints} points needed for next level</div>
                <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
                    <div style="width: ${((500 - userStats.nextLevelPoints) / 500) * 100}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary));"></div>
                </div>
            </div>
        ` : ''}
        <div style="margin-top: 2rem;">
            <h3>How to Earn More Points?</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div>📝 Write detailed reviews (50+ chars)</div>
                    <div class="stat-label">+10 to +30 points</div>
                </div>
                <div class="stat-card">
                    <div>📸 Add photos to reviews</div>
                    <div class="stat-label">+15 points</div>
                </div>
                <div class="stat-card">
                    <div>⭐ Give 4-5 star ratings</div>
                    <div class="stat-label">+10 points</div>
                </div>
                <div class="stat-card">
                    <div>🛒 Place orders</div>
                    <div class="stat-label">5% of order value</div>
                </div>
            </div>
        </div>
    `;
}

function DashboardPage() {
    if (!window.currentUser) {
        return `
            <div class="hero">
                <h1>Sign In to View Dashboard</h1>
                <button class="btn-primary" onclick="window.handleAuth()">Sign In</button>
            </div>
        `;
    }
    
    setTimeout(() => loadDashboard(), 100);
    
    return `
        <div class="dashboard">
            <h2>Your Dashboard</h2>
            <div id="dashboardStats">
                <div class="loading">Loading dashboard...</div>
            </div>
        </div>
    `;
}