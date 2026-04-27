const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:orderId/track', protect, trackOrder);
router.get('/:orderId', protect, getOrderById);
router.put('/:orderId/status', protect, authorize('restaurant_owner', 'delivery_partner', 'admin'), updateOrderStatus);
router.put('/:orderId/cancel', protect, cancelOrder);

module.exports = router;