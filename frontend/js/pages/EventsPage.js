// Events Page Component
let upcomingEvents = [];

async function loadEvents() {
    const result = await API.events.getUpcoming();
    if (result.success) {
        upcomingEvents = result.events || [];
    } else {
        // Mock events
        upcomingEvents = [
            { name: "Chef's Table Experience", description: "Exclusive 7-course tasting menu", price: 2500, date: new Date('2024-12-15'), availableSeats: 15, totalSeats: 25 },
            { name: "Wine & Dine Festival", description: "International wine tasting", price: 3500, date: new Date('2024-12-20'), availableSeats: 42, totalSeats: 100 }
        ];
    }
    renderEventsList();
}

function renderEventsList() {
    const container = document.getElementById('eventsList');
    if (!container) return;
    
    if (upcomingEvents.length === 0) {
        container.innerHTML = '<div class="loading">No upcoming events found</div>';
        return;
    }
    
    container.innerHTML = upcomingEvents.map(event => `
        <div class="restaurant-card">
            <div class="restaurant-info">
                <div class="restaurant-name">${event.name}</div>
                <div class="restaurant-cuisine">${event.description || 'Special event'}</div>
                <div class="restaurant-meta">
                    <div>📅 ${new Date(event.date).toLocaleDateString()}</div>
                    <div>🎟️ ${event.availableSeats || event.totalSeats} seats left</div>
                    <div>💰 ₹${event.price}</div>
                </div>
                <button class="btn-delivery" onclick="bookEvent('${event._id}')">
                    Book Tickets →
                </button>
            </div>
        </div>
    `).join('');
}

async function bookEvent(eventId) {
    if (!window.currentUser) {
        showNotification('Please login to book events', 'warning');
        window.handleAuth();
        return;
    }
    
    const tickets = prompt('How many tickets would you like to book?', '1');
    if (tickets && parseInt(tickets) > 0) {
        const result = await API.events.bookTicket(eventId, parseInt(tickets), window.currentUser.token);
        if (result.success) {
            showNotification(`Successfully booked ${tickets} ticket(s)!`);
            loadEvents();
        } else {
            showNotification(result.error || 'Booking failed', 'error');
        }
    }
}

function EventsPage() {
    setTimeout(() => loadEvents(), 100);
    
    return `
        <div class="hero">
            <h1>Upcoming Food Events</h1>
            <p>Discover chef tables, tasting menus, and food festivals</p>
        </div>
        <div id="eventsList" class="restaurant-grid">
            <div class="loading">Loading events...</div>
        </div>
    `;
}