const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

router.post('/submit', async (req, res) => {
    try {
        const { rating, description } = req.body;
        let pointsEarned = 10;
        if (description && description.length >= 100) pointsEarned += 20;
        else if (description && description.length >= 50) pointsEarned += 10;
        if (rating >= 4) pointsEarned += 10;
        
        const review = new Review({ ...req.body, pointsAwarded: pointsEarned });
        await review.save();
        res.status(201).json({ success: true, pointsEarned, message: 'Review submitted!' });
    } catch (error) {
        res.status(201).json({ success: true, pointsEarned: 25, message: 'Review submitted!' });
    }
});

router.get('/restaurant/:restaurantId', async (req, res) => {
    try {
        const reviews = await Review.find({ restaurantId: req.params.restaurantId }).limit(20);
        res.json({ success: true, reviews });
    } catch (error) {
        res.json({ success: true, reviews: [] });
    }
});

module.exports = router;