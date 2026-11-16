/**
 * News Repository
 *
 * Handles ALL direct database interactions for the News module.
 */

import { PopulateOptions, Types, UpdateQuery } from 'mongoose';
import AppQueryFind from '../../builder/app-query-find';
import { Comment } from '../comment/comment.model';
import { Reaction } from '../reaction/reaction.model';
import { View } from '../view/view.model';
import { News } from './news.model';
import { TNews, TNewsDocument } from './news.type';

type TPopulate = string | PopulateOptions | (string | PopulateOptions)[];

// ─── Create ───────────────────────────────────────────────────────────────────

export const create = async (
  payload: Partial<TNews>,
): Promise<TNewsDocument> => {
  return await News.create(payload);
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findById = async (
  id: string,
  options: { bypassDeleted?: boolean } = {},
): Promise<TNewsDocument | null> => {
  const query = News.findById(id);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};

export const findOne = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TNewsDocument | null> => {
  let query = News.findOne(filter);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findOneLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  options: { bypassDeleted?: boolean } = {},
): Promise<TNews | null> => {
  let query = News.findOne(filter).lean();
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TNews | null;
};

// ─── Find Many ───────────────────────────────────────────────────────────────

export const findMany = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  sort: Record<string, 1 | -1> = { published_at: -1 },
): Promise<TNewsDocument[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortQuery = sort as any;
  let query = News.find(filter).sort(sortQuery);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findManyLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  options: { bypassDeleted?: boolean; sort?: Record<string, 1 | -1> } = {},
): Promise<TNews[]> => {
  const { bypassDeleted, sort = { published_at: -1 } } = options;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortQuery = sort as any;
  let query = News.find(filter).sort(sortQuery).lean();
  if (bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TNews[];
};

// ─── Paginated Lists ─────────────────────────────────────────────────────────

// Query params a public news list may filter on; everything else is ignored.
const PUBLIC_FILTERS: (keyof TNews)[] = ['event', 'is_featured', 'author'];

export const findPublicPaginated = async (
  query: Record<string, unknown>,
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
) => {
  const newsQuery = new AppQueryFind(News, query, {
    ...filter,
    status: 'published',
  })
    .populate(populateFields as PopulateOptions[])
    .search(['title', 'description'])
    .filter(PUBLIC_FILTERS)
    .sort(['published_at', 'created_at', 'title', 'is_featured'])
    .paginate()
    .fields([
      'title',
      'sub_title',
      'slug',
      'description',
      'content',
      'thumbnail',
      'video',
      'youtube',
      'author',
      'writer',
      'category',
      'tags',
      'status',
      'layout',
      'published_at',
      'is_featured',
      'views',
      'likes',
      'dislikes',
      'comments',
    ])
    .tap((q) => q.lean());

  return await newsQuery.execute();
};

export const findSelfPaginated = async (
  authorId: string,
  query: Record<string, unknown>,
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  facets?: { key: string; filter: Record<string, unknown> }[],
) => {
  const newsQuery = new AppQueryFind(News, query, {
    ...filter,
    author: authorId,
  })
    .populate(populateFields as PopulateOptions[])
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields([
      'title',
      'slug',
      'description',
      'content',
      'thumbnail',
      'video',
      'youtube',
      'author',
      'writer',
      'category',
      'tags',
      'status',
      'layout',
      'published_at',
      'is_featured',
      'views',
      'likes',
      'dislikes',
      'comments',
    ])
    .tap((q) => q.lean());

  return await newsQuery.execute(facets);
};

export const findAdminPaginated = async (
  query: Record<string, unknown>,
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  facets?: { key: string; filter: Record<string, unknown> }[],
) => {
  const newsQuery = new AppQueryFind(News, query, filter)
    .populate(populateFields as PopulateOptions[])
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields([
      'title',
      'slug',
      'description',
      'content',
      'thumbnail',
      'video',
      'youtube',
      'author',
      'writer',
      'category',
      'tags',
      'status',
      'layout',
      'published_at',
      'is_featured',
      'views',
      'likes',
      'dislikes',
      'comments',
    ])
    .tap((q) => q.lean());

  return await newsQuery.execute(facets);
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const findByIdAndUpdate = async (
  id: string,
  payload: UpdateQuery<TNewsDocument>,
): Promise<TNewsDocument | null> => {
  return await News.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateOne = async (
  filter: Record<string, unknown>,
  payload: UpdateQuery<TNewsDocument>,
): Promise<TNewsDocument | null> => {
  return await News.findOneAndUpdate(filter, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateMany = async (
  filter: Record<string, unknown>,
  payload: UpdateQuery<TNewsDocument>,
  options: { bypassDeleted?: boolean } = {},
): Promise<{ modifiedCount: number }> => {
  const query = News.updateMany(filter, payload);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};

// `filter` scopes the restore (e.g. `{ author }` for self restores).
export const restoreById = async (
  id: string,
  filter: Record<string, unknown> = {},
): Promise<TNewsDocument | null> => {
  return await News.findOneAndUpdate(
    { ...filter, _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  );
};

export const restoreManyByIds = async (
  ids: string[],
  filter: Record<string, unknown> = {},
): Promise<{ modifiedCount: number }> => {
  return await News.updateMany(
    { ...filter, _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );
};

// ─── Engagement Counts ───────────────────────────────────────────────────────

/**
 * views / likes / dislikes / comments per news id, counted inside MongoDB (index-backed
 * `$group`). Replaces `count: true` virtual populates, which load every matching
 * View/Reaction/Comment document into Node just to count them.
 */
export const countEngagement = async (
  ids: string[],
): Promise<
  Record<
    string,
    { views: number; likes: number; dislikes: number; comments: number }
  >
> => {
  const objectIds = ids.map((id) => new Types.ObjectId(id));
  const byNews = { $match: { news: { $in: objectIds } } };
  const [views, reactions, comments] = await Promise.all([
    View.aggregate<{ _id: Types.ObjectId; count: number }>([
      byNews,
      { $group: { _id: '$news', count: { $sum: 1 } } },
    ]),
    Reaction.aggregate<{
      _id: { news: Types.ObjectId; type: string };
      count: number;
    }>([
      {
        $match: {
          news: { $in: objectIds },
          type: { $in: ['like', 'dislike'] },
        },
      },
      { $group: { _id: { news: '$news', type: '$type' }, count: { $sum: 1 } } },
    ]),
    Comment.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { news: { $in: objectIds }, status: 'approved' } },
      { $group: { _id: '$news', count: { $sum: 1 } } },
    ]),
  ]);

  const counts: Record<
    string,
    { views: number; likes: number; dislikes: number; comments: number }
  > = {};
  for (const id of ids)
    counts[id] = { views: 0, likes: 0, dislikes: 0, comments: 0 };
  for (const v of views) counts[String(v._id)].views = v.count;
  for (const c of comments) counts[String(c._id)].comments = c.count;
  for (const r of reactions) {
    const entry = counts[String(r._id.news)];
    if (r._id.type === 'like') entry.likes = r.count;
    else entry.dislikes = r.count;
  }
  return counts;
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const deleteById = async (id: string): Promise<TNewsDocument | null> => {
  return await News.findByIdAndDelete(id);
};

export const deleteMany = async (
  filter: Record<string, unknown>,
  options: { bypassDeleted?: boolean } = {},
): Promise<{ deletedCount: number }> => {
  const query = News.deleteMany(filter);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};
