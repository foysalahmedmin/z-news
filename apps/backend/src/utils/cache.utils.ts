/* eslint-disable no-console */
import config from '../config/env';
import { cacheClient } from '../config/redis';
import { revalidateFrontend } from './revalidate-frontend';

export const generateCacheKey = (prefix: string, parts: unknown[]): string => {
  const processPart = (part: unknown): string => {
    if (part === null || part === undefined) return '';
    if (typeof part === 'object') {
      // Stable stringify for objects
      return JSON.stringify(
        Object.keys(part as Record<string, unknown>)
          .sort()
          .reduce((acc: Record<string, unknown>, key) => {
            acc[key] = (part as Record<string, unknown>)[key];
            return acc;
          }, {}),
      );
    }
    return String(part);
  };

  return `${prefix}:${parts.map(processPart).join(':')}`;
};

// Every namespace (the key prefix before the first ':') has a version counter stored at
// `<ns>:ver`. Cached values live at `<ns>:v<N>:<rest>`, so invalidating a namespace is a
// single INCR and the orphaned keys simply expire by TTL (no SCAN on hot paths).
const namespaceOf = (key: string): string => key.split(':')[0];

const versionedKey = async (key: string): Promise<string> => {
  const ns = namespaceOf(key);
  const version = (await cacheClient.get(`${ns}:ver`)) ?? '0';
  return `${ns}:v${version}${key.slice(ns.length)}`;
};

// Concurrent misses on the same key in this process share one source call.
const inFlight = new Map<string, Promise<unknown>>();

/**
 * Read-through cache. Redis errors fall back to `fn` (fail-open); errors thrown by `fn`
 * itself (e.g. a 404 AppError) propagate unchanged and are never retried.
 */
export const withCache = async <T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>,
): Promise<T> => {
  if (!config.redis_enabled) {
    return await fn();
  }

  let fullKey: string;
  try {
    fullKey = await versionedKey(key);
    const cachedData = await cacheClient.get(fullKey);
    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }
  } catch (error) {
    console.warn(`Cache read failed for key ${key}, using source:`, error);
    return await fn();
  }

  const pending = inFlight.get(fullKey);
  if (pending) return pending as Promise<T>;

  const promise = (async () => {
    const result = await fn();
    if (result !== undefined && result !== null) {
      cacheClient
        .set(fullKey, JSON.stringify(result), { EX: ttl })
        .catch((error) =>
          console.warn(`Cache write failed for key ${key}:`, error),
        );
    }
    return result;
  })().finally(() => inFlight.delete(fullKey));

  inFlight.set(fullKey, promise);
  return promise;
};

export const setCache = async (
  key: string,
  value: string,
  ttlSeconds: number,
): Promise<void> => {
  if (!config.redis_enabled) return;
  try {
    await cacheClient.set(key, value, { EX: ttlSeconds });
  } catch (error) {
    console.warn(`setCache error for key ${key}:`, error);
  }
};

export const getCache = async (key: string): Promise<string | null> => {
  if (!config.redis_enabled) return null;
  try {
    return await cacheClient.get(key);
  } catch (error) {
    console.warn(`getCache error for key ${key}:`, error);
    return null;
  }
};

/**
 * Invalidate specific keys previously cached with `withCache`.
 * @param keys Key or array of keys to invalidate.
 */
export const invalidateCache = async (keys: string | string[]) => {
  if (!config.redis_enabled) return;

  try {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    if (keysArray.length > 0) {
      await cacheClient.del(await Promise.all(keysArray.map(versionedKey)));
    }
  } catch (error) {
    console.warn(`Invalidate cache error:`, error);
  }
};

/**
 * Invalidate whole cache namespaces in O(1) and tell the frontend to revalidate
 * the matching pages (news, headlines, breaks, categories, events).
 */
export const invalidateNamespaces = async (...namespaces: string[]) => {
  if (config.redis_enabled) {
    try {
      await Promise.all(namespaces.map((ns) => cacheClient.incr(`${ns}:ver`)));
    } catch (error) {
      console.warn(`Invalidate namespace error:`, error);
    }
  }
  revalidateFrontend(namespaces);
};

/**
 * Kept for existing callers: invalidates the pattern's whole namespace
 * (`user:admin:list:*` invalidates every `user:*` key).
 */
export const invalidateCacheByPattern = async (pattern: string) =>
  invalidateNamespaces(namespaceOf(pattern));
