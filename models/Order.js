const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    specialInstructions: {
      type: String,
      maxlength: 200
    }
  }],
  orderType: {
    type: String,
    enum: ['delivery', 'dine-in', 'event'],
    required: true
  },
  reservationDetails: {
    date: Date,
    time: String,
    people: Number,
    tableNumber: String,
    specialRequests: String
  },
  eventDetails: {
    eventId: mongoose.Schema.Types.ObjectId,
    eventName: String,
    tickets: Number,
    ticketPrice: Number
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    landmark: String,
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number]
    }
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'cash', 'wallet'],
    required: true
  },
  paymentId: String,
  paymentDetails: mongoose.Schema.Types.Mixed,
  deliveryPartnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deliveryLocation: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: [Number]
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  specialInstructions: {
    type: String,
    maxlength: 500
  },
  cancellationReason: String,
  loyaltyPointsEarned: {
    type: Number,
    default: 0
  },
  loyaltyPointsUsed: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  reviewSubmitted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate order ID before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderId = `ORD${year}${month}${day}${random}`;
  }
  this.updatedAt = Date.now();
  
  // Calculate loyalty points (5% of order value)
  if (this.status === 'delivered' && !this.loyaltyPointsEarned) {
    this.loyaltyPointsEarned = Math.floor(this.totalAmount / 20);
  }
  
  next();
});

// Indexes for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ status: 1, createdAt: 1 });
orderSchema.index({ 'deliveryAddress.location': '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);