import Redis from 'ioredis';
import { env } from './env';
import logger from '../utils/logger';

let redis: Redis | null = null;
let redisAvailable = false;

export const getRedis = (): Redis | null => redis;
export const isRedisAvailable = (): boolean => redisAvailable;

export async function connectRedis(): Promise<void> {
  try {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on('error', (err: Error) => {
      logger.warn('Redis error (non-fatal)', { message: err.message });
      redisAvailable = false;
    });

    redis.on('ready', () => {
      logger.info('Redis connected');
      redisAvailable = true;
    });

    await redis.connect();
    redisAvailable = true;
  } catch (err) {
    logger.warn('Redis unavailable, continuing without cache', {
      message: err instanceof Error ? err.message : String(err),
    });
    redis = null;
    redisAvailable = false;
  }
}
