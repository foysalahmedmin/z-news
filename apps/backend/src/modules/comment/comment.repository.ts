/**
 * Comment Repository
 *
 * Handles ALL direct database interactions for the Comment module.
 * The service layer must NEVER import from `comment.model` directly.
 */

import { PopulateOptions } from 'mongoose';
import AppQueryFind from '../../builder/app-query-find';
import { Comment } from './comment.model';
import { TComment, TCommentDocument } from './comment.type';

type TPopulate = PopulateOptions | (string | PopulateOptions)[];

// ─── Create ───────────────────────────────────────────────────────────────────

export const create = async (
  payload: Partial<TComment>,
): Promise<TCommentDocument> => {
  return await Comment.create(payload);
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findById = async (
  id: string,
  options: { bypassDeleted?: boolean } = {},
): Promise<TCommentDocument | null> => {
  const query = Comment.findById(id);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};

export const findByIdLean = async (
  id: string,
  populateFields: TPopulate[] = [],
  options: { bypassDeleted?: boolean } = {},
): Promise<TComment | null> => {
  let query = Comment.findById(id).lean();
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return (await query) as TComment | null;
};

export const findOne = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TCommentDocument | null> => {
  let query = Comment.findOne(filter);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findOneLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TComment | null> => {
  let query = Comment.findOne(filter).lean();
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TComment | null;
};

// ─── Find Many / Counts ───────────────────────────────────────────────────────

export const count = async (
  filter: Record<string, unknown>,
): Promise<number> => {
  return await Comment.countDocuments(filter);
};

export const findManyLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  options: { bypassDeleted?: boolean } = {},
): Promise<TComment[]> => {
  let query = Comment.find(filter).lean();
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};

// ─── Paginated Lists ─────────────────────────────────────────────────────────

export const findPaginated = async (
  filter: Record<string, unknown>,
  query: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  allowedFilters?: (keyof TComment)[],
  allowedFields?: (keyof TComment)[],
): Promise<{
  data: TComment[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}> => {
  const commentQuery = new AppQueryFind(Comment, query, filter)
    .filter(allowedFilters)
    .sort(allowedFilters && ['created_at'])
    .paginate()
    .fields(allowedFields)
    .tap((q) => q.lean());

  if (populateFields.length > 0) {
    commentQuery.populate(populateFields as PopulateOptions[]);
  }

  return await commentQuery.execute();
};

// ─── Threaded Comments ───────────────────────────────────────────────────────

const THREAD_POPULATE = [
  { path: 'user', select: 'name image' },
  { path: 'reply_to_user', select: 'name' },
  { path: 'mentions.user', select: 'name' },
  { path: 'reactions', select: 'user type created_at' },
];

// Visible (approved) top-level comments of an article, pinned first then newest.
export const getThreadedComments = async (
  newsId: string,
  limit: number,
): Promise<TCommentDocument[]> => {
  return await Comment.find({
    news: newsId,
    parent_comment: null,
    status: 'approved',
  })
    .sort({ is_pinned: -1, created_at: -1 })
    .limit(limit)
    .populate(THREAD_POPULATE)
    .exec();
};

// Every visible reply of an article in one query (the caller builds the tree).
export const getThreadReplies = async (
  newsId: string,
  limit: number,
): Promise<TCommentDocument[]> => {
  return await Comment.find({
    news: newsId,
    parent_comment: { $ne: null },
    status: 'approved',
  })
    .sort({ created_at: 1 })
    .limit(limit)
    .populate(THREAD_POPULATE)
    .exec();
};

// Public: visible direct replies, without the guest token or commenter email.
export const getCommentReplies = async (
  commentId: string,
): Promise<TCommentDocument[]> => {
  return await Comment.find({ parent_comment: commentId, status: 'approved' })
    .select('-guest -email')
    .sort({ created_at: 1 })
    .populate(THREAD_POPULATE)
    .exec();
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const findByIdAndUpdateLean = async (
  id: string,
  payload: Partial<TComment>,
): Promise<TComment | null> => {
  return await Comment.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
};

export const findOneAndUpdateLean = async (
  filter: Record<string, unknown>,
  payload: Partial<TComment>,
): Promise<TComment | null> => {
  return await Comment.findOneAndUpdate(filter, payload, {
    new: true,
    runValidators: true,
  }).lean();
};

export const updateMany = async (
  filter: Record<string, unknown>,
  payload: Partial<TComment>,
): Promise<{ modifiedCount: number }> => {
  return await Comment.updateMany(filter, payload);
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const deleteById = async (
  id: string,
): Promise<TCommentDocument | null> => {
  return await Comment.findByIdAndDelete(id);
};

export const deleteMany = async (
  filter: Record<string, unknown>,
  options: { bypassDeleted?: boolean } = {},
): Promise<{ deletedCount: number }> => {
  const query = Comment.deleteMany(filter);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};
