const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');

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

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project2', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected successfully');
    } catch (error) {
        console.log('⚠️ MongoDB connection error:', error.message);
        console.log('⚠️ Continuing without database - using mock data');
    }
};
connectDB();

// Sample Restaurant Data (Mock)
const restaurants = [
    { 
        id: 1, 
        name: "Biryani House", 
        cuisine: ["Indian", "Mughlai"], 
        rating: 4.7, 
        distance: 1.2, 
        deliveryTime: "25-35 min", 
        priceForTwo: 600, 
        isOpen: true, 
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500" 
    },
    { 
        id: 2, 
        name: "Pizza Paradise", 
        cuisine: ["Italian", "American"], 
        rating: 4.5, 
        distance: 2.1, 
        deliveryTime: "30-40 min", 
        priceForTwo: 800, 
        isOpen: true, 
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500" 
    },
    { 
        id: 3, 
        name: "Sushi Master", 
        cuisine: ["Japanese", "Asian"], 
        rating: 4.9, 
        distance: 0.8, 
        deliveryTime: "20-30 min", 
        priceForTwo: 1200, 
        isOpen: true, 
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500" 
    },
    { 
        id: 4, 
        name: "Spice Garden", 
        cuisine: ["Indian", "South Indian"], 
        rating: 4.6, 
        distance: 1.5, 
        deliveryTime: "25-35 min", 
        priceForTwo: 500, 
        isOpen: true, 
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500" 
    }
];

// Sample Event Data
const events = [
    {
        id: 1,
        name: "🌿 Spring Food Festival",
        description: "Celebrate spring with 30+ food stalls",
        price: 800,
        discountedPrice: 599,
        date: "2026-06-15",
        time: "11:00 AM",
        venue: "Central Park",
        availableSeats: 250,
        totalSeats: 500,
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500",
        type: "Festival"
    },
    {
        id: 2,
        name: "🍕 Master Pizza Workshop",
        description: "Learn authentic Neapolitan pizza making",
        price: 2500,
        discountedPrice: 1999,
        date: "2026-06-20",
        time: "2:00 PM",
        venue: "Pizza Academy",
        availableSeats: 15,
        totalSeats: 25,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
        type: "Workshop"
    }
];

// ============ API ROUTES ============

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date(),
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Restaurants Routes
app.get('/api/restaurants/nearby', (req, res) => {
    const { lat, lng, maxDistance = 5000, cuisine, minRating } = req.query;
    let filtered = [...restaurants];
    
    if (cuisine) {
        filtered = filtered.filter(r => r.cuisine.includes(cuisine));
    }
    if (minRating) {
        filtered = filtered.filter(r => r.rating >= parseFloat(minRating));
    }
    
    res.json({
        success: true,
        count: filtered.length,
        restaurants: filtered
    });
});

app.get('/api/restaurants/:id', (req, res) => {
    const restaurant = restaurants.find(r => r.id == req.params.id);
    if (!restaurant) {
        return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }
    res.json({ success: true, restaurant });
});

app.get('/api/restaurants/:id/menu', (req, res) => {
    const menu = [
        { id: 1, name: "Chicken Biryani", price: 250, category: "Main Course", isVeg: false, popular: true },
        { id: 2, name: "Margherita Pizza", price: 350, category: "Pizza", isVeg: true, popular: true },
        { id: 3, name: "California Roll", price: 450, category: "Sushi", isVeg: false, popular: true }
    ];
    res.json({ success: true, menu });
});

// Orders Routes
app.post('/api/orders/create', (req, res) => {
    const order = {
        orderId: 'ORD' + Date.now(),
        ...req.body,
        status: 'confirmed',
        createdAt: new Date()
    };
    res.status(201).json({ success: true, order });
});

app.get('/api/orders/my-orders', (req, res) => {
    res.json({ success: true, orders: [] });
});

app.get('/api/orders/:orderId/track', (req, res) => {
    res.json({ 
        success: true, 
        status: 'preparing', 
        estimatedDelivery: new Date(Date.now() + 30 * 60000) 
    });
});

app.put('/api/orders/:orderId/cancel', (req, res) => {
    res.json({ success: true, message: 'Order cancelled successfully' });
});

// Reviews Routes
app.post('/api/reviews/submit', (req, res) => {
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

app.get('/api/reviews/restaurant/:restaurantId', (req, res) => {
    res.json({ success: true, reviews: [] });
});

// Auth Routes
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    res.json({ 
        success: true, 
        token: 'mock-jwt-token-' + Date.now(),
        user: { 
            id: Date.now(), 
            name: name, 
            email: email, 
            loyaltyPoints: 100 
        }
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    res.json({ 
        success: true, 
        token: 'mock-jwt-token-' + Date.now(),
        user: { 
            id: 1, 
            name: email.split('@')[0] || 'User', 
            email: email, 
            loyaltyPoints: 250 
        }
    });
});

app.get('/api/auth/me', (req, res) => {
    res.json({ 
        success: true, 
        user: { 
            id: 1, 
            name: 'Demo User', 
            email: 'user@example.com', 
            loyaltyPoints: 250 
        }
    });
});

// Events Routes
app.get('/api/events/upcoming', (req, res) => {
    res.json({ success: true, events: events });
});

app.get('/api/events/:id', (req, res) => {
    const event = events.find(e => e.id == req.params.id);
    if (!event) {
        return res.status(404).json({ success: false, error: 'Event not found' });
    }
    res.json({ success: true, event });
});

app.post('/api/events/:id/book', (req, res) => {
    const { tickets } = req.body;
    res.json({ 
        success: true, 
        message: `Successfully booked ${tickets} ticket(s)`,
        bookingId: 'BKG' + Date.now()
    });
});

// WebSocket Connection
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

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📍 API Endpoints:`);
    console.log(`   GET  /api/health - Health check`);
    console.log(`   GET  /api/restaurants/nearby - Get restaurants`);
    console.log(`   POST /api/orders/create - Create order`);
    console.log(`   POST /api/auth/login - User login`);
    console.log(`   GET  /api/events/upcoming - Get events`);
    console.log(`🔌 WebSocket ready on ws://localhost:${PORT}`);
});