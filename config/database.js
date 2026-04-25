const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    
    // Create indexes safely (ignore existing index errors)
    try {
      const db = conn.connection.db;
      const restaurants = db.collection('restaurants');
      
      // Drop existing text index if it exists to avoid conflicts
      const indexes = await restaurants.indexes();
      const textIndex = indexes.find(idx => idx.key && idx.key._fts);
      
      if (textIndex) {
        await restaurants.dropIndex(textIndex.name);
        console.log('✅ Dropped existing text index');
      }
      
      // Create new geospatial index
      await restaurants.createIndex({ location: '2dsphere' });
      console.log('✅ Geospatial index (2dsphere) created');
      
      // Create new text index with consistent fields
      await restaurants.createIndex(
        { name: 'text', cuisine: 'text', description: 'text' },
        { name: 'restaurant_search_index' }
      );
      console.log('✅ Text search index created');
      
    } catch (indexError) {
      console.log('⚠️  Index creation skipped:', indexError.message);
    }
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return null;
  }
};

module.exports = connectDB;