import { Types } from 'mongoose';
import { Comment } from '../../modules/comment/comment.model';
import { Reaction } from '../../modules/reaction/reaction.model';
import { View } from '../../modules/view/view.model';
import { calculateEngagementCounts } from '../backfill-engagement-stats';

jest.mock('../../modules/view/view.model', () => ({
  View: {
    aggregate: jest.fn(),
  },
}));

jest.mock('../../modules/reaction/reaction.model', () => ({
  Reaction: {
    aggregate: jest.fn(),
  },
}));

jest.mock('../../modules/comment/comment.model', () => ({
  Comment: {
    aggregate: jest.fn(),
  },
}));

describe('calculateEngagementCounts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should aggregate views, likes, dislikes, and comments per news article', async () => {
    const news1 = new Types.ObjectId();
    const news2 = new Types.ObjectId();

    (View.aggregate as jest.Mock).mockResolvedValue([
      { _id: news1, count: 42 },
      { _id: news2, count: 10 },
    ]);

    (Reaction.aggregate as jest.Mock).mockResolvedValue([
      { _id: { news: news1, type: 'like' }, count: 15 },
      { _id: { news: news1, type: 'dislike' }, count: 2 },
      { _id: { news: news2, type: 'like' }, count: 5 },
    ]);

    (Comment.aggregate as jest.Mock).mockResolvedValue([
      { _id: news1, count: 7 },
    ]);

    const result = await calculateEngagementCounts();

    expect(result[String(news1)]).toEqual({
      views: 42,
      likes: 15,
      dislikes: 2,
      comments: 7,
    });

    expect(result[String(news2)]).toEqual({
      views: 10,
      likes: 5,
      dislikes: 0,
      comments: 0,
    });
  });

  it('should return empty record if no engagement exists in any collection', async () => {
    (View.aggregate as jest.Mock).mockResolvedValue([]);
    (Reaction.aggregate as jest.Mock).mockResolvedValue([]);
    (Comment.aggregate as jest.Mock).mockResolvedValue([]);

    const result = await calculateEngagementCounts();
    expect(result).toEqual({});
  });
});
