const events = [
    { id: 1, name: "Chef's Table Experience", description: "7-course tasting menu", price: 2500, date: "2024-12-15", time: "7:00 PM", venue: "Biryani House", availableSeats: 15, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500", type: "Fine Dining" },
    { id: 2, name: "Wine & Dine Festival", description: "International wine tasting", price: 3500, date: "2024-12-20", time: "6:00 PM", venue: "Pizza Paradise", availableSeats: 42, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500", type: "Festival" },
    { id: 3, name: "Street Food Carnival", description: "50+ street food stalls", price: 500, date: "2025-01-05", time: "12:00 PM", venue: "Spice Garden", availableSeats: 200, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500", type: "Carnival" }
];

function bookEvent() { showNotification('Booking coming soon!'); }

function EventsPage() {
    return `
        <div class="hero" style="padding:3rem"><h1>Upcoming Food Events</h1><p>Discover chef tables, tasting menus, and food festivals</p></div>
        <div class="restaurant-grid">${events.map(e => `
            <div class="restaurant-card"><div class="restaurant-image" style="background-image:url('${e.image}');height:200px"><div class="restaurant-status" style="background:var(--info)">${e.type}</div><div class="distance-badge">🎟️ ${e.availableSeats} seats left</div></div>
            <div class="restaurant-info"><div class="restaurant-name">${e.name}</div><div class="restaurant-cuisine">${e.venue}</div><div class="restaurant-meta"><div><i class="fas fa-calendar"></i> ${new Date(e.date).toLocaleDateString()}</div><div><i class="fas fa-clock"></i> ${e.time}</div></div><div>💰 ₹${e.price}/person</div>
            <button class="btn-delivery" onclick="bookEvent()">Book Now</button></div></div>`).join('')}</div>
    `;
}