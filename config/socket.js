const Order = require('../models/Order');

module.exports = (io) => {
  const activeConnections = new Map();
  
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);
    
    // User joins their order room
    socket.on('join-order', (orderId) => {
      socket.join(`order_${orderId}`);
      activeConnections.set(socket.id, { orderId, socketId: socket.id });
      console.log(`📦 Client ${socket.id} joined order: ${orderId}`);
      socket.emit('joined', { orderId, message: 'Successfully joined order tracking' });
    });
    
    // Restaurant updates order status
    socket.on('update-order-status', async (data) => {
      const { orderId, status, estimatedTime, reason } = data;
      
      try {
        const order = await Order.findOne({ orderId });
        if (!order) {
          socket.emit('error', { message: 'Order not found' });
          return;
        }
        
        order.status = status;
        if (estimatedTime) order.estimatedDeliveryTime = estimatedTime;
        if (reason && status === 'cancelled') order.cancellationReason = reason;
        await order.save();
        
        // Broadcast to all clients tracking this order
        io.to(`order_${orderId}`).emit('order-status-updated', {
          orderId,
          status,
          estimatedTime,
          timestamp: new Date(),
          previousStatus: order.status
        });
        
        console.log(`📡 Order ${orderId} status updated to: ${status}`);
      } catch (error) {
        console.error('Error updating order status:', error);
        socket.emit('error', { message: 'Failed to update order status' });
      }
    });
    
    // Delivery partner sends location
    socket.on('track-delivery-location', (data) => {
      const { orderId, courierLocation } = data;
      io.to(`order_${orderId}`).emit('courier-location-update', {
        orderId,
        courierLocation,
        timestamp: new Date()
      });
    });
    
    // User requests location update
    socket.on('request-location', (orderId) => {
      socket.emit('location-requested', { orderId });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      const connection = activeConnections.get(socket.id);
      if (connection) {
        console.log(`🔌 Client ${socket.id} left order: ${connection.orderId}`);
        activeConnections.delete(socket.id);
      }
      console.log('🔌 Client disconnected:', socket.id);
    });
  });
  
  return io;
};