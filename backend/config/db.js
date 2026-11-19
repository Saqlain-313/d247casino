import mongoose from 'mongoose';

import env from './env.js';

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('Connected to MongoDB:', mongoose.connection.name);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
