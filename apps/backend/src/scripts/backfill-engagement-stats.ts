/* eslint-disable no-console */
/**
 * Backfills stored engagement counters (`stats: { views, likes, dislikes, comments }`)
 * on all existing News articles from the View, Reaction, and Comment collections.
 *
 * Idempotent: can be run repeatedly without duplicating or drifting counts.
 *
 * Usage:
 *   pnpm build && pnpm backfill:stats          # Dry run
 *   pnpm build && pnpm backfill:stats --apply  # Apply updates to database
 */
import mongoose, { Types } from 'mongoose';
import config from '../config/env';
import { cacheClient } from '../config/redis';
import { Comment } from '../modules/comment/comment.model';
import { News } from '../modules/news/news.model';
import { Reaction } from '../modules/reaction/reaction.model';
import { View } from '../modules/view/view.model';
import { invalidateNamespaces } from '../utils/cache.utils';

export const calculateEngagementCounts = async (): Promise<
  Record<
    string,
    { views: number; likes: number; dislikes: number; comments: number }
  >
> => {
  const [views, reactions, comments] = await Promise.all([
    View.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { news: { $ne: null } } },
      { $group: { _id: '$news', count: { $sum: 1 } } },
    ]),
    Reaction.aggregate<{
      _id: { news: Types.ObjectId; type: string };
      count: number;
    }>([
      {
        $match: {
          news: { $ne: null },
          type: { $in: ['like', 'dislike'] },
        },
      },
      {
        $group: {
          _id: { news: '$news', type: '$type' },
          count: { $sum: 1 },
        },
      },
    ]),
    Comment.aggregate<{ _id: Types.ObjectId; count: number }>([
      {
        $match: {
          news: { $ne: null },
          status: 'approved',
          is_deleted: { $ne: true },
        },
      },
      { $group: { _id: '$news', count: { $sum: 1 } } },
    ]),
  ]);

  const counts: Record<
    string,
    { views: number; likes: number; dislikes: number; comments: number }
  > = {};

  const getEntry = (id: string) => {
    if (!counts[id]) {
      counts[id] = { views: 0, likes: 0, dislikes: 0, comments: 0 };
    }
    return counts[id];
  };

  for (const v of views) {
    if (v._id) getEntry(String(v._id)).views = v.count;
  }
  for (const c of comments) {
    if (c._id) getEntry(String(c._id)).comments = c.count;
  }
  for (const r of reactions) {
    if (r._id?.news) {
      const entry = getEntry(String(r._id.news));
      if (r._id.type === 'like') entry.likes = r.count;
      else if (r._id.type === 'dislike') entry.dislikes = r.count;
    }
  }

  return counts;
};

export const runBackfillEngagement = async (args: string[] = process.argv) => {
  const isApply = args.includes('--apply');

  console.log('[Backfill] Aggregating engagement counts across collections...');
  const counts = await calculateEngagementCounts();
  const newsWithEngagement = Object.keys(counts).length;
  console.log(
    `[Backfill] Found calculated engagement for ${newsWithEngagement} articles.`,
  );

  const totalNews = await News.countDocuments();
  console.log(`[Backfill] Total news articles in DB: ${totalNews}`);

  if (!isApply) {
    console.log(
      '\n[Dry Run] No documents modified. Run with --apply to commit changes.',
    );
    const sampleIds = Object.keys(counts).slice(0, 5);
    for (const id of sampleIds) {
      console.log(`  Sample ${id}:`, counts[id]);
    }
    return {
      totalNews,
      newsWithEngagement,
      updated: 0,
      applied: false,
    };
  }

  console.log('\n[Apply] Updating news articles...');
  let updatedCount = 0;

  // Use raw cursor to update each document's stats
  const cursor = News.collection.find({}, { projection: { _id: 1, stats: 1 } });
  for await (const doc of cursor) {
    const id = String(doc._id);
    const targetStats = counts[id] || {
      views: 0,
      likes: 0,
      dislikes: 0,
      comments: 0,
    };

    await News.collection.updateOne(
      { _id: doc._id },
      { $set: { stats: targetStats } },
    );
    updatedCount++;
  }

  console.log(
    `[Apply] Successfully updated ${updatedCount} articles with stats.`,
  );

  if (config.redis_enabled && !cacheClient.isOpen) {
    await cacheClient.connect();
  }
  await invalidateNamespaces('news', 'news-headline', 'news-break');
  if (cacheClient.isOpen) {
    await cacheClient.quit();
  }
  console.log('[Apply] Invalidated news caches.');

  return {
    totalNews,
    newsWithEngagement,
    updated: updatedCount,
    applied: true,
  };
};

const main = async () => {
  if (!config.database_url) throw new Error('DATABASE_URL is missing');
  await mongoose.connect(config.database_url);

  try {
    await runBackfillEngagement(process.argv);
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  main().catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
  });
}
