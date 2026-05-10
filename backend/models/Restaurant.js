const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    category: String,
    isVeg: { type: Boolean, default: false },
    popular: { type: Boolean, default: false }
});

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cuisine: [String],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    address: { type: String, required: true },
    deliveryTime: String,
    priceForTwo: Number,
    isOpen: { type: Boolean, default: true },
    image: String,
    coverImage: String,
    description: String,
    phone: String,
    email: String,
    openingHours: String,
    menu: [menuItemSchema],
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);