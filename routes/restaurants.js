const express = require('express');
const router = express.Router();
const {
  getNearbyRestaurants,
  getRestaurantById,
  searchRestaurants,
  getRestaurantMenu,
  updateRestaurantStatus,
  updateMenuItem
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');

router.get('/nearby', getNearbyRestaurants);
router.get('/search', searchRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/menu', getRestaurantMenu);
router.put('/:id/status', protect, authorize('restaurant_owner', 'admin'), updateRestaurantStatus);
router.put('/:id/menu/:itemId', protect, authorize('restaurant_owner', 'admin'), updateMenuItem);

module.exports = router;