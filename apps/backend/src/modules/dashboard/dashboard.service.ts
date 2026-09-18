import mongoose from 'mongoose';
import { TRole } from '../../types/jsonwebtoken.type';
import { BadgeService } from '../badge/badge.service';
import { Category } from '../category/category.model';
import { Comment } from '../comment/comment.model';
import { Event } from '../event/event.model';
import { News } from '../news/news.model';
import { Reaction } from '../reaction/reaction.model';
import { User } from '../user/user.model';
import { UserProfile } from '../user-profile/user-profile.model';
import { View } from '../view/view.model';
import * as ViewServices from '../view/view.service';
import {
  TAdminDashboardData,
  TCategoryBreakdownItem,
  TEditorialDashboardData,
  TModerationQueue,
  TMyContentPerformance,
  TReaderDashboardData,
  TRecentActivityItem,
  TTrendPoint,
  TUpcomingEvent,
} from './dashboard.type';

// ============ SHARED HELPERS (reused across all 3 tiers) ============

const getCategoryBreakdown = async (
  limit = 8,
): Promise<TCategoryBreakdownItem[]> => {
  const rows = await News.aggregate([
    { $match: { category: { $ne: null } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $project: {
        _id: '$category._id',
        name: '$category.name',
        slug: '$category.slug',
        count: 1,
      },
    },
  ]);
  return rows;
};

const getUpcomingEvents = async (limit = 5): Promise<TUpcomingEvent[]> => {
  const events = await Event.find({
    status: 'active',
    published_at: { $gte: new Date() },
  })
    .sort({ published_at: 1 })
    .limit(limit)
    .select('name slug published_at')
    .lean();
  return events as unknown as TUpcomingEvent[];
};

const getRecentActivity = async (
  limit = 15,
): Promise<TRecentActivityItem[]> => {
  const [recentNews, recentComments, recentUsers] = await Promise.all([
    News.find({ status: 'published' })
      .sort({ published_at: -1 })
      .limit(10)
      .select('title slug published_at')
      .lean(),
    Comment.find({ status: 'approved' })
      .sort({ created_at: -1 })
      .limit(10)
      .select('content news user guest created_at')
      .populate('user', 'name')
      .lean(),
    User.find()
      .sort({ created_at: -1 })
      .limit(10)
      .select('name created_at')
      .lean(),
  ]);

  const activity: TRecentActivityItem[] = [
    ...recentNews.map((n: any) => ({
      type: 'news_published' as const,
      title: n.title,
      date: n.published_at,
      link: `/news/${n.slug}`,
    })),
    ...recentComments.map((c: any) => ({
      type: 'comment_posted' as const,
      title: typeof c.content === 'string' ? c.content.slice(0, 80) : 'Comment',
      actor: c.user?.name || 'Guest',
      date: c.created_at,
    })),
    ...recentUsers.map((u: any) => ({
      type: 'user_signup' as const,
      title: u.name,
      date: u.created_at,
    })),
  ];

  return activity
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

const getUserGrowthTrend = async (days = 30): Promise<TTrendPoint[]> => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return await User.aggregate([
    { $match: { created_at: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', count: 1 } },
  ]);
};

// ============ ADMIN TIER ============

export const getAdminDashboardData = async (): Promise<TAdminDashboardData> => {
  const [
    totalViews,
    totalUsers,
    totalCategories,
    totalNews,
    totalComments,
    totalReactions,
    pendingNews,
    flaggedComments,
    viewTrends,
    userGrowth,
    categoryBreakdown,
    upcomingEvents,
    recentActivity,
  ] = await Promise.all([
    ViewServices.getTotalViewCount(),
    User.countDocuments(),
    Category.countDocuments(),
    News.countDocuments(),
    Comment.countDocuments(),
    Reaction.countDocuments(),
    News.countDocuments({ status: 'pending' }),
    Comment.countDocuments({ status: 'flagged' }),
    ViewServices.getViewTrends(30),
    getUserGrowthTrend(30),
    getCategoryBreakdown(8),
    getUpcomingEvents(5),
    getRecentActivity(15),
  ]);

  return {
    statistics: {
      total_views: totalViews.total,
      total_users: totalUsers,
      total_categories: totalCategories,
      total_news: totalNews,
      total_comments: totalComments,
      total_reactions: totalReactions,
      pending_news: pendingNews,
      flagged_comments: flaggedComments,
    },
    view_trends: viewTrends,
    user_growth: userGrowth,
    category_breakdown: categoryBreakdown,
    upcoming_events: upcomingEvents,
    recent_activity: recentActivity,
  };
};

// ============ EDITORIAL TIER ============

const AUTHOR_LIKE_ROLES: TRole[] = ['author', 'contributor'];
const MODERATOR_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];

const getMyContentPerformance = async (
  userId: string,
): Promise<TMyContentPerformance> => {
  const authorObjectId = new mongoose.Types.ObjectId(userId);

  const [statusCounts, viewAgg, commentCount, reactionCount, topArticles] =
    await Promise.all([
      News.aggregate([
        { $match: { author: authorObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      News.aggregate([
        { $match: { author: authorObjectId } },
        {
          $lookup: {
            from: 'views',
            localField: '_id',
            foreignField: 'news',
            as: 'views',
          },
        },
        { $project: { view_count: { $size: '$views' } } },
        { $group: { _id: null, total: { $sum: '$view_count' } } },
      ]),
      Comment.countDocuments({
        news: { $in: await News.find({ author: userId }).distinct('_id') },
      }),
      Reaction.countDocuments({
        news: { $in: await News.find({ author: userId }).distinct('_id') },
      }),
      News.aggregate([
        { $match: { author: authorObjectId } },
        {
          $lookup: {
            from: 'views',
            localField: '_id',
            foreignField: 'news',
            as: 'views',
          },
        },
        { $project: { title: 1, slug: 1, view_count: { $size: '$views' } } },
        { $sort: { view_count: -1 } },
        { $limit: 5 },
      ]),
    ]);

  const byStatus = {
    draft: 0,
    pending: 0,
    scheduled: 0,
    published: 0,
    archived: 0,
  };
  for (const row of statusCounts) {
    if (row._id in byStatus) {
      (byStatus as Record<string, number>)[row._id] = row.count;
    }
  }

  // View trend scoped to this author's own articles only.
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const myNewsIds = await News.find({ author: userId }).distinct('_id');
  const viewTrend: TTrendPoint[] = await View.aggregate([
    { $match: { news: { $in: myNewsIds }, created_at: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', count: 1 } },
  ]);

  return {
    by_status: byStatus,
    total_views: viewAgg[0]?.total ?? 0,
    total_comments: commentCount,
    total_reactions: reactionCount,
    view_trend: viewTrend,
    top_articles: topArticles.map((a: any) => ({
      _id: a._id,
      title: a.title,
      slug: a.slug,
      view_count: a.view_count,
    })),
  };
};

const getModerationQueue = async (): Promise<TModerationQueue> => {
  const [pendingNewsCount, flaggedCommentsCount, queue] = await Promise.all([
    News.countDocuments({ status: 'pending' }),
    Comment.countDocuments({ status: 'flagged' }),
    News.find({ status: 'pending' })
      .sort({ created_at: -1 })
      .limit(10)
      .select('title slug status created_at')
      .lean(),
  ]);

  return {
    pending_news_count: pendingNewsCount,
    flagged_comments_count: flaggedCommentsCount,
    queue: queue as unknown as TModerationQueue['queue'],
  };
};

export const getEditorialDashboardData = async (
  userId: string,
  role: TRole,
): Promise<TEditorialDashboardData> => {
  const [categoryBreakdown, recentActivity, myContent, moderationQueue] =
    await Promise.all([
      getCategoryBreakdown(8),
      getRecentActivity(15),
      AUTHOR_LIKE_ROLES.includes(role)
        ? getMyContentPerformance(userId)
        : Promise.resolve(undefined),
      MODERATOR_ROLES.includes(role)
        ? getModerationQueue()
        : Promise.resolve(undefined),
    ]);

  return {
    category_breakdown: categoryBreakdown,
    recent_activity: recentActivity,
    my_content: myContent,
    moderation_queue: moderationQueue,
  };
};

// ============ READER TIER ============

export const getReaderDashboardData = async (
  userId: string,
): Promise<TReaderDashboardData> => {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [commentTrend, reactionTrend, badgeProgress, profile, upcomingEvents] =
    await Promise.all([
      Comment.aggregate([
        { $match: { user: userObjectId, created_at: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
            count: { $sum: 1 },
          },
        },
      ]),
      Reaction.aggregate([
        { $match: { user: userObjectId, created_at: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
            count: { $sum: 1 },
          },
        },
      ]),
      BadgeService.getBadgeProgress(userId),
      UserProfile.findOne({ user: userId }).select(
        'following_authors following_categories following_topics',
      ),
      getUpcomingEvents(5),
    ]);

  // Merge comment + reaction daily counts into one engagement trend.
  const byDate = new Map<string, number>();
  for (const row of [...commentTrend, ...reactionTrend]) {
    byDate.set(row._id, (byDate.get(row._id) ?? 0) + row.count);
  }
  const engagementTrend: TTrendPoint[] = Array.from(byDate.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    engagement_trend: engagementTrend,
    badge_progress:
      badgeProgress as unknown as TReaderDashboardData['badge_progress'],
    following: {
      authors_count: profile?.following_authors?.length ?? 0,
      categories_count: profile?.following_categories?.length ?? 0,
      topics_count: profile?.following_topics?.length ?? 0,
    },
    upcoming_events: upcomingEvents,
  };
};
