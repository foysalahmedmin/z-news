/* eslint-disable no-console */
import config from '../../config/env';
import { cacheClient } from '../../config/redis';
import { News } from '../news/news.model';

export const SCHEDULER_LOCK_KEY = 'scheduler:lock';
export const SCHEDULER_LOCK_TTL_MS = 55000;

const releaseLock = async (key: string, value: string): Promise<void> => {
  try {
    const RELEASE_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end`;
    await cacheClient.eval(RELEASE_SCRIPT, {
      keys: [key],
      arguments: [value],
    });
  } catch {
    try {
      const current = await cacheClient.get(key);
      if (current === value) {
        await cacheClient.del(key);
      }
    } catch {
      // Ignore cleanup error
    }
  }
};

// One scheduler tick. Distributed lock via Redis ensures only one replica runs
// the job at any given minute. If Redis is disabled or down, it fails open and runs.
export const runScheduledJobs = async (): Promise<{
  published: number;
  archived: number;
  skipped?: boolean;
}> => {
  const now = new Date();
  let hasLock = false;
  let lockId: string | null = null;

  if (config.redis_enabled && cacheClient?.isOpen) {
    try {
      lockId = `${process.pid}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
      const acquired = await cacheClient.set(
        SCHEDULER_LOCK_KEY,
        lockId,
        {
          NX: true,
          PX: SCHEDULER_LOCK_TTL_MS,
        },
      );

      if (!acquired) {
        console.log('[Scheduler] Another instance holds the lock, skipping tick.');
        return { published: 0, archived: 0, skipped: true };
      }
      hasLock = true;
    } catch (err) {
      console.warn('[Scheduler] Redis lock failed, running without lock:', err);
    }
  }

  console.log(`[Scheduler] Checking for jobs at ${now.toISOString()}...`);

  try {
    // 1. Publish scheduled news that reached their publish time
    const newsToPublish = await News.updateMany(
      {
        status: 'scheduled',
        published_at: { $lte: now },
      },
      {
        $set: { status: 'published' },
      },
    );

    if (newsToPublish.modifiedCount > 0) {
      console.log(
        `[Scheduler] Published ${newsToPublish.modifiedCount} articles.`,
      );
    }

    // 2. Archive published news whose editor-set expiry has passed
    const newsToArchive = await News.updateMany(
      {
        status: 'published',
        expired_at: { $lt: now },
      },
      {
        $set: { status: 'archived' },
      },
    );

    if (newsToArchive.modifiedCount > 0) {
      console.log(
        `[Scheduler] Archived ${newsToArchive.modifiedCount} expired articles.`,
      );
    }

    return {
      published: newsToPublish.modifiedCount,
      archived: newsToArchive.modifiedCount,
    };
  } catch (error) {
    console.error('[Scheduler] Error running background jobs:', error);
    return { published: 0, archived: 0 };
  } finally {
    if (hasLock && lockId && cacheClient?.isOpen) {
      await releaseLock(SCHEDULER_LOCK_KEY, lockId);
    }
  }
};

// Start the scheduler (running every minute). In cluster mode the primary sets
// RUN_SCHEDULER=true on exactly one worker and false on the others (see src/index.ts).
export const initScheduler = () => {
  if (process.env.RUN_SCHEDULER === 'false') {
    return;
  }

  console.log('[Scheduler] Background jobs initialized.');

  runScheduledJobs();
  setInterval(runScheduledJobs, 60 * 1000);
};
