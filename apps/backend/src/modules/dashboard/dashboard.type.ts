export type TTrendPoint = {
  date: string;
  count: number;
};

export type TCategoryBreakdownItem = {
  _id: string;
  name: string;
  slug: string;
  count: number;
};

export type TUpcomingEvent = {
  _id: string;
  name: string;
  slug: string;
  published_at: Date;
};

export type TRecentActivityItem = {
  type: 'news_published' | 'comment_posted' | 'user_signup';
  title: string;
  actor?: string;
  date: Date;
  link?: string;
};

export type TAdminDashboardData = {
  statistics: {
    total_views: number;
    total_users: number;
    total_categories: number;
    total_news: number;
    total_comments: number;
    total_reactions: number;
    pending_news: number;
    flagged_comments: number;
  };
  view_trends: TTrendPoint[];
  user_growth: TTrendPoint[];
  category_breakdown: TCategoryBreakdownItem[];
  upcoming_events: TUpcomingEvent[];
  recent_activity: TRecentActivityItem[];
};

export type TMyContentPerformance = {
  by_status: {
    draft: number;
    pending: number;
    scheduled: number;
    published: number;
    archived: number;
  };
  total_views: number;
  total_comments: number;
  total_reactions: number;
  view_trend: TTrendPoint[];
  top_articles: {
    _id: string;
    title: string;
    slug: string;
    view_count: number;
  }[];
};

export type TModerationQueue = {
  pending_news_count: number;
  flagged_comments_count: number;
  queue: {
    _id: string;
    title: string;
    slug: string;
    status: string;
    created_at: Date;
  }[];
};

export type TEditorialDashboardData = {
  category_breakdown: TCategoryBreakdownItem[];
  recent_activity: TRecentActivityItem[];
  my_content?: TMyContentPerformance;
  moderation_queue?: TModerationQueue;
};

export type TBadgeProgressItem = {
  badge: {
    _id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    rarity: string;
    points: number;
  };
  earned: boolean;
  current: number;
  threshold: number;
  percentage: number;
};

export type TReaderDashboardData = {
  engagement_trend: TTrendPoint[];
  badge_progress: TBadgeProgressItem[];
  following: {
    authors_count: number;
    categories_count: number;
    topics_count: number;
  };
  upcoming_events: TUpcomingEvent[];
};
