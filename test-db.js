const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const testConnection = async () => {
  console.log('🔍 Testing MongoDB connection...');
  console.log(`📡 Connection String: ${process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connection successful!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🖥️  Host: ${mongoose.connection.host}`);
    
    // Create a test collection
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Test document inserted');
    
    const count = await testCollection.countDocuments();
    console.log(`📄 Test collection has ${count} documents`);
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure MongoDB is installed and running');
    console.log('   Run: net start MongoDB (Windows)');
    console.log('2. Check your connection string in .env file');
    console.log('3. If using Atlas, check IP whitelist in Network Access');
    console.log('4. Verify username and password are correct');
  }
};

testConnection();