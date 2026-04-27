const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  type: {
    type: String,
    enum: ['chef_table', 'tasting_menu', 'wine_tasting', 'cooking_class', 'food_festival', 'live_music'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 30,
    max: 480
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    min: 0
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1,
    max: 200
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  images: [String],
  inclusions: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  attendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ticketCount: Number,
    bookingDate: Date,
    specialRequests: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

eventSchema.index({ date: 1, type: 1 });
eventSchema.index({ restaurantId: 1, date: 1 });
eventSchema.index({ isFeatured: -1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);