/* eslint-disable no-console */
/**
 * Sanitizes article HTML already stored before write-time sanitization existed
 * (News.content, ArticleVersion.content_snapshot), in place. Idempotent: documents
 * whose HTML is already clean are left untouched.
 *
 * Usage: pnpm build && pnpm sanitize:content   (needs DATABASE_URL)
 */
import mongoose, { Model } from 'mongoose';
import config from '../config/env';
import { cacheClient } from '../config/redis';
import { ArticleVersion } from '../modules/article-version/article-version.model';
import { News } from '../modules/news/news.model';
import { invalidateNamespaces } from '../utils/cache.utils';
import { sanitizeArticleHtml } from '../utils/sanitize-html';

const sanitizeCollection = async (
  model: Model<never>,
  field: string,
): Promise<{ scanned: number; updated: number }> => {
  let scanned = 0;
  let updated = 0;

  // Raw driver: skips Mongoose hooks and soft-delete filters, so deleted docs are cleaned too.
  const cursor = model.collection.find(
    { [field]: { $type: 'string' } },
    { projection: { [field]: 1 } },
  );
  for await (const doc of cursor) {
    scanned++;
    const html = doc[field] as string;
    const clean = sanitizeArticleHtml(html);
    if (clean !== html) {
      await model.collection.updateOne(
        { _id: doc._id },
        { $set: { [field]: clean } },
      );
      updated++;
    }
  }
  return { scanned, updated };
};

const main = async () => {
  if (!config.database_url) throw new Error('DATABASE_URL is missing');
  await mongoose.connect(config.database_url);

  const news = await sanitizeCollection(
    News as unknown as Model<never>,
    'content',
  );
  console.log(
    `News.content: ${news.updated}/${news.scanned} documents sanitized`,
  );

  const versions = await sanitizeCollection(
    ArticleVersion as unknown as Model<never>,
    'content_snapshot',
  );
  console.log(
    `ArticleVersion.content_snapshot: ${versions.updated}/${versions.scanned} documents sanitized`,
  );

  // Raw updates bypass the model hooks, so drop cached news and revalidate the site once.
  if (news.updated > 0) {
    if (config.redis_enabled) await cacheClient.connect();
    await invalidateNamespaces('news');
    if (cacheClient.isOpen) await cacheClient.quit();
  }

  await mongoose.disconnect();
  // No process.exit() on success: lets the revalidation request finish first.
};

main().catch((err) => {
  console.error('Sanitize failed:', err);
  process.exit(1);
});
