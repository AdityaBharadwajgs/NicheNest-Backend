const mongoose = require('mongoose');

const db = async () => {
    try {
        // Use environment variable or default to local MongoDB
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/niche_ecommerce';
        const database = await mongoose.connect(mongoURI);
        console.log('✅ DB connected successfully to:', mongoURI);
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        console.log('💡 Make sure MongoDB is running locally or set MONGO_URI environment variable');
    }
}

module.exports = db;