import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;

const connectDB = async () => {
  let uri =
    process.env.MONGODB_URI_STANDARD ||
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/sologym';

  // Opção: MongoDB em memória (sem instalar nada, sem Atlas). Só para desenvolvimento.
  if (process.env.USE_IN_MEMORY_MONGO === 'true' || process.env.USE_IN_MEMORY_MONGO === '1') {
    console.log('Starting in-memory MongoDB (no Atlas needed)...');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log('In-memory MongoDB ready.');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (uri.startsWith('mongodb+srv://') && !process.env.MONGODB_URI_STANDARD) {
      console.error('\nDica: Se o erro for querySrv ECONNREFUSED, use a connection string no formato standard.');
    }
    if (error.message.includes('whitelist') || error.message.includes('IP')) {
      console.error('\n>>> Ou use MongoDB em memória: no .env adicione USE_IN_MEMORY_MONGO=true (e comente MONGODB_URI/MONGODB_URI_STANDARD).');
    }
    process.exit(1);
  }
};

export default connectDB;
