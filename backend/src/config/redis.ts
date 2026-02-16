import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redis: Redis | null = null;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('⚠️  Redis unavailable - functionality requiring Redis will be disabled or fall back to memory');
        return null; // Stop retrying
      }
      return Math.min(times * 100, 3000);
    },
    enableOfflineQueue: false,
  });

  redis.on('error', (err) => {
    console.warn('⚠️  Redis connection error:', err.message);
    // Don't set redis to null here immediately to allow reconnection attempts,
    // but if it persists, functionality using it should handle the error.
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });
} catch (error) {
  console.warn('⚠️  Redis initialization failed');
  redis = null;
}

export default redis;
