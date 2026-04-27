module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 New client connected:', socket.id);
        
        socket.on('join-order', (orderId) => {
            socket.join(`order_${orderId}`);
            console.log(`📦 Client joined order: ${orderId}`);
        });
        
        socket.on('update-order-status', (data) => {
            io.to(`order_${data.orderId}`).emit('order-status-updated', {
                orderId: data.orderId,
                status: data.status,
                timestamp: new Date()
            });
        });
        
        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected:', socket.id);
        });
    });
};