// Configuration file
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api',
    WS_URL: 'ws://localhost:5000',
    APP_NAME: 'HospitalityHub',
    VERSION: '1.0.0'
};

// Mock data for when backend is not available
const MOCK_RESTAURANTS = [
    { id: 1, name: "Biryani House", cuisine: ["Indian", "Mughlai"], rating: 4.7, distance: 1.2, deliveryTime: "25-35 min", priceForTwo: 600, isOpen: true, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500" },
    { id: 2, name: "Pizza Paradise", cuisine: ["Italian", "American"], rating: 4.5, distance: 2.1, deliveryTime: "30-40 min", priceForTwo: 800, isOpen: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500" },
    { id: 3, name: "Sushi Master", cuisine: ["Japanese", "Asian"], rating: 4.9, distance: 0.8, deliveryTime: "20-30 min", priceForTwo: 1200, isOpen: true, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500" },
    { id: 4, name: "Spice Garden", cuisine: ["Indian", "South Indian"], rating: 4.6, distance: 1.5, deliveryTime: "25-35 min", priceForTwo: 500, isOpen: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500" },
    { id: 5, name: "Dragon Wok", cuisine: ["Chinese", "Thai"], rating: 4.4, distance: 2.5, deliveryTime: "35-45 min", priceForTwo: 700, isOpen: false, image: "https://images.unsplash.com/photo-1563241527-3004b7be0f6a?w=500" },
    { id: 6, name: "Cafe Arabia", cuisine: ["Middle Eastern"], rating: 4.3, distance: 1.8, deliveryTime: "30-40 min", priceForTwo: 900, isOpen: true, image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500" }
];