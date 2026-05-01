const mongoose = require('mongoose');

const db = async () => {
  const cloudMongoURI = process.env.MONGO_URI;
  const localMongoURI = process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/niche_ecommerce';

  try {
    // Try cloud Mongo first when configured.
    if (cloudMongoURI) {
      await mongoose.connect(cloudMongoURI, { serverSelectionTimeoutMS: 10000 });
      console.log('✅ DB connected successfully (cloud MongoDB)');
      return;
    }

    await mongoose.connect(localMongoURI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ DB connected successfully (local MongoDB)');
  } catch (error) {
    const isSrvDnsIssue =
      cloudMongoURI &&
      cloudMongoURI.startsWith('mongodb+srv://') &&
      (error.message.includes('ENOTFOUND') || error.message.includes('querySrv'));

    if (isSrvDnsIssue) {
      console.warn('⚠️ Cloud MongoDB SRV DNS lookup failed. Trying local MongoDB...');
      try {
        await mongoose.connect(localMongoURI, { serverSelectionTimeoutMS: 10000 });
        console.log('✅ DB connected successfully (local MongoDB fallback)');
        return;
      } catch (localError) {
        console.error('❌ Local MongoDB fallback failed:', localError.message);
      }
    } else {
      console.error('❌ Database connection error:', error.message);
    }

    console.log('💡 Check MONGO_URI (cloud) or run local MongoDB on mongodb://127.0.0.1:27017');
  }
};

module.exports = db;