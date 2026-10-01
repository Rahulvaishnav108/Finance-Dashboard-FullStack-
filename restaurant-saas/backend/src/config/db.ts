import mongoose from 'mongoose';
import { env } from './env';
import logger from './logger';

let isConnected = false;
let listenersBound = false;

function bindConnectionListeners(): void {
  if (listenersBound) {
    return;
  }

  listenersBound = true;

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', { error: error.message });
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    logger.info('MongoDB reconnected');
  });
}

export async function connectToDatabase(): Promise<void> {
  if (isConnected) {
    return;
  }

  const connection = await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: env.MONGODB_CONNECT_TIMEOUT_MS,
  });

  isConnected = true;
  bindConnectionListeners();
  logger.info('MongoDB connection established', {
    host: connection.connection.host,
    database: connection.connection.name,
  });
}

export async function disconnectFromDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB connection closed');
}

export const connectDB = connectToDatabase;
export const disconnectDB = disconnectFromDatabase;
