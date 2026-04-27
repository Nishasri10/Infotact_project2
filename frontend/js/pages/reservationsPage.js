function renderReservationsPage() {
    const container = document.getElementById('pageContent');
    
    if (reservations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h2>No Reservations Yet</h2>
                <p>Book a table by clicking "Dine In" on any food item!</p>
                <button class="btn-primary" onclick="navigateTo('home')">Browse Food Items</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="section-title"><i class="fas fa-calendar-check" style="color:var(--success)"></i> My Table Reservations (${reservations.length})</div>
        <div class="dashboard-container">
            ${reservations.map(res => `
                <div class="order-item" style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--border)">
                    <div>
                        <strong>${res.restaurant}</strong><br>
                        <small>${res.food}</small><br>
                        <small><i class="fas fa-calendar"></i> ${res.date} at ${res.time}</small>
                    </div>
                    <div>
                        <div><i class="fas fa-users"></i> ${res.members} people</div>
                        <div><span style="color:var(--success)">✓ ${res.status}</span></div>
                        <div><small>ID: ${res.id.slice(-8)}</small></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}