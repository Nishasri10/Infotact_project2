function renderReservationsPage() {
    const container = document.getElementById('pageContent');
    
    // Sort reservations by date (upcoming first)
    const sortedReservations = [...reservations].sort((a, b) => new Date(a.date) - new Date(b.date));
    const upcomingReservations = sortedReservations.filter(r => new Date(r.date) >= new Date());
    const pastReservations = sortedReservations.filter(r => new Date(r.date) < new Date());
    
    // Calculate statistics
    const totalPeople = reservations.reduce((sum, r) => sum + r.members, 0);
    const totalReservations = reservations.length;
    const upcomingCount = upcomingReservations.length;
    
    if (reservations.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 4rem;">
                <i class="fas fa-calendar-times" style="font-size: 4rem; color: var(--gray); margin-bottom: 1rem;"></i>
                <h2>No Reservations Yet</h2>
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Book a table by clicking "Dine In" on any food item!</p>
                <button class="btn-primary" onclick="navigateTo('home')">
                    <i class="fas fa-utensils"></i> Browse Food Items
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <!-- Header Section with Stats -->
        <div class="dashboard-header" style="background: linear-gradient(135deg, rgba(46,213,115,0.15), rgba(46,213,115,0.05)); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <div>
                <h1><i class="fas fa-calendar-check" style="color: var(--success);"></i> My Table Reservations</h1>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Manage all your restaurant table bookings</p>
            </div>
            <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 1rem;">
                <div class="stat-card" style="padding: 0.5rem 1rem;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--success);">${totalReservations}</div>
                    <div style="font-size: 0.8rem;">Total Bookings</div>
                </div>
                <div class="stat-card" style="padding: 0.5rem 1rem;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--warning);">${upcomingCount}</div>
                    <div style="font-size: 0.8rem;">Upcoming</div>
                </div>
                <div class="stat-card" style="padding: 0.5rem 1rem;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--info);">${totalPeople}</div>
                    <div style="font-size: 0.8rem;">Total Guests</div>
                </div>
                <div class="stat-card" style="padding: 0.5rem 1rem;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">${pastReservations.length}</div>
                    <div style="font-size: 0.8rem;">Completed</div>
                </div>
            </div>
        </div>
        
        <!-- Upcoming Reservations Section -->
        ${upcomingReservations.length > 0 ? `
            <div class="section-title">
                <i class="fas fa-clock" style="color: var(--warning);"></i> Upcoming Reservations (${upcomingReservations.length})
            </div>
            <div class="dashboard-container" style="margin-bottom: 2rem;">
                ${upcomingReservations.map(res => {
                    const eventDate = new Date(res.date);
                    const today = new Date();
                    const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                    const isToday = daysUntil === 0;
                    const isTomorrow = daysUntil === 1;
                    
                    let dateBadge = '';
                    if (isToday) dateBadge = '<span class="badge" style="background: var(--success); padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.7rem;">🍽️ Today</span>';
                    else if (isTomorrow) dateBadge = '<span class="badge" style="background: var(--warning); padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.7rem;">📅 Tomorrow</span>';
                    else dateBadge = `<span class="badge" style="background: var(--info); padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.7rem;">📅 In ${daysUntil} days</span>`;
                    
                    return `
                        <div class="order-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border); transition: all 0.3s; background: rgba(255,255,255,0.02); margin-bottom: 0.5rem; border-radius: 12px;">
                            <div style="flex: 2;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
                                    <strong style="font-size: 1.1rem;">${res.restaurant}</strong>
                                    ${dateBadge}
                                </div>
                                <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
                                    <div><i class="fas fa-utensils"></i> ${res.food || 'Table Booking'}</div>
                                    <div><i class="fas fa-calendar"></i> ${new Date(res.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                    <div><i class="fas fa-clock"></i> ${res.time}</div>
                                </div>
                            </div>
                            <div style="text-align: center; min-width: 120px;">
                                <div><i class="fas fa-users"></i> ${res.members} ${res.members === 1 ? 'person' : 'people'}</div>
                                <div><span style="color: var(--success);"><i class="fas fa-check-circle"></i> ${res.status}</span></div>
                                <div><small style="color: var(--text-muted);">ID: ${res.id.slice(-8)}</small></div>
                            </div>
                            <div>
                                ${!isToday && daysUntil > 0 ? `
                                    <button class="btn-view" style="background: var(--danger); padding: 0.3rem 0.8rem; margin-top: 0.5rem; font-size: 0.7rem;" onclick="cancelReservation('${res.id}')">
                                        <i class="fas fa-times"></i> Cancel
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : ''}
        
        <!-- Past Reservations Section (Collapsible) -->
        ${pastReservations.length > 0 ? `
            <div class="section-title" style="cursor: pointer;" onclick="togglePastReservations()">
                <i class="fas fa-history" style="color: var(--gray);"></i> Past Reservations (${pastReservations.length})
                <i class="fas fa-chevron-down" id="pastResToggleIcon" style="font-size: 0.8rem; margin-left: 0.5rem; transition: transform 0.3s;"></i>
            </div>
            <div id="pastReservationsContainer" style="display: none;">
                <div class="dashboard-container">
                    ${pastReservations.map(res => `
                        <div class="order-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border); opacity: 0.7;">
                            <div>
                                <strong>${res.restaurant}</strong><br>
                                <small>${res.food || 'Table Booking'}</small><br>
                                <small><i class="fas fa-calendar"></i> ${new Date(res.date).toLocaleDateString()} at ${res.time}</small>
                            </div>
                            <div>
                                <div><i class="fas fa-users"></i> ${res.members} people</div>
                                <div><span style="color: var(--gray);"><i class="fas fa-check-circle"></i> Completed</span></div>
                                <div><small>ID: ${res.id.slice(-8)}</small></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        <!-- Tips Section -->
        <div style="margin-top: 2rem; background: linear-gradient(135deg, rgba(255,71,87,0.1), rgba(255,165,2,0.05)); border-radius: 16px; padding: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <i class="fas fa-lightbulb" style="color: var(--warning);"></i>
                <strong>Reservation Tips</strong>
            </div>
            <ul style="margin-left: 1.5rem; color: var(--text-muted); font-size: 0.85rem;">
                <li>📞 Call the restaurant to confirm your booking 1 hour before arrival</li>
                <li>⏰ Arrive 10 minutes early to get the best table</li>
                <li>📝 Special requests can be mentioned during reservation</li>
                <li>⭐ After dining, don't forget to leave a review and earn points!</li>
            </ul>
        </div>
    `;
}

// Function to cancel a reservation
function cancelReservation(reservationId) {
    if (confirm('Are you sure you want to cancel this reservation? This action cannot be undone.')) {
        const index = reservations.findIndex(r => r.id === reservationId);
        if (index !== -1) {
            const cancelledRes = reservations[index];
            reservations.splice(index, 1);
            saveData();
            showNotification(`❌ Reservation at ${cancelledRes.restaurant} has been cancelled.`);
            renderReservationsPage();
        }
    }
}

// Function to toggle past reservations visibility
function togglePastReservations() {
    const container = document.getElementById('pastReservationsContainer');
    const icon = document.getElementById('pastResToggleIcon');
    if (container.style.display === 'none') {
        container.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
    } else {
        container.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}

// Make functions globally available
window.cancelReservation = cancelReservation;
window.togglePastReservations = togglePastReservations;