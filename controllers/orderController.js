const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// @desc    Create new order
// @route   POST /api/orders/create
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      userId: req.user.id,
      status: 'pending',
      paymentStatus: 'pending'
    };
    
    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderData.subtotal = subtotal;
    orderData.totalAmount = subtotal + (orderData.deliveryFee || 0) + (orderData.tax || 0) - (orderData.discount || 0);
    
    const order = new Order(orderData);
    await order.save();
    
    // Update user's loyalty points
    const pointsEarned = Math.floor(order.totalAmount / 20);
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { loyaltyPoints: pointsEarned }
    });
    
    // Get io instance for real-time notification
    const io = req.app.get('io');
    io.to(`restaurant_${order.restaurantId}`).emit('new-order', {
      orderId: order.orderId,
      restaurantId: order.restaurantId,
      timestamp: new Date()
    });
    
    res.status(201).json({
      success: true,
      order,
      pointsEarned
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('restaurantId', 'name coverImage address')
      .sort('-createdAt')
      .limit(50);
    
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:orderId
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('restaurantId', 'name address contactNumber coverImage')
      .populate('deliveryPartnerId', 'name phone');
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Check if user owns the order or is admin/restaurant owner
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Track order
// @route   GET /api/orders/:orderId/track
// @access  Private
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .select('orderId status estimatedDeliveryTime deliveryLocation');
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({
      success: true,
      tracking: {
        orderId: order.orderId,
        status: order.status,
        estimatedDelivery: order.estimatedDeliveryTime,
        currentLocation: order.deliveryLocation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update order status (Restaurant/Delivery)
// @route   PUT /api/orders/:orderId/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, estimatedTime } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    order.status = status;
    if (estimatedTime) order.estimatedDeliveryTime = estimatedTime;
    if (status === 'delivered') order.actualDeliveryTime = new Date();
    
    await order.save();
    
    // Emit socket event for real-time tracking
    const io = req.app.get('io');
    io.to(`order_${order.orderId}`).emit('order-status-updated', {
      orderId: order.orderId,
      status: order.status,
      estimatedTime: order.estimatedDeliveryTime,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      order: {
        orderId: order.orderId,
        status: order.status,
        estimatedDeliveryTime: order.estimatedDeliveryTime
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:orderId/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId, userId: req.user.id });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({ success: false, error: 'Order cannot be cancelled at this stage' });
    }
    
    order.status = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by user';
    await order.save();
    
    // Refund loyalty points if used
    if (order.loyaltyPointsUsed > 0) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { loyaltyPoints: order.loyaltyPointsUsed }
      });
    }
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: { orderId: order.orderId, status: order.status }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};