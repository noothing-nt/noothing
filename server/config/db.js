const mongoose = require('mongoose');

let isConnected = false;

exports.connectDB = async () => {
  if (isConnected) return;

  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ MongoDB connected.');

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
      isConnected = false;
      setTimeout(exports.connectDB, 5000);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    setTimeout(exports.connectDB, 5000);
  }
};