const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [{
        name: String,
        quantity: Number,
        price: Number
    }],
    subtotal: Number,
    deliveryFee: { type: Number, default: 40 },
    totalAmount: Number,
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending' 
    },
    address: String,
    phone: String,
    paymentMethod: String,
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
    if (!this.orderId) {
        this.orderId = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);