const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add menu item name']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please add category'],
    enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Soup', 'Salad', 'Bread']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  image: String,
  preparationTime: {
    type: Number,
    default: 15,
    min: 5,
    max: 60
  },
  dietaryInfo: [{
    type: String,
    enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free']
  }],
  spicyLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 2
  }
});

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  reservations: [{
    customerName: String,
    customerPhone: String,
    date: Date,
    time: String,
    people: Number
  }]
});

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add restaurant name'],
    trim: true,
    unique: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add description'],
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: 'A wonderful restaurant serving delicious cuisine'
  },
  cuisine: [{
    type: String,
    required: true
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    landmark: String
  },
  contactNumber: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
  },
  email: {
    type: String,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  deliveryTime: {
    min: { type: Number, default: 20 },
    max: { type: Number, default: 40 }
  },
  deliveryFee: {
    type: Number,
    default: 40,
    min: 0
  },
  minimumOrder: {
    type: Number,
    default: 100,
    min: 0
  },
  priceForTwo: {
    type: Number,
    required: true,
    min: 0
  },
  isDeliveryActive: {
    type: Boolean,
    default: true
  },
  isDineInActive: {
    type: Boolean,
    default: true
  },
  menu: [menuItemSchema],
  tables: [tableSchema],
  images: [String],
  coverImage: {
    type: String,
    default: 'default-cover.jpg'
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  averagePreparationTime: {
    type: Number,
    default: 25
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create slug from name
restaurantSchema.pre('save', function(next) {
  this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  next();
});

// Create indexes
restaurantSchema.index({ name: 'text', cuisine: 'text', description: 'text' });
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ priceForTwo: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);