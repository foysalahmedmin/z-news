import { Category } from '../category/category.model';
import { Comment } from '../comment/comment.model';
import { Event } from '../event/event.model';
import { News } from '../news/news.model';
import { Reaction } from '../reaction/reaction.model';
import { User } from '../user/user.model';
import * as ViewServices from '../view/view.service';
import {
  TAdminDashboardData,
  TCategoryBreakdownItem,
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
      title:
        typeof c.content === 'string' ? c.content.slice(0, 80) : 'Comment',
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
