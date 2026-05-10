const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');

// Sample data
const sampleRestaurants = [
    { id: 1, name: "Biryani House", cuisine: ["Indian"], rating: 4.7, distance: 1.2, deliveryTime: "25-35 min", priceForTwo: 600, isOpen: true, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500" },
    { id: 2, name: "Pizza Paradise", cuisine: ["Italian"], rating: 4.5, distance: 2.1, deliveryTime: "30-40 min", priceForTwo: 800, isOpen: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500" },
    { id: 3, name: "Sushi Master", cuisine: ["Japanese"], rating: 4.9, distance: 0.8, deliveryTime: "20-30 min", priceForTwo: 1200, isOpen: true, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500" }
];

router.get('/nearby', async (req, res) => {
    try {
        const restaurants = await Restaurant.find().limit(20);
        if (restaurants.length > 0) {
            return res.json({ success: true, restaurants });
        }
        res.json({ success: true, restaurants: sampleRestaurants });
    } catch (error) {
        res.json({ success: true, restaurants: sampleRestaurants });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (restaurant) {
            return res.json({ success: true, restaurant });
        }
        const sample = sampleRestaurants.find(r => r.id == req.params.id);
        res.json({ success: true, restaurant: sample || sampleRestaurants[0] });
    } catch (error) {
        const sample = sampleRestaurants.find(r => r.id == req.params.id);
        res.json({ success: true, restaurant: sample || sampleRestaurants[0] });
    }
});

router.get('/:id/menu', async (req, res) => {
    const menu = [
        { id: 1, name: "Chicken Biryani", price: 250, category: "Main Course", isVeg: false, popular: true },
        { id: 2, name: "Margherita Pizza", price: 350, category: "Pizza", isVeg: true, popular: true },
        { id: 3, name: "California Roll", price: 450, category: "Sushi", isVeg: false, popular: true }
    ];
    res.json({ success: true, menu });
});

module.exports = router;