import { createClient } from 'redis';

import env from './env.js';

const redis = createClient({
  url: env.redisUrl,

  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error('Redis connection failed');
      }

      return Math.min(retries * 500, 5000);
    },
  },
});

redis.on('connect', () => {
  console.log('[REDIS] Connecting...');
});

redis.on('ready', () => {
  console.log('[REDIS] Connected successfully');
});

redis.on('error', (err) => {
  console.error('[REDIS] Error:', err.message);
});

let connectPromise = null;

export const connectRedis = async () => {
  if (redis.isReady) {
    return redis;
  }

  if (!connectPromise) {
    connectPromise = redis.connect().finally(() => {
      connectPromise = null;
    });
  }

  await connectPromise;

  return redis;
};

export default redis;
