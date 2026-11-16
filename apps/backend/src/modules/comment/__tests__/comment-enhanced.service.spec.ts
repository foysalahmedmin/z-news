/**
 * comment-enhanced.service.test.ts
 *
 * Unit tests for the Enhanced Comment Service layer.
 */

import httpStatus from 'http-status';
import { Types } from 'mongoose';

// ── Mock dependencies ─────────────────────────────────────────────────────────
jest.mock('../comment.repository');
jest.mock('../../reaction/reaction.repository');
jest.mock('../../../utils/cache.utils', () => ({
  invalidateCacheByPattern: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../user-profile/user-profile.repository', () => ({
  incrementActivityStat: jest.fn().mockResolvedValue(undefined),
  updateReputationScore: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../badge/badge.service', () => ({
  BadgeService: { checkAndAwardBadges: jest.fn().mockResolvedValue([]) },
}));

import * as ReactionRepository from '../../reaction/reaction.repository';
import { TReactionDocument } from '../../reaction/reaction.type';
import * as EnhancedCommentService from '../comment-enhanced.service';
import * as CommentRepository from '../comment.repository';
import { TCommentDocument } from '../comment.type';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockCommentDoc = (
  overrides: Partial<TCommentDocument> = {},
): TCommentDocument =>
  ({
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    news: new Types.ObjectId('507f1f77bcf86cd799439012'),
    user: new Types.ObjectId('507f1f77bcf86cd799439013'),
    thread_level: 0,
    content: 'Top level comment',
    is_pinned: false,
    status: 'approved',
    flagged_by: [],
    flagged_count: 0,
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      content: 'Top level comment',
    }),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }) as unknown as TCommentDocument;

const mockReactionDoc = (
  overrides: Partial<TReactionDocument> = {},
): TReactionDocument =>
  ({
    _id: new Types.ObjectId('507f1f77bcf86cd799439014'),
    type: 'like',
    user: new Types.ObjectId('507f1f77bcf86cd799439013'),
    comment: new Types.ObjectId('507f1f77bcf86cd799439011'),
    ...overrides,
  }) as unknown as TReactionDocument;

// ─── Threading ────────────────────────────────────────────────────────────────

describe('EnhancedCommentService.getThreadedComments', () => {
  const doc = (fields: Record<string, unknown>) =>
    ({
      ...fields,
      toObject: () => ({ ...fields }),
    }) as unknown as TCommentDocument;

  it('should nest replies, set is_owner and never expose guest or email', async () => {
    const top = doc({
      _id: 'c1',
      parent_comment: null,
      user: { _id: 'user-1', name: 'A' },
      guest: null,
      email: 'a@example.com',
    });
    const reply = doc({
      _id: 'c2',
      parent_comment: 'c1',
      guest: 'guest-token',
      email: 'g@example.com',
    });
    const nested = doc({ _id: 'c3', parent_comment: 'c2', guest: 'other' });

    (CommentRepository.getThreadedComments as jest.Mock).mockResolvedValue([
      top,
    ]);
    (CommentRepository.getThreadReplies as jest.Mock).mockResolvedValue([
      reply,
      nested,
    ]);
    (CommentRepository.count as jest.Mock).mockResolvedValue(3);

    const result = await EnhancedCommentService.getThreadedComments('news-id', {
      guestToken: 'guest-token',
    });

    expect(result.total).toBe(3);
    const [first] = result.data;
    expect(first.is_owner).toBe(false);
    expect(first.reply_count).toBe(1);
    expect(first.replies[0]).toMatchObject({ _id: 'c2', is_owner: true });
    expect(first.replies[0].replies[0]).toMatchObject({
      _id: 'c3',
      is_owner: false,
    });
    expect(JSON.stringify(result)).not.toMatch(/guest|email/);
    expect(CommentRepository.count).toHaveBeenCalledWith({
      news: 'news-id',
      status: 'approved',
    });

    const asUser = await EnhancedCommentService.getThreadedComments('news-id', {
      userId: 'user-1',
    });
    expect(asUser.data[0].is_owner).toBe(true);
  });
});

describe('EnhancedCommentService.createReply', () => {
  it('should create a reply and update reputation', async () => {
    const parent = mockCommentDoc();
    const reply = mockCommentDoc({
      thread_level: 1,
      parent_comment: parent._id,
    });

    (CommentRepository.findById as jest.Mock).mockResolvedValue(parent);
    (CommentRepository.create as jest.Mock).mockResolvedValue(reply);
    (CommentRepository.findByIdLean as jest.Mock).mockResolvedValue(reply);

    await EnhancedCommentService.createReply(
      '507f1f77bcf86cd799439013',
      parent._id.toString(),
      {
        content: 'Reply content',
        name: 'John',
        email: 'john@example.com',
      },
    );

    expect(CommentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        thread_level: 1,
        parent_comment: expect.any(Types.ObjectId),
      }),
    );
  });

  it('should throw error if max thread depth reached', async () => {
    const parent = mockCommentDoc({ thread_level: 5 });
    (CommentRepository.findById as jest.Mock).mockResolvedValue(parent);

    await expect(
      EnhancedCommentService.createReply(
        '507f1f77bcf86cd799439013',
        '507f1f77bcf86cd799439011',
        {
          content: '...',
          name: '...',
          email: '...',
        },
      ),
    ).rejects.toMatchObject({ status: httpStatus.BAD_REQUEST });
  });
});

// ─── Reactions ────────────────────────────────────────────────────────────────

describe('EnhancedCommentService.addReaction', () => {
  it('should add new reaction if not exists', async () => {
    const comment = mockCommentDoc();
    (CommentRepository.findById as jest.Mock).mockResolvedValue(comment);
    (ReactionRepository.findOne as jest.Mock).mockResolvedValue(null);

    await EnhancedCommentService.addReaction(
      comment._id.toString(),
      '507f1f77bcf86cd799439013',
      'like',
    );

    expect(ReactionRepository.create).toHaveBeenCalled();
  });

  it('should update existing reaction if exists', async () => {
    const comment = mockCommentDoc();
    const existing = mockReactionDoc();
    (CommentRepository.findById as jest.Mock).mockResolvedValue(comment);
    (ReactionRepository.findOne as jest.Mock).mockResolvedValue(existing);

    await EnhancedCommentService.addReaction(
      comment._id.toString(),
      '507f1f77bcf86cd799439013',
      'dislike',
    );

    expect(ReactionRepository.updateById).toHaveBeenCalledWith(
      existing._id.toString(),
      { type: 'dislike' },
    );
  });
});

// ─── Pinning ──────────────────────────────────────────────────────────────────

describe('EnhancedCommentService.pinComment', () => {
  it('should pin comment successfully', async () => {
    const comment = mockCommentDoc();
    (CommentRepository.findById as jest.Mock).mockResolvedValue(comment);

    await EnhancedCommentService.pinComment(comment._id.toString());

    expect(comment.is_pinned).toBe(true);
    expect(comment.save).toHaveBeenCalled();
  });
});

// ─── Moderation ───────────────────────────────────────────────────────────────

describe('EnhancedCommentService.flagComment', () => {
  it('should flag comment and auto-status if threshold reached', async () => {
    const comment = mockCommentDoc({
      flagged_count: 4,
      flagged_by: [new Types.ObjectId()] as any,
    });
    (CommentRepository.findById as jest.Mock).mockResolvedValue(comment);

    await EnhancedCommentService.flagComment(
      comment._id.toString(),
      new Types.ObjectId().toString(),
    );

    expect(comment.flagged_count).toBe(5);
    expect(comment.status).toBe('flagged');
  });
});
