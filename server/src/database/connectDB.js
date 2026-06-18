import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn(
      `\x1b[33m%s\x1b[0m`,
      '⚠ MONGODB_URI not defined in environment variables'
    );
    return null;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      `\x1b[36m%s\x1b[0m`,
      `✓ MongoDB connected: ${conn.connection.host}`
    );

    return conn;
  } catch (error) {
    console.error(
      `\x1b[31m%s\x1b[0m`,
      `✗ MongoDB connection error: ${error.message}`
    );
    throw error;
  }
};

export default connectDB;