/* eslint-disable no-console */
/**
 * Clears the legacy automatic 24-hour expiry on existing articles.
 *
 * Before db07e7b, every article created as `published` got a default
 * `expired_at = published_at + 24h`. This script finds articles where
 * `expired_at` equals `published_at + 24h` (±5 seconds) and cleans them up.
 *
 * Usage:
 *   pnpm build && pnpm clear:expiry                      # Dry run
 *   pnpm build && pnpm clear:expiry --apply              # Unset expired_at on published
 *   pnpm build && pnpm clear:expiry --apply --restore-archived # Also restore archived articles
 */
import mongoose from 'mongoose';
import config from '../config/env';
import { cacheClient } from '../config/redis';
import { News } from '../modules/news/news.model';
import { invalidateNamespaces } from '../utils/cache.utils';

export const DEFAULT_EXPIRY_DIFF_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_EXPIRY_TOLERANCE_MS = 5 * 1000;

export const buildDefaultExpiryFilter = (
  status?: 'published' | 'archived',
): Record<string, unknown> => {
  const diffExpr = { $subtract: ['$expired_at', '$published_at'] };
  const filter: Record<string, unknown> = {
    expired_at: { $ne: null },
    published_at: { $ne: null },
    $expr: {
      $and: [
        {
          $gte: [
            diffExpr,
            DEFAULT_EXPIRY_DIFF_MS - DEFAULT_EXPIRY_TOLERANCE_MS,
          ],
        },
        {
          $lte: [
            diffExpr,
            DEFAULT_EXPIRY_DIFF_MS + DEFAULT_EXPIRY_TOLERANCE_MS,
          ],
        },
      ],
    },
  };

  if (status) {
    filter.status = status;
  }

  return filter;
};

export const runClearDefaultExpiry = async (args: string[] = process.argv) => {
  const isApply = args.includes('--apply');
  const isRestoreArchived = args.includes('--restore-archived');

  const publishedFilter = buildDefaultExpiryFilter('published');
  const archivedFilter = buildDefaultExpiryFilter('archived');

  const [publishedCount, archivedCount, publishedSamples, archivedSamples] =
    await Promise.all([
      News.countDocuments(publishedFilter),
      News.countDocuments(archivedFilter),
      News.find(publishedFilter, { slug: 1 }).limit(20).lean(),
      News.find(archivedFilter, { slug: 1 }).limit(20).lean(),
    ]);

  console.log(`Found ${publishedCount} published articles with default 24h expiry.`);
  if (publishedSamples.length > 0) {
    console.log(
      `Sample published slugs (up to 20):`,
      publishedSamples.map((doc) => doc.slug),
    );
  }

  console.log(
    `Found ${archivedCount} archived articles with default 24h expiry.`,
  );
  if (archivedSamples.length > 0) {
    console.log(
      `Sample archived slugs (up to 20):`,
      archivedSamples.map((doc) => doc.slug),
    );
  }

  if (!isApply) {
    console.log(
      '\n[Dry Run] No changes made. Run with --apply to modify documents.',
    );
    if (archivedCount > 0) {
      console.log(
        'Add --restore-archived alongside --apply to re-publish matching archived articles.',
      );
    }
    return {
      publishedCount,
      archivedCount,
      applied: false,
    };
  }

  console.log('\n[Apply] Updating documents...');

  // Unset expired_at on matching published articles
  const publishedUpdate = await News.updateMany(publishedFilter, {
    $unset: { expired_at: 1 },
  });
  console.log(
    `Unset expired_at on ${publishedUpdate.modifiedCount} published articles.`,
  );

  let restoredCount = 0;
  if (isRestoreArchived) {
    const archivedUpdate = await News.updateMany(archivedFilter, {
      $set: { status: 'published' },
      $unset: { expired_at: 1 },
    });
    restoredCount = archivedUpdate.modifiedCount;
    console.log(
      `Restored and unset expired_at on ${restoredCount} archived articles.`,
    );
  } else if (archivedCount > 0) {
    console.log(
      `Skipped ${archivedCount} archived articles (pass --restore-archived to re-publish).`,
    );
  }

  // Invalidate news caches
  if (publishedUpdate.modifiedCount > 0 || restoredCount > 0) {
    if (config.redis_enabled && !cacheClient.isOpen) {
      await cacheClient.connect();
    }
    await invalidateNamespaces('news', 'news-headline', 'news-break');
    if (cacheClient.isOpen) {
      await cacheClient.quit();
    }
    console.log('Invalidated news caches.');
  }

  return {
    publishedCount,
    archivedCount,
    updatedPublished: publishedUpdate.modifiedCount,
    restoredArchived: restoredCount,
    applied: true,
  };
};

const main = async () => {
  if (!config.database_url) throw new Error('DATABASE_URL is missing');
  await mongoose.connect(config.database_url);

  try {
    await runClearDefaultExpiry(process.argv);
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  main().catch((err) => {
    console.error('Clear default expiry failed:', err);
    process.exit(1);
  });
}
