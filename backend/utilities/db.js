const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI ;

let connectionPromise = null;

const connectDB = async () => {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  // Reuse existing connection in serverless/hot-reload scenarios.
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  try {
    connectionPromise = mongoose.connect(MONGO_URI);
    await connectionPromise;
    console.log('MongoDB connected');
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    connectionPromise = null;
    throw err;
  }
};

module.exports = connectDB; 