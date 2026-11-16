/* eslint-disable no-console */
import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import app from './app';
import config from './config/env';
import { initializeRedis } from './config/redis';

let isDbConnected = false;
let isRedisInitialized = false;

// Connect MongoDB once per serverless instance
const connectDB = async () => {
  if (!isDbConnected) {
    if (!config.database_url) {
      throw new Error('DATABASE_URL is missing in config/env');
    }
    await mongoose.connect(config.database_url);
    console.log('✅ MongoDB connected (Serverless)');
    isDbConnected = true;
  }
};

// Initialize Redis once per serverless instance
const connectRedis = async () => {
  if (!isRedisInitialized) {
    try {
      await initializeRedis();
      console.log('🔌 Redis initialized (Serverless)');
    } catch (_err) {
      console.warn('⚠️ Redis failed (Serverless)', _err);
    }
    isRedisInitialized = true;
  }
};

// Serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Connect resources once
    await connectDB();
    await connectRedis();

    // No socket.io here: serverless functions can't hold long-lived connections, and
    // creating a server + Redis adapter per invocation only leaked subscriptions.
    // emitToUser()/emitToRole() are no-ops when io is not initialized.

    // Let Express handle the request
    app(req as any, res as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (err) {
    console.error('❌ Serverless handler error:', err);
    res.status(500).json({ status: 'error', message: (err as Error).message });
  }
}
