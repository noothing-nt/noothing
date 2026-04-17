const mongoose = require('mongoose');

let reconnectTimer = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS:          45000,
      connectTimeoutMS:         10000,
      heartbeatFrequencyMS:     10000,
      retryWrites:              true,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Clear any pending reconnect timer
    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }

  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    console.log('⏳ Retrying in 10 seconds...');
    setTimeout(connectDB, 10000);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('🟡 Mongoose disconnected — attempting reconnect...');
  setTimeout(connectDB, 5000);
});

// Force reconnect every 10 minutes (prevents free-tier socket close)
const startReconnectInterval = () => {
  reconnectTimer = setInterval(async () => {
    if (mongoose.connection.readyState !== 1) {
      console.log('🔄 Scheduled DB reconnect...');
      await connectDB();
    } else {
      // Ping DB to keep connection alive
      try {
        await mongoose.connection.db.admin().ping();
        console.log('💓 DB heartbeat OK');
      } catch (err) {
        console.warn('💔 DB heartbeat failed — reconnecting...');
        await connectDB();
      }
    }
  }, 10 * 60 * 1000); // Every 10 minutes
};

module.exports = { connectDB, startReconnectInterval };