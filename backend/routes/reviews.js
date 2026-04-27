const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Submit a review
router.post('/submit', protect, async (req, res) => {
  try {
    const { restaurantId, orderId, rating, title, description, images, tags } = req.body;
    
    // Verify order belongs to user and is delivered
    const order = await Order.findOne({ _id: orderId, userId: req.user.id });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, error: 'Can only review delivered orders' });
    }
    
    // Check if already reviewed
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res.status(400).json({ success: false, error: 'Already reviewed this order' });
    }
    
    // Calculate points
    let pointsAwarded = 10;
    if (description.length >= 100) pointsAwarded += 20;
    else if (description.length >= 50) pointsAwarded += 10;
    if (rating >= 4) pointsAwarded += 10;
    if (images && images.length > 0) pointsAwarded += 15;
    
    const review = new Review({
      userId: req.user.id,
      restaurantId,
      orderId,
      rating,
      title,
      description,
      images: images || [],
      tags: tags || [],
      pointsAwarded,
      isVerified: true
    });
    
    await review.save();
    
    // Award points to user
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { loyaltyPoints: pointsAwarded }
    });
    
    // Update restaurant rating
    const restaurant = await Restaurant.findById(restaurantId);
    const newRating = (restaurant.rating * restaurant.totalReviews + rating) / (restaurant.totalReviews + 1);
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: Number(newRating.toFixed(1)),
      $inc: { totalReviews: 1 }
    });
    
    res.status(201).json({
      success: true,
      review,
      pointsEarned: pointsAwarded,
      message: `You earned ${pointsAwarded} loyalty points!`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get reviews for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const reviews = await Review.find({ restaurantId, isVerified: true })
      .populate('userId', 'name avatar loyaltyPoints')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const total = await Review.countDocuments({ restaurantId, isVerified: true });
    
    res.json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's reviews
router.get('/my-reviews', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .populate('restaurantId', 'name coverImage')
      .sort('-createdAt');
    
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;