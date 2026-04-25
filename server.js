const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

dotenv.config();

const connectDB = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Function to load models safely
const loadModels = () => {
  try {
    require('./models/User');
    require('./models/Restaurant');
    require('./models/Order');
    require('./models/Review');
    require('./models/Event');
    console.log('✅ All models loaded successfully');
    return true;
  } catch (error) {
    console.log('⚠️  Could not load all models:', error.message);
    return false;
  }
};

const startServer = async () => {
  // Try to connect to database
  await connectDB();
  
  // Try to load models
  const modelsLoaded = loadModels();
  
  // Setup WebSocket
  try {
    require('./config/socket')(io);
    app.set('io', io);
  } catch (error) {
    console.log('⚠️  WebSocket setup skipped:', error.message);
  }
  
  // Import routes safely
  try {
    const authRoutes = require('./routes/auth');
    const restaurantRoutes = require('./routes/restaurants');
    const orderRoutes = require('./routes/orders');
    const reviewRoutes = require('./routes/reviews');
    const eventRoutes = require('./routes/events');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/restaurants', restaurantRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/events', eventRoutes);
  } catch (error) {
    console.log('⚠️  Some routes not loaded:', error.message);
  }
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({ 
      status: 'OK', 
      timestamp: new Date(),
      mongodb: dbStatus,
      database: mongoose.connection.name || 'Not connected',
      modelsLoaded: modelsLoaded
    });
  });
  
  // Simple test endpoint
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
  });
  
  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });
  
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📍 Test the API: http://localhost:${PORT}/api/health`);
  });
};

startServer();

process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection:', err);
});