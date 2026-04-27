let allRestaurants = [...restaurantsData];
let currentFilters = { search: '', cuisine: '', sort: 'rating' };

function filterRestaurants() {
    let filtered = [...restaurantsData];
    if (currentFilters.search) filtered = filtered.filter(r => r.name.toLowerCase().includes(currentFilters.search) || r.cuisine.some(c => c.toLowerCase().includes(currentFilters.search)));
    if (currentFilters.cuisine) filtered = filtered.filter(r => r.cuisine.includes(currentFilters.cuisine));
    if (currentFilters.sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (currentFilters.sort === 'distance') filtered.sort((a, b) => a.distance - b.distance);
    else if (currentFilters.sort === 'price') filtered.sort((a, b) => a.priceForTwo - b.priceForTwo);
    allRestaurants = filtered;
    renderRestaurants();
}

function renderRestaurants() {
    const container = document.getElementById('restaurantsGrid');
    if (!container) return;
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    container.innerHTML = allRestaurants.map(r => RestaurantCard(r, wishlist.includes(r.id), window.addToCartFromRestaurant, window.viewRestaurantDetail, window.toggleWishlist)).join('');
    if (allRestaurants.length === 0) container.innerHTML = '<div style="text-align:center;padding:4rem"><i class="fas fa-search" style="font-size:3rem"></i><h3>No restaurants found</h3></div>';
}

function toggleWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (wishlist.includes(id)) wishlist = wishlist.filter(i => i !== id);
    else wishlist.push(id);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderRestaurants();
}

function addToCartFromRestaurant(restaurant) { addToCart({ id: restaurant.id, name: `${restaurant.name} Meal`, price: restaurant.priceForTwo, quantity: 1, image: restaurant.image }); }
function viewRestaurantDetail(id) { window.selectedRestaurantId = id; window.navigateTo('restaurantDetail'); }

function RestaurantsPage() {
    setTimeout(() => {
        const searchInput = document.getElementById('restaurantSearch');
        const cuisineSelect = document.getElementById('cuisineFilter');
        const sortSelect = document.getElementById('sortFilter');
        if (searchInput) searchInput.oninput = (e) => { currentFilters.search = e.target.value.toLowerCase(); filterRestaurants(); };
        if (cuisineSelect) cuisineSelect.onchange = (e) => { currentFilters.cuisine = e.target.value; filterRestaurants(); };
        if (sortSelect) sortSelect.onchange = (e) => { currentFilters.sort = e.target.value; filterRestaurants(); };
        filterRestaurants();
    }, 100);
    return `
        <div class="search-section">
            <div class="search-bar"><input type="text" class="search-input" id="restaurantSearch" placeholder="Search restaurants..."><button class="search-btn"><i class="fas fa-search"></i> Search</button></div>
            <div class="filters">
                <select class="filter-select" id="cuisineFilter"><option value="">All Cuisines</option><option value="Indian">Indian</option><option value="Italian">Italian</option><option value="Chinese">Chinese</option><option value="Japanese">Japanese</option></select>
                <select class="filter-select" id="sortFilter"><option value="rating">Sort by Rating</option><option value="distance">Sort by Distance</option><option value="price">Sort by Price</option></select>
            </div>
        </div>
        <div id="restaurantsGrid" class="restaurant-grid"><div class="loading">Loading restaurants...</div></div>
    `;
}