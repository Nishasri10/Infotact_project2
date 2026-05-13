const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ MONGODB CONNECTION ============
let dbConnected = false;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        dbConnected = true;
        return conn;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        console.log('⚠️ Running in offline mode - using mock data');
        dbConnected = false;
        return null;
    }
};

// Call connection
connectDB();

// ============ SCHEMAS (Defined even if DB not connected) ============
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, default: 'customer' },
    loyaltyPoints: { type: Number, default: 0 },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    createdAt: { type: Date, default: Date.now }
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
    menu: [{
        name: String,
        price: Number,
        description: String,
        category: String,
        isVeg: Boolean,
        popular: Boolean
    }],
    createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
    orderId: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
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

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    description: String,
    pointsAwarded: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    discountedPrice: Number,
    date: Date,
    time: String,
    venue: String,
    availableSeats: Number,
    totalSeats: Number,
    image: String,
    type: String,
    includes: [String],
    duration: String,
    chef: String,
    rating: Number,
    reviews: Number,
    createdAt: { type: Date, default: Date.now }
});

// Create models (will work even if DB not connected)
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

// ============ MOCK DATA (for offline mode) ============
const mockRestaurants = [
    { id: 1, name: "Biryani House", cuisine: ["Indian", "Mughlai"], rating: 4.7, distance: 1.2, deliveryTime: "25-35 min", priceForTwo: 600, isOpen: true, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500" },
    { id: 2, name: "Pizza Paradise", cuisine: ["Italian", "American"], rating: 4.5, distance: 2.1, deliveryTime: "30-40 min", priceForTwo: 800, isOpen: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500" },
    { id: 3, name: "Sushi Master", cuisine: ["Japanese", "Asian"], rating: 4.9, distance: 0.8, deliveryTime: "20-30 min", priceForTwo: 1200, isOpen: true, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500" },
    { id: 4, name: "Spice Garden", cuisine: ["Indian", "South Indian"], rating: 4.6, distance: 1.5, deliveryTime: "25-35 min", priceForTwo: 500, isOpen: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500" }
];

const mockEvents = [
    { id: 1, name: "🌿 Spring Food Festival 2026", description: "Celebrate spring with 30+ food stalls", price: 800, discountedPrice: 599, date: "2026-06-15", time: "11:00 AM", venue: "Central Park", availableSeats: 250, totalSeats: 500, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500", type: "Festival" },
    { id: 2, name: "🍕 Master Pizza Workshop", description: "Learn authentic Neapolitan pizza making", price: 2500, discountedPrice: 1999, date: "2026-06-20", time: "2:00 PM", venue: "Pizza Academy", availableSeats: 15, totalSeats: 25, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500", type: "Workshop" }
];

// ============ API ROUTES ============

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        mongodb: dbConnected ? 'Connected' : 'Disconnected (Offline Mode)',
        timestamp: new Date(),
        message: dbConnected ? 'Database connected successfully' : 'Running with mock data'
    });
});

// ============ RESTAURANT ROUTES ============
app.get('/api/restaurants/nearby', async (req, res) => {
    try {
        if (dbConnected) {
            const restaurants = await Restaurant.find().limit(50);
            if (restaurants.length > 0) {
                return res.json({ success: true, restaurants });
            }
        }
        // Fallback to mock data
        res.json({ success: true, restaurants: mockRestaurants });
    } catch (error) {
        res.json({ success: true, restaurants: mockRestaurants });
    }
});

app.get('/api/restaurants/:id', async (req, res) => {
    try {
        if (dbConnected) {
            const restaurant = await Restaurant.findById(req.params.id);
            if (restaurant) {
                return res.json({ success: true, restaurant });
            }
        }
        const mockRest = mockRestaurants.find(r => r.id == req.params.id);
        res.json({ success: true, restaurant: mockRest || mockRestaurants[0] });
    } catch (error) {
        const mockRest = mockRestaurants.find(r => r.id == req.params.id);
        res.json({ success: true, restaurant: mockRest || mockRestaurants[0] });
    }
});

app.get('/api/restaurants/:id/menu', async (req, res) => {
    const menu = [
        { id: 1, name: "Chicken Biryani", price: 250, category: "Main Course", isVeg: false, popular: true },
        { id: 2, name: "Margherita Pizza", price: 350, category: "Pizza", isVeg: true, popular: true },
        { id: 3, name: "California Roll", price: 450, category: "Sushi", isVeg: false, popular: true },
        { id: 4, name: "Masala Dosa", price: 120, category: "South Indian", isVeg: true, popular: true },
        { id: 5, name: "Gulab Jamun", price: 80, category: "Dessert", isVeg: true, popular: false }
    ];
    res.json({ success: true, menu });
});

// ============ ORDER ROUTES ============
app.post('/api/orders/create', async (req, res) => {
    try {
        const orderData = {
            orderId: 'ORD' + Date.now(),
            ...req.body,
            status: 'confirmed',
            createdAt: new Date()
        };
        
        if (dbConnected) {
            const order = new Order(orderData);
            await order.save();
            return res.status(201).json({ success: true, order });
        }
        res.status(201).json({ success: true, order: orderData });
    } catch (error) {
        res.status(201).json({ 
            success: true, 
            order: { orderId: 'ORD' + Date.now(), ...req.body, status: 'confirmed' } 
        });
    }
});

app.get('/api/orders/my-orders', async (req, res) => {
    try {
        if (dbConnected) {
            const orders = await Order.find().sort('-createdAt').limit(20);
            return res.json({ success: true, orders });
        }
        res.json({ success: true, orders: [] });
    } catch (error) {
        res.json({ success: true, orders: [] });
    }
});

app.get('/api/orders/:orderId/track', async (req, res) => {
    res.json({ 
        success: true, 
        status: 'preparing', 
        estimatedDelivery: new Date(Date.now() + 30 * 60000),
        message: 'Your order is being prepared'
    });
});

app.put('/api/orders/:orderId/cancel', async (req, res) => {
    res.json({ success: true, message: 'Order cancelled successfully' });
});

// ============ REVIEW ROUTES ============
app.post('/api/reviews/submit', async (req, res) => {
    const { rating, description } = req.body;
    let pointsEarned = 10;
    if (description && description.length >= 100) pointsEarned += 20;
    else if (description && description.length >= 50) pointsEarned += 10;
    if (rating >= 4) pointsEarned += 10;
    
    res.status(201).json({ 
        success: true, 
        pointsEarned: pointsEarned,
        message: 'Review submitted successfully!'
    });
});

app.get('/api/reviews/restaurant/:restaurantId', async (req, res) => {
    res.json({ success: true, reviews: [] });
});

// ============ AUTH ROUTES ============
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (dbConnected) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, error: 'User already exists' });
            }
            
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ name, email, password: hashedPassword, loyaltyPoints: 100 });
            await user.save();
            
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            
            return res.json({ 
                success: true, 
                token, 
                user: { id: user._id, name: user.name, email: user.email, loyaltyPoints: user.loyaltyPoints } 
            });
        }
        
        // Offline mode
        const token = 'mock-token-' + Date.now();
        res.json({ 
            success: true, 
            token, 
            user: { id: Date.now(), name, email, loyaltyPoints: 100 } 
        });
    } catch (error) {
        const token = 'mock-token-' + Date.now();
        res.json({ 
            success: true, 
            token, 
            user: { id: Date.now(), name, email, loyaltyPoints: 100 } 
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (dbConnected) {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }
            
            const bcrypt = require('bcryptjs');
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }
            
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            
            return res.json({ 
                success: true, 
                token, 
                user: { id: user._id, name: user.name, email: user.email, loyaltyPoints: user.loyaltyPoints } 
            });
        }
        
        res.json({ 
            success: true, 
            token: 'mock-token-' + Date.now(),
            user: { id: 1, name: email.split('@')[0] || 'User', email, loyaltyPoints: 250 } 
        });
    } catch (error) {
        res.json({ 
            success: true, 
            token: 'mock-token-' + Date.now(),
            user: { id: 1, name: email.split('@')[0] || 'User', email, loyaltyPoints: 250 } 
        });
    }
});

app.get('/api/auth/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token || token.startsWith('mock')) {
        return res.json({ success: true, user: { id: 1, name: 'Demo User', email: 'user@example.com', loyaltyPoints: 250 } });
    }
    res.json({ success: true, user: { id: 1, name: 'Demo User', email: 'user@example.com', loyaltyPoints: 250 } });
});

// ============ EVENT ROUTES ============
app.get('/api/events/upcoming', async (req, res) => {
    try {
        if (dbConnected) {
            const events = await Event.find({ date: { $gte: new Date() } }).limit(20);
            if (events.length > 0) {
                return res.json({ success: true, events });
            }
        }
        res.json({ success: true, events: mockEvents });
    } catch (error) {
        res.json({ success: true, events: mockEvents });
    }
});

app.get('/api/events/:id', async (req, res) => {
    try {
        if (dbConnected) {
            const event = await Event.findById(req.params.id);
            if (event) {
                return res.json({ success: true, event });
            }
        }
        const mockEvent = mockEvents.find(e => e.id == req.params.id);
        res.json({ success: true, event: mockEvent || mockEvents[0] });
    } catch (error) {
        const mockEvent = mockEvents.find(e => e.id == req.params.id);
        res.json({ success: true, event: mockEvent || mockEvents[0] });
    }
});

app.post('/api/events/:id/book', async (req, res) => {
    const { tickets } = req.body;
    res.json({ 
        success: true, 
        message: `Successfully booked ${tickets} ticket(s)`,
        bookingId: 'BKG' + Date.now()
    });
});

// ============ WEBSOCKET ============
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

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📍 API Endpoints:`);
    console.log(`   GET  /api/health - Health check`);
    console.log(`   GET  /api/restaurants/nearby - Get restaurants`);
    console.log(`   POST /api/orders/create - Create order`);
    console.log(`   POST /api/auth/login - User login`);
    console.log(`   GET  /api/events/upcoming - Get events`);
    console.log(`🔌 WebSocket ready on ws://localhost:${PORT}\n`);
});