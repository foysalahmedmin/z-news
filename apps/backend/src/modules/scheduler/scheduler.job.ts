/* eslint-disable no-console */
import { News } from '../news/news.model';

// One scheduler tick. Both updates are idempotent, so an occasional overlapping run
// (e.g. cron endpoint + in-process timer) is harmless.
export const runScheduledJobs = async (): Promise<{
  published: number;
  archived: number;
}> => {
  const now = new Date();

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
