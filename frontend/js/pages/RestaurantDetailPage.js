let currentRestaurant = null;
let selectedTable = null;
let memberCount = 2;

function loadRestaurantDetail() {
    currentRestaurant = restaurantsData.find(r => r.id == window.selectedRestaurantId);
    if (!currentRestaurant) { window.navigateTo('restaurants'); return; }
    renderRestaurantDetail();
}

function addMenuItemToCart(item) { addToCart({ id: item.id, name: item.name, price: item.price, quantity: 1, restaurantId: currentRestaurant.id }); showNotification(`${item.name} added to cart!`); }

function selectTable(table, element) {
    if (!table.isAvailable) { showNotification('Table not available!', 'warning'); return; }
    selectedTable = table;
    document.querySelectorAll('.table-card').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
}

function proceedToReservation() {
    if (!selectedTable) { showNotification('Please select a table!', 'warning'); return; }
    if (memberCount > selectedTable.capacity) { showNotification(`Table capacity is ${selectedTable.capacity} people!`, 'warning'); return; }
    localStorage.setItem('selectedRestaurant', JSON.stringify(currentRestaurant));
    localStorage.setItem('selectedTable', JSON.stringify(selectedTable));
    localStorage.setItem('memberCount', memberCount);
    window.navigateTo('tableReservation');
}

function renderRestaurantDetail() {
    const menuByCat = {};
    currentRestaurant.menu.forEach(item => { if (!menuByCat[item.category]) menuByCat[item.category] = []; menuByCat[item.category].push(item); });
    let menuHtml = '';
    for (let cat in menuByCat) {
        menuHtml += `<h3 style="color:var(--primary);margin-top:1.5rem;"><i class="fas fa-utensils"></i> ${cat}</h3><div class="menu-grid">`;
        menuHtml += menuByCat[cat].map(item => `
            <div class="menu-item-card"><div><h4>${item.name} ${item.popular ? '🔥' : ''}</h4><p>${item.description}</p><span class="${item.isVeg ? 'veg-badge' : 'non-veg-badge'}">${item.isVeg ? '🌱 Veg' : '🍖 Non-Veg'}</span></div>
            <div><div class="price">₹${item.price}</div><button class="add-btn" onclick="addMenuItemToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})">+ Add</button></div></div>
        `).join('');
        menuHtml += `</div>`;
    }
    const container = document.getElementById('restaurantDetailContent');
    if (container) container.innerHTML = `
        <div style="height:300px;background:url('${currentRestaurant.coverImage}') center/cover;border-radius:24px;position:relative;margin-bottom:2rem"><div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,#000);padding:2rem;border-radius:24px"><h1>${currentRestaurant.name}</h1><div class="rating">⭐ ${currentRestaurant.rating} (${currentRestaurant.totalReviews} reviews)</div><p><i class="fas fa-map-marker-alt"></i> ${currentRestaurant.address}</p></div></div>
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:2rem"><div><h2><i class="fas fa-utensils"></i> Full Menu</h2>${menuHtml}</div>
        <div><div style="background:rgba(255,255,255,0.05);border-radius:16px;padding:1.5rem"><h3><i class="fas fa-chair"></i> Reserve a Table</h3><div class="tables-grid">${currentRestaurant.tables.map(t => `<div class="table-card ${!t.isAvailable ? 'disabled' : ''}" onclick="selectTable(${JSON.stringify(t).replace(/"/g, '&quot;')}, this)"><div class="table-number">${t.number}</div><div><i class="fas fa-users"></i> ${t.capacity} seats</div><div>${t.isAvailable ? '✅ Available' : '❌ Booked'}</div></div>`).join('')}</div>
        <div class="member-selector"><span>Guests:</span><button class="member-btn" onclick="if(memberCount>1)memberCount--;document.getElementById('memberDisplay').innerText=memberCount">-</button><span class="member-count" id="memberDisplay">${memberCount}</span><button class="member-btn" onclick="memberCount++;document.getElementById('memberDisplay').innerText=memberCount">+</button></div>
        <button class="btn-primary" style="width:100%;margin-top:1rem" onclick="proceedToReservation()"><i class="fas fa-calendar-check"></i> Reserve Table</button></div></div></div>
        <div style="margin-top:2rem"><h2><i class="fas fa-comments"></i> Reviews</h2>${currentRestaurant.reviews.map(r => `<div style="background:rgba(255,255,255,0.03);padding:1rem;border-radius:12px;margin-bottom:1rem"><strong>${r.userName}</strong> <span style="color:#FFD700">${'★'.repeat(r.rating)}</span><div><strong>${r.title}</strong></div><p>${r.comment}</p><small>${r.date}</small></div>`).join('')}</div>
    `;
}

function RestaurantDetailPage() {
    setTimeout(() => loadRestaurantDetail(), 100);
    return `<button class="btn-primary" onclick="window.navigateTo('restaurants')" style="margin-bottom:1rem;background:rgba(255,255,255,0.1)"><i class="fas fa-arrow-left"></i> Back</button><div id="restaurantDetailContent"><div class="loading">Loading...</div></div>`;
}