const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const fixIndexes = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/project2');
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const restaurants = db.collection('restaurants');
    
    // Get all indexes
    const indexes = await restaurants.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));
    
    // Drop problematic text indexes
    for (const idx of indexes) {
      if (idx.name.includes('text') || (idx.key && idx.key._fts)) {
        try {
          await restaurants.dropIndex(idx.name);
          console.log(`✅ Dropped index: ${idx.name}`);
        } catch (err) {
          console.log(`⚠️ Could not drop ${idx.name}:`, err.message);
        }
      }
    }
    
    // Create clean indexes
    try {
      await restaurants.createIndex({ location: '2dsphere' });
      console.log('✅ Created geospatial index (2dsphere)');
    } catch (err) {
      console.log('⚠️ Geospatial index可能存在:', err.message);
    }
    
    try {
      await restaurants.createIndex(
        { name: 'text', cuisine: 'text', description: 'text' },
        { name: 'search_index' }
      );
      console.log('✅ Created text search index');
    } catch (err) {
      console.log('⚠️ Text index可能存在:', err.message);
    }
    
    console.log('\n🎉 Indexes fixed successfully!');
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

fixIndexes();