import mongoose from 'mongoose';
import { env } from './env';
import logger from '../utils/logger';

export async function connectDB(): Promise<void> {
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error('MongoDB error', { err }));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(env.MONGODB_URI, {
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5000,
  });
}
