// Helper functions for events
function getUpcomingEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventsData.filter(event => new Date(event.date) >= today);
}

function getPastEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventsData.filter(event => new Date(event.date) < today);
}

// Reminder functions
function setEventReminder(eventId, eventName, eventDate, eventTime) {
    const reminder = {
        id: Date.now(),
        eventId: eventId,
        eventName: eventName,
        eventDate: eventDate,
        eventTime: eventTime,
        reminderSet: true,
        createdAt: new Date().toISOString()
    };
    
    let reminders = JSON.parse(localStorage.getItem('event_reminders') || '[]');
    // Check if reminder already exists for this event
    const existing = reminders.find(r => r.eventId === eventId);
    if (!existing) {
        reminders.push(reminder);
        localStorage.setItem('event_reminders', JSON.stringify(reminders));
        showNotification(`✅ Reminder set for ${eventName}!`, 'success');
        
        // Schedule browser notification (if permission granted)
        scheduleBrowserNotification(eventName, eventDate, eventTime);
    } else {
        showNotification(`⏰ Reminder already set for this event!`, 'warning');
    }
}

function scheduleBrowserNotification(eventName, eventDate, eventTime) {
    if (Notification.permission === 'granted') {
        const eventDateTime = new Date(`${eventDate}T${eventTime}`);
        const now = new Date();
        const timeUntil = eventDateTime - now;
        
        // Schedule notification 1 hour before event
        if (timeUntil > 3600000) {
            setTimeout(() => {
                new Notification(`🎉 Event Reminder: ${eventName}`, {
                    body: `Your event starts at ${eventTime} on ${new Date(eventDate).toLocaleDateString()}`,
                    icon: 'https://img.icons8.com/color/48/restaurant.png'
                });
            }, timeUntil - 3600000);
        }
    }
}

function getEventReminders() {
    return JSON.parse(localStorage.getItem('event_reminders') || '[]');
}

function removeEventReminder(reminderId, eventName) {
    let reminders = JSON.parse(localStorage.getItem('event_reminders') || '[]');
    reminders = reminders.filter(r => r.id !== reminderId);
    localStorage.setItem('event_reminders', JSON.stringify(reminders));
    showNotification(`🔔 Removed reminder for ${eventName}`, 'info');
    renderEventsPage(); // Refresh the page
}

// Main render function
function renderEventsPage() {
    const container = document.getElementById('pageContent');
    const upcomingEvents = getUpcomingEvents();
    const pastEvents = getPastEvents();
    const reminders = getEventReminders();
    
    // Request notification permission on page load
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    container.innerHTML = `
        <div class="hero" style="padding:2rem;margin-bottom:1rem;background:linear-gradient(135deg, rgba(255,71,87,0.2), rgba(255,165,2,0.1))">
            <h1><i class="fas fa-calendar-alt"></i> <span>Food Events</span> & Experiences</h1>
            <p>Discover chef tables, tasting menus, workshops, and food festivals</p>
            <div style="display:flex;gap:1rem;justify-content:center;margin-top:1rem;flex-wrap:wrap">
                <span class="stat-card" style="padding:0.5rem 1rem"><i class="fas fa-ticket-alt"></i> ${upcomingEvents.length} Upcoming</span>
                <span class="stat-card" style="padding:0.5rem 1rem"><i class="fas fa-users"></i> 5000+ Attendees</span>
                <span class="stat-card" style="padding:0.5rem 1rem"><i class="fas fa-star"></i> 4.8★ Rating</span>
            </div>
        </div>
        
        <!-- My Bookings Summary Card -->
        <div style="background:linear-gradient(135deg, rgba(255,71,87,0.15), rgba(255,165,2,0.08));border-radius:16px;padding:1.5rem;margin-bottom:2rem">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
                <div>
                    <h3><i class="fas fa-ticket-alt"></i> My Bookings</h3>
                    <p style="font-size:0.9rem;color:var(--gray);margin-top:0.25rem">You have booked ${bookedEvents.length} event(s)</p>
                </div>
                <div style="display:flex;gap:2rem;flex-wrap:wrap">
                    <div><i class="fas fa-calendar"></i> <strong>${bookedEvents.filter(b => new Date(b.date) >= new Date()).length}</strong> Upcoming</div>
                    <div><i class="fas fa-check-circle"></i> <strong>${bookedEvents.filter(b => new Date(b.date) < new Date()).length}</strong> Completed</div>
                    <div><i class="fas fa-bell"></i> <strong>${reminders.length}</strong> Reminders Set</div>
                </div>
            </div>
        </div>
        
        <div class="section-title">
            <i class="fas fa-clock" style="color:var(--success)"></i> Upcoming Events (${upcomingEvents.length})
        </div>
        <div class="food-grid" id="eventsGrid"></div>
        
        ${pastEvents.length > 0 ? `
            <div class="section-title" style="margin-top:2rem;cursor:pointer" onclick="togglePastEvents()">
                <i class="fas fa-history" style="color:var(--gray)"></i> Past Events (${pastEvents.length}) 
                <i class="fas fa-chevron-down" id="pastEventsToggleIcon" style="font-size:0.8rem;margin-left:0.5rem"></i>
            </div>
            <div id="pastEventsContainer" style="display:none">
                <div class="food-grid" id="pastEventsGrid"></div>
            </div>
        ` : ''}
        
        <div class="section-title" style="margin-top:2rem">
            <i class="fas fa-ticket-alt" style="color:var(--primary)"></i> My Event Bookings (${bookedEvents.length})
        </div>
        <div id="bookingsContainer" class="dashboard-container"></div>
        
        <div class="section-title" style="margin-top:2rem">
            <i class="fas fa-bell" style="color:var(--warning)"></i> My Reminders (${reminders.length})
        </div>
        <div id="remindersContainer" class="dashboard-container"></div>
    `;
    
    // Render upcoming events grid
    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = upcomingEvents.map(event => {
        const daysUntil = Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24));
        const discountPercent = event.discountedPrice ? Math.round((1 - event.discountedPrice/event.price) * 100) : 0;
        const seatPercentage = (event.availableSeats / event.totalSeats) * 100;
        const isLowStock = event.availableSeats <= 10;
        const hasReminder = reminders.some(r => r.eventId === event.id);
        
        return `
            <div class="food-card" style="position:relative;overflow:hidden">
                ${isLowStock ? `<div style="position:absolute;top:10px;right:-30px;background:var(--danger);color:white;padding:5px 40px;transform:rotate(45deg);font-size:12px;font-weight:bold;z-index:10">HURRY!</div>` : ''}
                <div class="food-image" style="background-image:url('${event.image}');height:220px">
                    <div class="food-badge" style="background:var(--primary)">${event.type}</div>
                    <div class="food-badge" style="left:auto;right:1rem;background:${isLowStock ? 'var(--danger)' : 'var(--warning)'}">
                        ${event.availableSeats} seats left
                    </div>
                    ${discountPercent > 0 ? `<div class="food-badge" style="top:auto;bottom:1rem;left:1rem;background:var(--success)">🔥 ${discountPercent}% OFF</div>` : ''}
                    <div class="food-badge" style="top:auto;bottom:1rem;right:1rem;background:rgba(0,0,0,0.7)">
                        ${daysUntil > 0 ? `📅 In ${daysUntil} days` : '🎉 Today!'}
                    </div>
                </div>
                <div class="food-info">
                    <div class="food-name">${event.name}</div>
                    <div class="food-desc">${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</div>
                    <div class="food-meta">
                        <div><i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div><i class="fas fa-clock"></i> ${event.time}</div>
                    </div>
                    <div class="food-meta">
                        <div><i class="fas fa-map-marker-alt"></i> ${event.venue}</div>
                        <div><i class="fas fa-clock"></i> ${event.duration}</div>
                    </div>
                    <div class="food-meta">
                        <div class="rating"><i class="fas fa-star"></i> ${event.rating} (${event.reviews} reviews)</div>
                        <div><i class="fas fa-chef-hat"></i> ${event.chef}</div>
                    </div>
                    <div class="price" style="font-size:1.2rem;margin:0.5rem 0">
                        ${event.discountedPrice ? `
                            <span style="text-decoration:line-through;color:var(--gray);font-size:0.9rem">${formatPrice(event.price)}</span>
                            <span style="color:var(--primary);margin-left:0.5rem">${formatPrice(event.discountedPrice)}</span>
                        ` : `<span style="color:var(--primary)">${formatPrice(event.price)}</span>`}
                        <span style="font-size:0.8rem;color:var(--gray)">/person</span>
                    </div>
                    
                    <!-- Seat Availability Bar -->
                    <div style="margin:0.5rem 0">
                        <div style="display:flex;justify-content:space-between;font-size:0.7rem;margin-bottom:0.2rem">
                            <span>Availability</span>
                            <span>${event.availableSeats}/${event.totalSeats} seats</span>
                        </div>
                        <div class="progress-bar" style="height:4px">
                            <div class="progress-fill" style="width: ${seatPercentage}%; background: ${isLowStock ? 'var(--danger)' : 'var(--success)'}"></div>
                        </div>
                    </div>
                    
                    <!-- What's Included Dropdown -->
                    <details style="margin:0.5rem 0">
                        <summary style="cursor:pointer;color:var(--primary);font-size:0.8rem">
                            <i class="fas fa-gift"></i> What's Included (${event.includes.length} items)
                        </summary>
                        <ul style="margin-top:0.5rem;padding-left:1rem;font-size:0.75rem">
                            ${event.includes.map(inc => `<li><i class="fas fa-check" style="color:var(--success);margin-right:0.5rem"></i> ${inc}</li>`).join('')}
                        </ul>
                    </details>
                    
                    <div style="display:flex;gap:0.5rem;margin-top:0.5rem">
                        <button class="btn-delivery" onclick="openEventBookingModal(${JSON.stringify(event).replace(/"/g, '&quot;')})" style="flex:2">
                            <i class="fas fa-ticket-alt"></i> Book Tickets
                        </button>
                        <button class="btn-view" onclick="setEventReminder(${event.id}, '${event.name}', '${event.date}', '${event.time}')" 
                            style="flex:1;background:${hasReminder ? 'var(--success)' : 'var(--info)'}">
                            <i class="fas fa-bell"></i> ${hasReminder ? 'Reminder Set' : 'Remind Me'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    if (upcomingEvents.length === 0) {
        eventsGrid.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-times" style="font-size:3rem"></i><h3>No upcoming events</h3><p>Check back later for new events!</p></div>';
    }
    
    // Render past events (only 5, minimized)
    if (pastEvents.length > 0) {
        const pastGrid = document.getElementById('pastEventsGrid');
        pastGrid.innerHTML = pastEvents.slice(0,5).map(event => `
            <div class="food-card" style="opacity:0.6;filter:grayscale(0.3)">
                <div class="food-image" style="background-image:url('${event.image}');height:180px">
                    <div class="food-badge" style="background:var(--gray)">Completed</div>
                    <div class="food-badge" style="left:auto;right:1rem;background:var(--gray)">Event Ended</div>
                </div>
                <div class="food-info">
                    <div class="food-name" style="font-size:1rem">${event.name}</div>
                    <div class="food-desc" style="font-size:0.75rem">${event.description.substring(0, 60)}...</div>
                    <div class="food-meta" style="font-size:0.7rem">
                        <div><i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}</div>
                        <div><i class="fas fa-map-marker-alt"></i> ${event.venue}</div>
                    </div>
                    <div class="price" style="text-decoration:line-through;color:var(--gray);font-size:0.9rem">${formatPrice(event.price)}</div>
                    <button class="btn-view" disabled style="opacity:0.5;cursor:not-allowed;width:100%;padding:0.4rem;font-size:0.7rem">Event Completed</button>
                </div>
            </div>
        `).join('');
    }
    
    // Render bookings
    const bookingsContainer = document.getElementById('bookingsContainer');
    if (bookedEvents.length === 0) {
        bookingsContainer.innerHTML = `
            <div class="empty-state" style="padding:2rem">
                <i class="fas fa-ticket-alt" style="font-size:3rem;color:var(--gray);margin-bottom:1rem"></i>
                <h3>No Bookings Yet</h3>
                <p>Book exciting food events above!</p>
            </div>
        `;
    } else {
        const totalSpent = bookedEvents.reduce((sum, b) => sum + b.totalPrice, 0);
        const totalPointsEarned = bookedEvents.reduce((sum, b) => sum + Math.floor(b.totalPrice / 20), 0);
        
        bookingsContainer.innerHTML = `
            <div style="background:linear-gradient(135deg, rgba(255,71,87,0.1), rgba(255,165,2,0.05));border-radius:16px;padding:1rem;margin-bottom:1rem">
                <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem">
                    <div><i class="fas fa-ticket"></i> Total Bookings: <strong>${bookedEvents.length}</strong></div>
                    <div><i class="fas fa-rupee-sign"></i> Total Spent: <strong>${formatPrice(totalSpent)}</strong></div>
                    <div><i class="fas fa-star"></i> Points Earned: <strong>${totalPointsEarned}</strong></div>
                </div>
            </div>
            ${bookedEvents.map(booking => {
                const event = eventsData.find(e => e.id === booking.eventId);
                const isUpcoming = new Date(booking.date) >= new Date();
                const eventDate = new Date(booking.date);
                const daysUntilEvent = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));
                const hasReminder = reminders.some(r => r.eventId === booking.eventId);
                
                return `
                    <div class="order-item" style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:1rem">
                        <div style="flex:2">
                            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap">
                                <strong style="font-size:1rem">${booking.eventName}</strong>
                                <span class="rating" style="font-size:0.7rem">⭐ ${event?.rating || '4.8'}</span>
                            </div>
                            <small><i class="fas fa-map-marker-alt"></i> ${booking.venue}</small><br>
                            <small><i class="fas fa-calendar"></i> ${new Date(booking.date).toLocaleDateString()} at ${booking.time}</small>
                            ${isUpcoming && daysUntilEvent > 0 ? `<small><br><i class="fas fa-hourglass-half"></i> ${daysUntilEvent} days to go!</small>` : ''}
                        </div>
                        <div style="text-align:center">
                            <div><i class="fas fa-ticket"></i> ${booking.tickets} ticket(s)</div>
                            <div class="price" style="font-size:1rem">${formatPrice(booking.totalPrice)}</div>
                            <div><small>ID: ${booking.id.slice(-8)}</small></div>
                        </div>
                        <div>
                            <span style="color:var(--success)"><i class="fas fa-check-circle"></i> Confirmed</span>
                            ${isUpcoming ? `
                                <button class="btn-view" style="background:${hasReminder ? 'var(--success)' : 'var(--info)'};margin-top:0.5rem;padding:0.3rem 0.8rem;font-size:0.7rem" 
                                    onclick="setEventReminder(${booking.eventId}, '${booking.eventName}', '${booking.date}', '${booking.time}')">
                                    <i class="fas fa-bell"></i> ${hasReminder ? 'Reminder Set' : 'Set Reminder'}
                                </button>
                                <button class="btn-view" style="background:var(--danger);margin-top:0.5rem;padding:0.3rem 0.8rem;font-size:0.7rem" 
                                    onclick="cancelEventBooking('${booking.id}')">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                            ` : '<span style="font-size:0.7rem;color:var(--gray);margin-top:0.5rem;display:block">Event Completed</span>'}
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }
    
    // Render reminders
    const remindersContainer = document.getElementById('remindersContainer');
    if (reminders.length === 0) {
        remindersContainer.innerHTML = `
            <div class="empty-state" style="padding:2rem">
                <i class="fas fa-bell-slash" style="font-size:3rem;color:var(--gray);margin-bottom:1rem"></i>
                <h3>No Reminders Set</h3>
                <p>Click "Remind Me" on any event to get notified before it starts!</p>
            </div>
        `;
    } else {
        remindersContainer.innerHTML = reminders.map(reminder => {
            const event = eventsData.find(e => e.id === reminder.eventId);
            const daysUntil = Math.ceil((new Date(reminder.eventDate) - new Date()) / (1000 * 60 * 60 * 24));
            
            return `
                <div class="order-item" style="display:flex;justify-content:space-between;align-items:center;padding:1rem;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:1rem">
                    <div>
                        <strong><i class="fas fa-bell" style="color:var(--warning)"></i> ${reminder.eventName}</strong><br>
                        <small><i class="fas fa-calendar"></i> ${new Date(reminder.eventDate).toLocaleDateString()} at ${reminder.eventTime}</small><br>
                        <small><i class="fas fa-clock"></i> Starts in ${daysUntil} days</small>
                    </div>
                    <div>
                        <button class="btn-view" style="background:var(--danger);padding:0.3rem 0.8rem" onclick="removeEventReminder(${reminder.id}, '${reminder.eventName}')">
                            <i class="fas fa-trash"></i> Remove Reminder
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Toggle past events visibility
function togglePastEvents() {
    const container = document.getElementById('pastEventsContainer');
    const icon = document.getElementById('pastEventsToggleIcon');
    if (container.style.display === 'none') {
        container.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
        icon.style.transition = 'transform 0.3s';
    } else {
        container.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}

// Event Booking Modal Functions
function openEventBookingModal(event) {
    selectedEvent = event;
    eventTicketCount = 1;
    
    const modal = document.getElementById('eventBookingModal');
    modal.classList.add('active');
    
    document.getElementById('eventTicketCount').innerText = eventTicketCount;
    document.getElementById('eventNameDisplay').innerText = event.name;
    document.getElementById('eventVenueDisplay').innerHTML = `${event.venue} | ${new Date(event.date).toLocaleDateString()} at ${event.time}`;
    document.getElementById('eventPriceDisplay').innerHTML = `${event.discountedPrice ? `<span style="text-decoration:line-through;color:var(--gray)">${formatPrice(event.price)}</span> ${formatPrice(event.discountedPrice)}` : formatPrice(event.price)} per person`;
    
    const total = (event.discountedPrice || event.price) * eventTicketCount;
    document.getElementById('eventTotalDisplay').innerText = formatPrice(total);
    document.getElementById('availableSeatsDisplay').innerHTML = `${event.availableSeats} seats available`;
    
    const includesHtml = event.includes.map(inc => `<div><i class="fas fa-check" style="color:var(--success);margin-right:0.5rem"></i> ${inc}</div>`).join('');
    document.getElementById('eventIncludes').innerHTML = includesHtml;
    document.getElementById('pointsTotalDisplay').innerHTML = `<span><i class="fas fa-star"></i> Points to earn:</span><span>${Math.floor(total / 20)} points</span>`;
    
    if (event.availableSeats <= 5) {
        document.getElementById('ticketWarning').style.display = 'block';
        document.getElementById('ticketWarning').innerHTML = `<i class="fas fa-exclamation-triangle"></i> Only ${event.availableSeats} seats left! Book soon!`;
    } else {
        document.getElementById('ticketWarning').style.display = 'none';
    }
}

function updateEventTicketCount(change) {
    const newCount = eventTicketCount + change;
    if (newCount >= 1 && newCount <= Math.min(selectedEvent.availableSeats, 10)) {
        eventTicketCount = newCount;
        document.getElementById('eventTicketCount').innerText = eventTicketCount;
        const total = (selectedEvent.discountedPrice || selectedEvent.price) * eventTicketCount;
        document.getElementById('eventTotalDisplay').innerText = formatPrice(total);
        document.getElementById('pointsTotalDisplay').innerHTML = `✨ You'll earn <strong>${Math.floor(total / 20)} points</strong> on this booking!`;
    }
}

function confirmEventBooking() {
    if (!currentUser || currentUser.name === 'Food Lover') {
        showNotification('Please login first!', 'warning');
        document.getElementById('eventBookingModal').classList.remove('active');
        handleAuth();
        return;
    }
    
    const alreadyBooked = bookedEvents.some(b => b.eventId === selectedEvent.id);
    if (alreadyBooked) {
        showNotification('You have already booked this event!', 'warning');
        document.getElementById('eventBookingModal').classList.remove('active');
        return;
    }
    
    const ticketCount = eventTicketCount;
    const totalPrice = (selectedEvent.discountedPrice || selectedEvent.price) * ticketCount;
    const pointsEarned = Math.floor(totalPrice / 20);
    
    if (confirm(`Confirm booking for ${selectedEvent.name}\n\nTickets: ${ticketCount}\nTotal: ${formatPrice(totalPrice)}\nPoints to earn: ${pointsEarned}`)) {
        const booking = {
            id: 'EVT' + Date.now(),
            eventId: selectedEvent.id,
            eventName: selectedEvent.name,
            venue: selectedEvent.venue,
            date: selectedEvent.date,
            time: selectedEvent.time,
            tickets: ticketCount,
            totalPrice: totalPrice,
            bookingDate: new Date().toISOString(),
            status: 'confirmed'
        };
        
        bookedEvents.push(booking);
        saveData();
        selectedEvent.availableSeats -= ticketCount;
        currentUser.points = (currentUser.points || 0) + pointsEarned;
        saveData();
        
        showNotification(`✅ Booked ${ticketCount} ticket(s) for ${selectedEvent.name}! Earned ${pointsEarned} points!`);
        document.getElementById('eventBookingModal').classList.remove('active');
        
        // Ask if user wants to set a reminder
        if (confirm('Would you like to set a reminder for this event?')) {
            setEventReminder(selectedEvent.id, selectedEvent.name, selectedEvent.date, selectedEvent.time);
        }
        
        if (currentPage === 'events') {
            renderEventsPage();
        }
    }
}

function cancelEventBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking? 50% points refund.')) {
        const bookingIndex = bookedEvents.findIndex(b => b.id === bookingId);
        if (bookingIndex !== -1) {
            const booking = bookedEvents[bookingIndex];
            const refundPoints = Math.floor(booking.totalPrice / 40);
            currentUser.points = (currentUser.points || 0) + refundPoints;
            bookedEvents.splice(bookingIndex, 1);
            saveData();
            showNotification(`Booking cancelled! Refunded ${refundPoints} points.`);
            if (currentPage === 'events') {
                renderEventsPage();
            }
        }
    }
}

// Make functions globally available
window.openEventBookingModal = openEventBookingModal;
window.updateEventTicketCount = updateEventTicketCount;
window.confirmEventBooking = confirmEventBooking;
window.cancelEventBooking = cancelEventBooking;
window.togglePastEvents = togglePastEvents;
window.setEventReminder = setEventReminder;
window.removeEventReminder = removeEventReminder;