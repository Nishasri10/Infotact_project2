function renderProfilePage() {
    const level = getLevel(currentUser.points);
    const container = document.getElementById('pageContent');
    container.innerHTML = `
        <div class="dashboard-container">
            <div class="dashboard-header">
                <div class="welcome-section">
                    <h2><i class="fas fa-user-circle"></i> My Profile</h2>
                    <p>Manage your personal information</p>
                </div>
                <div class="points-badge"><i class="fas fa-star"></i> ${currentUser.points} Points | ${level.name} ${level.icon}</div>
            </div>
            
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(350px,1fr));gap:2rem">
                <div>
                    <h3>Personal Information</h3>
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="profileName" class="form-input" value="${currentUser.name}">
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="profileEmail" class="form-input" value="${currentUser.email}">
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" id="profilePhone" class="form-input" value="${currentUser.phone || ''}" placeholder="Add your phone number">
                    </div>
                    <div class="form-group">
                        <label>Delivery Address</label>
                        <textarea id="profileAddress" class="form-input" rows="3" placeholder="Enter your address">${currentUser.address || ''}</textarea>
                    </div>
                    <button class="btn-primary" onclick="updateProfile()">Update Profile</button>
                </div>
                
                <div>
                    <h3>Account Statistics</h3>
                    <div class="dash-card"><i class="fas fa-shopping-bag"></i><div class="dash-number">${orders.length}</div><div class="dash-label">Total Orders</div></div>
                    <div class="dash-card"><i class="fas fa-heart"></i><div class="dash-number">${favorites.length}</div><div class="dash-label">Favorite Items</div></div>
                    <div class="dash-card"><i class="fas fa-chair"></i><div class="dash-number">${reservations.length}</div><div class="dash-label">Table Reservations</div></div>
                    <div class="dash-card"><div class="dash-number">${level.name}</div><div class="dash-label">Member Level ${level.icon}</div></div>
                </div>
            </div>
            
            <button class="btn-primary" style="margin-top:2rem;background:var(--danger)" onclick="handleAuth()">Logout</button>
        </div>
    `;
}