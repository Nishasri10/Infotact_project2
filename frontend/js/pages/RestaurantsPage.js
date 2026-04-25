// Restaurants Page Component
let allRestaurants = [];
let filters = {
    search: '',
    cuisine: '',
    sortBy: 'rating'
};

async function loadRestaurants() {
    // Get user's location (mock for now)
    const lat = 28.6139;
    const lng = 77.2090;
    
    const result = await API.restaurants.getNearby(lat, lng);
    if (result.success) {
        allRestaurants = result.restaurants;
        renderRestaurantsList();
    } else {
        // Use mock data if API fails
        allRestaurants = [
            { id: 1, name: "Biryani House", cuisine: ["Indian"], rating: 4.7, distance: 1.2, deliveryTime: "25-35 min", priceForTwo: 600, isOpen: true, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500" },
            { id: 2, name: "Pizza Paradise", cuisine: ["Italian"], rating: 4.5, distance: 2.1, deliveryTime: "30-40 min", priceForTwo: 800, isOpen: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500" },
            { id: 3, name: "Sushi Master", cuisine: ["Japanese"], rating: 4.9, distance: 0.8, deliveryTime: "20-30 min", priceForTwo: 1200, isOpen: true, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500" }
        ];
        renderRestaurantsList();
    }
}

function renderRestaurantsList() {
    let filtered = [...allRestaurants];
    
    if (filters.search) {
        filtered = filtered.filter(r => 
            r.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            (r.cuisine && r.cuisine.some(c => c.toLowerCase().includes(filters.search.toLowerCase())))
        );
    }
    
    if (filters.cuisine) {
        filtered = filtered.filter(r => r.cuisine && r.cuisine.includes(filters.cuisine));
    }
    
    if (filters.sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'distance') {
        filtered.sort((a, b) => a.distance - b.distance);
    }
    
    const container = document.getElementById('restaurantsList');
    if (container) {
        container.innerHTML = filtered.map(r => RestaurantCard(r, addToCart, showReserveMessage)).join('');
    }
}

function showReserveMessage() {
    showNotification('Table reservation feature coming soon!');
}

function RestaurantsPage() {
    setTimeout(() => {
        loadRestaurants();
        
        // Setup search inputs
        const searchInput = document.getElementById('restaurantSearch');
        if (searchInput) {
            searchInput.oninput = (e) => {
                filters.search = e.target.value;
                renderRestaurantsList();
            };
        }
        
        const cuisineFilter = document.getElementById('cuisineFilter');
        if (cuisineFilter) {
            cuisineFilter.onchange = (e) => {
                filters.cuisine = e.target.value;
                renderRestaurantsList();
            };
        }
        
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.onchange = (e) => {
                filters.sortBy = e.target.value;
                renderRestaurantsList();
            };
        }
    }, 100);
    
    return `
        <div class="search-section">
            <div class="search-bar">
                <input type="text" class="search-input" id="restaurantSearch" placeholder="Search restaurants, cuisines...">
                <button class="search-btn" onclick="document.getElementById('restaurantSearch').dispatchEvent(new Event('input'))">Search</button>
            </div>
            <div class="filters">
                <select class="filter-select" id="cuisineFilter">
                    <option value="">All Cuisines</option>
                    <option value="Indian">Indian</option>
                    <option value="Italian">Italian</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Mexican">Mexican</option>
                </select>
                <select class="filter-select" id="sortFilter">
                    <option value="rating">Sort by Rating</option>
                    <option value="distance">Sort by Distance</option>
                </select>
            </div>
        </div>
        <div id="restaurantsList" class="restaurant-grid">
            <div class="loading">Loading restaurants...</div>
        </div>
    `;
}