const Review = require('../models/Review');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const PointsCalculator = require('../utils/pointsCalculator');

// @desc    Submit a review
// @route   POST /api/reviews/submit
// @access  Private
exports.submitReview = async (req, res) => {
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
    
    // Calculate points based on review quality
    const pointsAwarded = PointsCalculator.calculateReviewPoints({
      description,
      rating,
      title,
      images: images || [],
      isVerified: true
    });
    
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
    
    // Mark order as reviewed
    order.reviewSubmitted = true;
    order.rating = rating;
    await order.save();
    
    res.status(201).json({
      success: true,
      review,
      pointsEarned: pointsAwarded,
      message: `Thank you for your review! You earned ${pointsAwarded} loyalty points.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
exports.getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 20, sort = 'recent' } = req.query;
    
    let sortOption = {};
    if (sort === 'recent') sortOption = { createdAt: -1 };
    else if (sort === 'rating_high') sortOption = { rating: -1 };
    else if (sort === 'rating_low') sortOption = { rating: 1 };
    else if (sort === 'helpful') sortOption = { 'helpful.count': -1 };
    
    const reviews = await Review.find({ restaurantId, isVerified: true })
      .populate('userId', 'name avatar loyaltyPoints')
      .sort(sortOption)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const total = await Review.countDocuments({ restaurantId, isVerified: true });
    
    // Calculate rating distribution
    const distribution = await Review.aggregate([
      { $match: { restaurantId: mongoose.Types.ObjectId(restaurantId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      distribution,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .populate('restaurantId', 'name coverImage')
      .sort('-createdAt');
    
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:reviewId/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    // Check if user already marked as helpful
    if (review.helpful.users.includes(req.user.id)) {
      return res.status(400).json({ success: false, error: 'Already marked as helpful' });
    }
    
    review.helpful.count += 1;
    review.helpful.users.push(req.user.id);
    await review.save();
    
    res.json({ success: true, helpfulCount: review.helpful.count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get AI review suggestions
// @route   GET /api/reviews/suggestions/:orderId
// @access  Private
exports.getAISuggestions = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('items.menuItemId');
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Generate AI-powered suggestions based on order items
    const suggestions = [];
    const templates = [
      "The {item} was absolutely delicious! The {flavor} flavor was perfect.",
      "I ordered the {item} and it exceeded my expectations. {highlight} was amazing.",
      "The {item} came nicely packaged and still hot. Will definitely order again!",
      "A bit disappointed with the {item}, it could have been {improvement}.",
      "Value for money: The {item} portion size was generous for the price."
    ];
    
    const flavors = ['spicy', 'savory', 'sweet', 'tangy', 'rich', 'creamy'];
    const highlights = ['The freshness', 'The seasoning', 'The presentation', 'The portion size'];
    const improvements = ['more flavorful', 'less oily', 'better presented', 'warmer'];
    
    order.items.forEach((item, index) => {
      if (index < 3) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        let suggestion = template
          .replace('{item}', item.name)
          .replace('{flavor}', flavors[Math.floor(Math.random() * flavors.length)])
          .replace('{highlight}', highlights[Math.floor(Math.random() * highlights.length)])
          .replace('{improvement}', improvements[Math.floor(Math.random() * improvements.length)]);
        
        suggestions.push({
          item: item.name,
          suggestion,
          emoji: getEmojiForItem(item.name)
        });
      }
    });
    
    res.json({
      success: true,
      suggestions,
      tips: [
        "📝 Write at least 100 characters for 20 bonus points!",
        "📸 Add photos to earn an extra 15 points",
        "⭐ 4-5 star ratings get 10 bonus points",
        "🏆 Become a top reviewer to earn 100 points monthly"
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

function getEmojiForItem(itemName) {
  const categories = {
    pizza: '🍕', burger: '🍔', sushi: '🍣', curry: '🍛',
    pasta: '🍝', dessert: '🍰', coffee: '☕', drink: '🥤',
    salad: '🥗', soup: '🥣', rice: '🍚', chicken: '🍗'
  };
  for (const [key, emoji] of Object.entries(categories)) {
    if (itemName.toLowerCase().includes(key)) return emoji;
  }
  return '🍽️';
}

const mongoose = require('mongoose');