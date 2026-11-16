import { createClient, RedisClientOptions } from 'redis';
import config from './env';

const host = config.redis_host || 'localhost';
const port = Number(config.redis_port || '6379');

// Redis client options with timeout and retry settings
const redisOptions: RedisClientOptions = {
  // REDIS_URL wins when set (prod compose only sets the URL); host/port otherwise.
  ...(config.redis_url ? { url: config.redis_url } : {}),
  socket: {
    ...(config.redis_url ? {} : { host, port }),
    connectTimeout: 5000, // 5 seconds timeout
    // Never give up: exponential backoff capped at 5s so the app recovers after a Redis outage.
    reconnectStrategy: (retries: number) => Math.min(100 * 2 ** retries, 5000),
  },
  // Reject commands while disconnected instead of queueing them until reconnect.
  disableOfflineQueue: true,
};

if (config.redis_password) {
  // A password embedded in REDIS_URL takes precedence over this one.
  redisOptions.password = config.redis_password;
}

// Create clients with improved error handling
// Cache reads/writes time out quickly so a black-holed Redis can't hang requests (callers fail open).
const cacheClient = createClient({
  ...redisOptions,
  commandOptions: { timeout: 1000 },
});
const pubClient = createClient(redisOptions);
const subClient = pubClient.duplicate();

// Redis client event listeners
(function () {
  if (!config.redis_enabled) {
    console.log('🔕 Redis disabled by configuration');
    return;
  }

  const clients = [
    { client: cacheClient, name: 'CacheClient' },
    { client: pubClient, name: 'PubClient' },
    { client: subClient, name: 'SubClient' },
  ];

  clients.forEach(({ client, name }) => {
    client.on('error', (err) => {
      console.warn(`⚠️ ${name} Redis error:`, err.message);
    });

    client.on('connect', () => {
      console.log(`✅ ${name} Redis connected`);
    });

    client.on('ready', () => {
      console.log(`🟢 ${name} Redis ready`);
    });

    client.on('end', () => {
      console.log(`🔴 ${name} Redis connection ended`);
    });
  });
})();

// connect() keeps retrying forever (see reconnectStrategy), so only wait a bounded time at
// startup; a client that is still connecting keeps retrying in the background.
const connectWithin = (client: typeof cacheClient, ms: number) =>
  Promise.race([
    client.connect(),
    new Promise<never>((_resolve, reject) =>
      setTimeout(
        () => reject(new Error(`Redis not reachable within ${ms}ms`)),
        ms,
      ).unref(),
    ),
  ]);

// Helper function to safely connect Redis
export const connectRedis = async () => {
  if (!config.redis_enabled) {
    console.log('🔕 Redis disabled by configuration');
    return false;
  }

  try {
    await Promise.all(
      [cacheClient, pubClient, subClient]
        .filter((client) => !client.isOpen)
        .map((client) => connectWithin(client, 5000)),
    );
    return true;
  } catch (error) {
    console.warn('⚠️ Redis connection failed:', error);
    return false;
  }
};

// Helper function to check Redis connectivity
export const checkRedis = async (): Promise<boolean> => {
  if (!config.redis_enabled) {
    console.log('🔕 Redis disabled by configuration');
    return false;
  }

  try {
    await cacheClient.ping();
    return true;
  } catch (error) {
    console.warn('⚠️ Redis ping failed:', error);
    return false;
  }
};

export const initializeRedis = async () => {
  if (!config.redis_enabled) {
    console.log('🔕 Redis disabled by configuration');
    return;
  }

  const redisConnected = await connectRedis();
  if (redisConnected) {
    const isHealthy = await checkRedis();
    if (isHealthy) {
      console.log(
        `✅ Redis (cache) connected and healthy - PID: ${process.pid}`,
      );
    } else {
      console.warn(
        `⚠️ Redis connected but not responding - PID: ${process.pid}`,
      );
    }
  } else {
    console.warn(
      `⚠️ Redis not available, running without cache - PID: ${process.pid}`,
    );
  }
};

export { cacheClient, pubClient, subClient };
