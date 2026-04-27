const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const bcrypt = require('bcryptjs');

dotenv.config();

const sampleRestaurants = [
  {
    name: "Biryani House",
    description: "Authentic Hyderabadi biryani since 1985. Known for our secret spice blend and slow-cooked meats.",
    cuisine: ["Indian", "Mughlai", "Hyderabadi"],
    location: {
      type: "Point",
      coordinates: [77.2090, 28.6139]
    },
    address: {
      street: "Connaught Place",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110001",
      landmark: "Near Metro Station"
    },
    contactNumber: "9876543210",
    email: "contact@biryanihouse.com",
    deliveryTime: { min: 25, max: 35 },
    deliveryFee: 40,
    minimumOrder: 150,
    priceForTwo: 600,
    isDeliveryActive: true,
    isDineInActive: true,
    isOpen: true,
    openingHours: {
      monday: { open: "11:00", close: "23:00" },
      tuesday: { open: "11:00", close: "23:00" },
      wednesday: { open: "11:00", close: "23:00" },
      thursday: { open: "11:00", close: "23:00" },
      friday: { open: "11:00", close: "23:00" },
      saturday: { open: "11:00", close: "23:00" },
      sunday: { open: "11:00", close: "23:00" }
    },
    menu: [
      { name: "Chicken Biryani", price: 250, description: "Authentic Hyderabadi chicken biryani with aromatic spices", category: "Main Course", preparationTime: 20, spicyLevel: 3 },
      { name: "Mutton Biryani", price: 350, description: "Slow-cooked mutton biryani", category: "Main Course", preparationTime: 25, spicyLevel: 4 },
      { name: "Veg Biryani", price: 180, description: "Fresh vegetables with basmati rice", category: "Main Course", preparationTime: 15, spicyLevel: 2, dietaryInfo: ["Vegetarian"] },
      { name: "Raita", price: 40, description: "Fresh yogurt with cucumber and mint", category: "Sides", preparationTime: 5, dietaryInfo: ["Vegetarian"] },
      { name: "Gulab Jamun", price: 60, description: "Soft milk dumplings in sugar syrup", category: "Dessert", preparationTime: 5, dietaryInfo: ["Vegetarian"] }
    ],
    tables: [
      { tableNumber: "T1", capacity: 2, isAvailable: true },
      { tableNumber: "T2", capacity: 4, isAvailable: true },
      { tableNumber: "T3", capacity: 6, isAvailable: true }
    ],
    images: ["biryani-house-1.jpg", "biryani-house-2.jpg"],
    coverImage: "biryani-house-cover.jpg"
  },
  {
    name: "Pizza Paradise",
    description: "Wood-fired pizzas made with fresh ingredients. Best pizza in town!",
    cuisine: ["Italian", "American", "Pizza"],
    location: {
      type: "Point",
      coordinates: [77.2150, 28.6200]
    },
    address: {
      street: "Saket",
      city: "New Delhi",
      state: "Delhi",
      zipCode: "110017",
      landmark: "Near Select Citywalk"
    },
    contactNumber: "9876543211",
    email: "info@pizzaparadise.com",
    deliveryTime: { min: 30, max: 40 },
    deliveryFee: 50,
    minimumOrder: 200,
    priceForTwo: 800,
    isDeliveryActive: true,
    isDineInActive: true,
    isOpen: true,
    openingHours: {
      monday: { open: "12:00", close: "23:00" },
      tuesday: { open: "12:00", close: "23:00" },
      wednesday: { open: "12:00", close: "23:00" },
      thursday: { open: "12:00", close: "23:00" },
      friday: { open: "12:00", close: "23:00" },
      saturday: { open: "12:00", close: "23:00" },
      sunday: { open: "12:00", close: "23:00" }
    },
    menu: [
      { name: "Margherita Pizza", price: 350, description: "Classic cheese and basil", category: "Pizza", preparationTime: 15, dietaryInfo: ["Vegetarian"] },
      { name: "Pepperoni Pizza", price: 450, description: "Spicy pepperoni with mozzarella", category: "Pizza", preparationTime: 15, spicyLevel: 2 },
      { name: "Garlic Bread", price: 120, description: "Crispy garlic bread with herbs", category: "Sides", preparationTime: 10, dietaryInfo: ["Vegetarian"] },
      { name: "Pasta Alfredo", price: 280, description: "Creamy alfredo sauce with parmesan", category: "Pasta", preparationTime: 15, dietaryInfo: ["Vegetarian"] }
    ],
    tables: [
      { tableNumber: "T1", capacity: 2, isAvailable: true },
      { tableNumber: "T2", capacity: 4, isAvailable: true },
      { tableNumber: "T3", capacity: 8, isAvailable: true }
    ],
    images: ["pizza-paradise-1.jpg", "pizza-paradise-2.jpg"],
    coverImage: "pizza-paradise-cover.jpg"
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Restaurant.deleteMany({});
    console.log('Cleared existing restaurants');
    
    // Create a default owner user if not exists
    let owner = await User.findOne({ email: 'owner@example.com' });
    if (!owner) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      owner = await User.create({
        name: 'Restaurant Owner',
        email: 'owner@example.com',
        password: hashedPassword,
        phone: '9999999999',
        role: 'restaurant_owner',
        loyaltyPoints: 0
      });
      console.log('Created default owner user');
    }
    
    // Add ownerId to restaurants
    const restaurantsWithOwner = sampleRestaurants.map(r => ({
      ...r,
      ownerId: owner._id
    }));
    
    await Restaurant.insertMany(restaurantsWithOwner);
    console.log(`✅ Seeded ${restaurantsWithOwner.length} restaurants`);
    
    // Create geospatial index
    await Restaurant.collection.createIndex({ location: '2dsphere' });
    console.log('✅ Created geospatial index');
    
    console.log('Database seeding completed!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();