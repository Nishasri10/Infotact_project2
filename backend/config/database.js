const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/project2', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database Name: ${conn.connection.name}`);
        
        // Create indexes if needed
        const db = conn.connection.db;
        const collections = await db.listCollections().toArray();
        const restaurantExists = collections.some(c => c.name === 'restaurants');
        
        if (restaurantExists) {
            await db.collection('restaurants').createIndex({ location: '2dsphere' });
            console.log('✅ Geospatial index checked/created');
        }
        
        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('⚠️  Make sure MongoDB is running');
        return null;
    }
};

module.exports = connectDB;