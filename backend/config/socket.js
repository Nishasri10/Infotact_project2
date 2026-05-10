module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 New client connected:', socket.id);
        
        socket.on('join-order', (orderId) => {
            socket.join(`order_${orderId}`);
            console.log(`📦 Client joined order: ${orderId}`);
            socket.emit('joined', { orderId, message: 'Successfully joined order tracking' });
        });
        
        socket.on('update-order-status', (data) => {
            const { orderId, status } = data;
            io.to(`order_${orderId}`).emit('order-status-updated', {
                orderId,
                status,
                timestamp: new Date()
            });
            console.log(`📡 Order ${orderId} status updated to: ${status}`);
        });
        
        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected:', socket.id);
        });
    });
};