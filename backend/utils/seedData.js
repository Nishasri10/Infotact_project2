const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Event = require('../models/Event');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project2');
        console.log('Connected to MongoDB');
        
        // Clear existing data
        await User.deleteMany({});
        await Restaurant.deleteMany({});
        await Event.deleteMany({});
        console.log('Cleared existing data');
        
        // Create sample user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
            name: 'Demo User',
            email: 'demo@example.com',
            password: hashedPassword,
            phone: '9876543210',
            loyaltyPoints: 250
        });
        console.log('Created demo user');
        
        // Create sample restaurants
        const restaurants = await Restaurant.insertMany([
            {
                name: "Biryani House",
                cuisine: ["Indian", "Mughlai"],
                rating: 4.7,
                address: "Connaught Place, New Delhi",
                deliveryTime: "25-35 min",
                priceForTwo: 600,
                isOpen: true,
                image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
                ownerId: user._id
            },
            {
                name: "Pizza Paradise",
                cuisine: ["Italian", "American"],
                rating: 4.5,
                address: "Saket, New Delhi",
                deliveryTime: "30-40 min",
                priceForTwo: 800,
                isOpen: true,
                image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
                ownerId: user._id
            }
        ]);
        console.log(`Created ${restaurants.length} restaurants`);
        
        // Create sample events
        const events = await Event.insertMany([
            {
                name: "🌿 Spring Food Festival",
                description: "Celebrate spring with 30+ food stalls",
                price: 800,
                discountedPrice: 599,
                date: "2026-06-15",
                time: "11:00 AM",
                venue: "Central Park",
                availableSeats: 250,
                totalSeats: 500,
                type: "Festival"
            },
            {
                name: "🍕 Master Pizza Workshop",
                description: "Learn authentic Neapolitan pizza making",
                price: 2500,
                discountedPrice: 1999,
                date: "2026-06-20",
                time: "2:00 PM",
                venue: "Pizza Academy",
                availableSeats: 15,
                totalSeats: 25,
                type: "Workshop"
            }
        ]);
        console.log(`Created ${events.length} events`);
        
        console.log('✅ Database seeding completed!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();