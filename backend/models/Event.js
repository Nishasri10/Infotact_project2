const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    discountedPrice: Number,
    date: { type: Date, required: true },
    time: String,
    venue: String,
    availableSeats: { type: Number, default: 0 },
    totalSeats: { type: Number, default: 0 },
    image: String,
    type: String,
    includes: [String],
    duration: String,
    chef: String,
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);