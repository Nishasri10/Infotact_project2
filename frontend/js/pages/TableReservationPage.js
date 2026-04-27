let resRestaurant = null, resTable = null, resMembers = 2, selectedDate = '', selectedTime = '';

function loadReservation() {
    resRestaurant = JSON.parse(localStorage.getItem('selectedRestaurant'));
    resTable = JSON.parse(localStorage.getItem('selectedTable'));
    resMembers = parseInt(localStorage.getItem('memberCount')) || 2;
    if (!resRestaurant || !resTable) { window.navigateTo('restaurants'); return; }
    renderReservation();
}

function confirmReservation() {
    if (!selectedDate) { showNotification('Select date', 'warning'); return; }
    if (!selectedTime) { showNotification('Select time', 'warning'); return; }
    const booking = { id: 'RES' + Date.now(), restaurant: resRestaurant.name, table: resTable.number, capacity: resTable.capacity, members: resMembers, date: selectedDate, time: selectedTime, status: 'confirmed' };
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    let user = JSON.parse(localStorage.getItem('user')) || { loyaltyPoints: 100 };
    user.loyaltyPoints += 20;
    localStorage.setItem('user', JSON.stringify(user));
    showNotification(`Table reserved! ID: ${booking.id}`);
    setTimeout(() => window.navigateTo('profile'), 1500);
}

function renderReservation() {
    const times = ['12:00 PM', '1:00 PM', '2:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];
    const container = document.getElementById('reservationContent');
    if (!container) return;
    container.innerHTML = `
        <h1>Complete Your Reservation</h1>
        <div style="background:rgba(255,255,255,0.05);border-radius:16px;padding:1.5rem;margin:1rem 0"><h3>${resRestaurant.name}</h3><p>${resRestaurant.address}</p><p>Table: ${resTable.number} (${resTable.capacity} seats)</p></div>
        <div class="member-selector"><span>Guests:</span><button class="member-btn" onclick="if(resMembers>1)resMembers--;document.getElementById('memberDisp').innerText=resMembers">-</button><span class="member-count" id="memberDisp">${resMembers}</span><button class="member-btn" onclick="resMembers++;document.getElementById('memberDisp').innerText=resMembers">+</button></div>
        <div class="form-group"><label>Date</label><input type="date" class="form-input" id="resDate" min="${new Date().toISOString().split('T')[0]}" onchange="selectedDate=this.value"></div>
        <div class="form-group"><label>Time</label><div class="time-slots">${times.map(t => `<div class="time-slot" onclick="selectedTime='${t}';document.querySelectorAll('.time-slot').forEach(s=>s.classList.remove('selected'));this.classList.add('selected')">${t}</div>`).join('')}</div></div>
        <div style="display:flex;gap:1rem;margin-top:1rem"><button class="btn-primary" onclick="window.navigateTo('restaurants')" style="background:rgba(255,255,255,0.1)">Back</button><button class="btn-primary" onclick="confirmReservation()">Confirm Reservation</button></div>
    `;
}

function TableReservationPage() { setTimeout(() => loadReservation(), 100); return `<div id="reservationContent"><div class="loading">Loading...</div></div>`; }