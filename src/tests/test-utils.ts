import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;
let isConnected = false;

export const setupTestDB = async () => {
  try {
    if (!isConnected) {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      
      // Updated connection options for Mongoose 6+
      await mongoose.connect(uri);
      
      isConnected = true;
      console.log('Test DB connected successfully');
    }
  } catch (err) {
    console.error('Test DB connection error:', err);
    throw err;
  }
};

export const teardownTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) { // 0 = disconnected
      await mongoose.disconnect();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    isConnected = false;
    console.log('Test DB disconnected successfully');
  } catch (err) {
    console.error('Test DB disconnection error:', err);
    throw err;
  }
};

export const clearDatabase = async () => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      try {
        await collections[key].deleteMany({});
      } catch (err) {
        console.error(`Error clearing collection ${key}:`, err);
      }
    }
    
    console.log('Test DB cleared successfully');
  } catch (err) {
    console.error('Test DB clearing error:', err);
    throw err;
  }
};