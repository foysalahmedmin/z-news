# Role-Based Real-Data Dashboards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fake-data admin dashboard table and the flat, role-blind `/admin`/`/user` dashboards with 3 real, role-appropriate dashboards (Admin, Editorial, Reader) backed by real MongoDB aggregations.

**Architecture:** New backend `dashboard` module (`apps/backend/src/modules/dashboard/`) with 3 consolidated, cached, role-gated GET endpoints, each returning one payload per tier. `/admin/page.tsx` becomes role-aware (renders `AdminTierDashboard` or `EditorialTierDashboard`); `/user/page.tsx` gets new sections added in place. `DataTableUserActivitiesSection` + its fake data file are deleted.

**Tech Stack:** Express/Mongoose aggregation pipelines (backend), Next.js 15 + `@tanstack/react-query` + recharts via the existing `@/components/ui/Chart` wrapper (frontend). Design spec: `docs/superpowers/specs/2026-09-19-role-based-dashboards-design.md`.

---

## Context: verified backend field names (from direct model inspection, not assumptions)

Every model in this codebase uses **explicit snake_case timestamps** (`{ createdAt: 'created_at', updatedAt: 'updated_at' }`) and **auto-injects `is_deleted: { $ne: true }` on every `.aggregate()` call** via a `pre('aggregate')` hook — so aggregation pipelines never need a manual `is_deleted` match on the top-level collection being aggregated.

- **News** (`apps/backend/src/modules/news/news.model.ts`): `status` enum `['draft','pending','scheduled','published','archived']`, `category` (single ObjectId ref Category), `author` (ObjectId ref User — **not** `created_by`), `published_at`, `title`, `slug`.
- **User** (`.../user/user.model.ts`): `role` enum matches `TRole`, `is_deleted` (`select:false`).
- **Comment** (`.../comment/comment.model.ts`): `user` (ObjectId ref User, optional if `guest` set), `news`, `content`, `status` enum `['pending','approved','rejected','flagged']`, `flagged_count`.
- **Reaction** (`.../reaction/reaction.model.ts`): `user`, `news`, `type` enum `['like','dislike','insightful','funny','disagree']`.
- **View** (`.../view/view.model.ts`): `news`, `user` (optional). `view.service.ts` already has `getTopViewedNews(limit)`, `getViewTrends(days)`, `getTotalViewCount()` — **reuse these directly**, don't duplicate.
- **Event** (`.../event/event.model.ts`): `name`, `slug`, `published_at` (the event's date field — **not** `start_date`), `status` enum `['active','inactive']`.
- **Category** (`.../category/category.model.ts`): `name`, `slug`.
- **UserProfile** (`.../user-profile/user-profile.model.ts`): `reputation_score`, `following_authors`, `following_categories`, `following_topics`.
- **Badge progress** — `apps/backend/src/modules/badge/badge.service.ts` already exports `getBadgeProgress(userId)`, returning `[{ badge: {_id,name,description,icon,category,rarity,points}, earned, current, threshold, percentage }, ...]`. Reuse directly.
- **Caching** (`apps/backend/src/utils/cache.utils.ts`): `generateCacheKey(prefix, parts[])`, `withCache(key, ttlSeconds, fn)`, `invalidateCacheByPattern(pattern)`.
- **No existing pattern for in-service role-branching** (`req.user.role` checked in a service, not just route-level `auth()`) exists anywhere in this codebase yet — this plan establishes that pattern for the editorial dashboard, using plain `if (roles.includes(role))` checks (the codebase's `news.policy.ts` role-array-constant style is dead code elsewhere, but its naming convention — `export const X_ROLES: TRole[] = [...]` — is worth following for readability).
- Mongoose collection name for News is confirmed `'news'` (irregular plural, seen in `view.service.ts`'s existing `$lookup`). Category/User/Comment/Reaction/Event use Mongoose's regular default pluralization (`categories`, `users`, `comments`, `reactions`, `events`) — standard, not verified against a live DB, but every other module already relies on this same default.

**Moderation queue definition** (this plan's choice, not a pre-existing concept): "pending moderation" = `News.status === 'pending'` (author-submitted, awaiting publish) + `Comment.status === 'flagged'`. The richer `Workflow` module (per-stage assignee/approval tracking) exists but is a separate, heavier concept — out of scope for this dashboard; a future iteration could join against it.

---

## Phase 1: Backend `dashboard` module — full detail

### Task 1: Dashboard response types

**Files:**
- Create: `apps/backend/src/modules/dashboard/dashboard.type.ts`

- [ ] **Step 1: Write the type file**

```ts
// apps/backend/src/modules/dashboard/dashboard.type.ts

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
```

- [ ] **Step 2: Verify it compiles**

Run: `cd apps/backend && npx tsc --noEmit`
Expected: no new errors (this file has no logic, just types — it can't fail on its own, but confirm the command still runs clean before moving on).

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/dashboard/dashboard.type.ts
git commit -m "feat: add dashboard module response types"
```

### Task 2: Dashboard service — shared helpers + Admin tier aggregation

**Files:**
- Create: `apps/backend/src/modules/dashboard/dashboard.service.ts`

- [ ] **Step 1: Write the service, starting with shared helpers and the Admin dashboard function**

```ts
// apps/backend/src/modules/dashboard/dashboard.service.ts
import * as BadgeService from '../badge/badge.service';
import { Category } from '../category/category.model';
import { Comment } from '../comment/comment.model';
import { Event } from '../event/event.model';
import { News } from '../news/news.model';
import { Reaction } from '../reaction/reaction.model';
import { User } from '../user/user.model';
import { UserProfile } from '../user-profile/user-profile.model';
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
```

Note: `ViewServices.getTotalViewCount()` returns `{ total: number }` and `getViewTrends(days)` returns `TTrendPoint[]`-shaped objects already (`{date, count}`) per the existing `view.service.ts` code — both reused as-is, not reimplemented.

- [ ] **Step 2: Verify it compiles**

Run: `cd apps/backend && npx tsc --noEmit`
Expected: 0 new errors (compare against the pre-existing ~295-line baseline this repo already has — confirm none of the new lines are in `dashboard.service.ts`).

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/dashboard/dashboard.service.ts
git commit -m "feat: dashboard service -- shared helpers + Admin tier aggregation"
```

### Task 3: Dashboard service — Editorial and Reader tiers

**Files:**
- Modify: `apps/backend/src/modules/dashboard/dashboard.service.ts`

- [ ] **Step 1: Append the Editorial and Reader tier functions**

```ts
// Append to apps/backend/src/modules/dashboard/dashboard.service.ts,
// after getAdminDashboardData. Add this import at the top alongside the
// others: import { TRole } from '../../types/jsonwebtoken.type';

// ============ EDITORIAL TIER ============

const AUTHOR_LIKE_ROLES: TRole[] = ['author', 'contributor'];
const MODERATOR_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];

const getMyContentPerformance = async (
  userId: string,
): Promise<TMyContentPerformance> => {
  const [statusCounts, viewAgg, commentCount, reactionCount, topArticles] =
    await Promise.all([
      News.aggregate([
        { $match: { author: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      News.aggregate([
        { $match: { author: userId } },
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
        { $match: { author: userId } },
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

  const byStatus = { draft: 0, pending: 0, scheduled: 0, published: 0, archived: 0 };
  for (const row of statusCounts) {
    if (row._id in byStatus) {
      (byStatus as Record<string, number>)[row._id] = row.count;
    }
  }

  // View trend scoped to this author's own articles only.
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const myNewsIds = await News.find({ author: userId }).distinct('_id');
  const viewTrend: TTrendPoint[] = await (
    await import('../view/view.model')
  ).View.aggregate([
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

  const [commentTrend, reactionTrend, badgeProgress, profile, upcomingEvents] =
    await Promise.all([
      Comment.aggregate([
        { $match: { user: userId, created_at: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
            count: { $sum: 1 },
          },
        },
      ]),
      Reaction.aggregate([
        { $match: { user: userId, created_at: { $gte: since } } },
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
    badge_progress: badgeProgress,
    following: {
      authors_count: profile?.following_authors?.length ?? 0,
      categories_count: profile?.following_categories?.length ?? 0,
      topics_count: profile?.following_topics?.length ?? 0,
    },
    upcoming_events: upcomingEvents,
  };
};
```

Note: `getMyContentPerformance` uses a dynamic `await import('../view/view.model')` for the `View` model purely to avoid an unused top-level import in `getAdminDashboardData`-only scenarios — if this feels inconsistent once written, hoist `import { View } from '../view/view.model';` to the top of the file alongside the other model imports instead (cleaner; do this rather than keep the dynamic import — the dynamic-import form above is written defensively in case `View` isn't already imported elsewhere in the file, but the top-level import is the correct final form and matches every other model import in this file).

- [ ] **Step 2: Verify it compiles**

Run: `cd apps/backend && npx tsc --noEmit`
Expected: 0 new errors in `dashboard.service.ts`.

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/modules/dashboard/dashboard.service.ts
git commit -m "feat: dashboard service -- Editorial and Reader tier aggregation"
```

### Task 4: Dashboard controller, route, and caching

**Files:**
- Create: `apps/backend/src/modules/dashboard/dashboard.controller.ts`
- Create: `apps/backend/src/modules/dashboard/dashboard.route.ts`
- Modify: `apps/backend/src/routes/index.ts`

- [ ] **Step 1: Write the controller**

```ts
// apps/backend/src/modules/dashboard/dashboard.controller.ts
import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { generateCacheKey, withCache } from '../../utils/cache.utils';
import * as DashboardService from './dashboard.service';

const CACHE_PREFIX = 'dashboard';
const CACHE_TTL = 120;

export const getAdminDashboard = catchAsync(async (_req, res) => {
  const result = await withCache(
    generateCacheKey(CACHE_PREFIX, ['admin']),
    CACHE_TTL,
    () => DashboardService.getAdminDashboardData(),
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Admin dashboard data retrieved successfully',
    data: result,
  });
});

export const getEditorialDashboard = catchAsync(async (req, res) => {
  const result = await withCache(
    generateCacheKey(CACHE_PREFIX, ['editorial', req.user._id, req.user.role]),
    CACHE_TTL,
    () => DashboardService.getEditorialDashboardData(req.user._id, req.user.role),
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Editorial dashboard data retrieved successfully',
    data: result,
  });
});

export const getReaderDashboard = catchAsync(async (req, res) => {
  const result = await withCache(
    generateCacheKey(CACHE_PREFIX, ['reader', req.user._id]),
    CACHE_TTL,
    () => DashboardService.getReaderDashboardData(req.user._id),
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reader dashboard data retrieved successfully',
    data: result,
  });
});
```

- [ ] **Step 2: Write the route**

```ts
// apps/backend/src/modules/dashboard/dashboard.route.ts
import express from 'express';
import auth from '../../middlewares/auth.middleware';
import * as DashboardControllers from './dashboard.controller';

const router = express.Router();

router.get(
  '/admin',
  auth('super-admin', 'admin'),
  DashboardControllers.getAdminDashboard,
);

router.get(
  '/editorial',
  auth('super-admin', 'admin', 'editor', 'author', 'contributor'),
  DashboardControllers.getEditorialDashboard,
);

router.get(
  '/reader',
  auth(
    'super-admin',
    'admin',
    'editor',
    'author',
    'contributor',
    'subscriber',
    'user',
  ),
  DashboardControllers.getReaderDashboard,
);

const DashboardRoutes = router;

export default DashboardRoutes;
```

- [ ] **Step 3: Mount the route**

In `apps/backend/src/routes/index.ts`, add the import alongside the other module imports (alphabetically, after `CommentRoutes`/`EnhancedCommentRoutes` and before `eventRoutes` — matching the file's existing alphabetical-ish ordering):

```ts
import DashboardRoutes from '../modules/dashboard/dashboard.route';
```

And add to the `moduleRoutes` array (placement doesn't affect behavior, but keep it near `/view` for discoverability — it's the other analytics-shaped module):

```ts
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
```

- [ ] **Step 4: Verify**

```bash
cd apps/backend && npx tsc --noEmit && npx jest
```
Expected: 0 new tsc errors, 49/49 test suites still passing (no existing test touches this new module, so nothing should break).

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/modules/dashboard/dashboard.controller.ts apps/backend/src/modules/dashboard/dashboard.route.ts apps/backend/src/routes/index.ts
git commit -m "feat: dashboard controller, routes, and mount -- GET /api/dashboard/{admin,editorial,reader}"
```

---

## Phase 2: Frontend `dashboard.service.ts` — full detail

### Task 5: Frontend dashboard service and types

**Files:**
- Create: `apps/frontend/src/types/dashboard.type.ts`
- Create: `apps/frontend/src/services/dashboard.service.ts`

- [ ] **Step 1: Write the frontend types** (mirroring the backend response shapes from Task 1 exactly)

```ts
// apps/frontend/src/types/dashboard.type.ts
import type { Response } from "./response.type";

export type TTrendPoint = { date: string; count: number };

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
  published_at: string;
};

export type TRecentActivityItem = {
  type: "news_published" | "comment_posted" | "user_signup";
  title: string;
  actor?: string;
  date: string;
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
  top_articles: { _id: string; title: string; slug: string; view_count: number }[];
};

export type TModerationQueue = {
  pending_news_count: number;
  flagged_comments_count: number;
  queue: { _id: string; title: string; slug: string; status: string; created_at: string }[];
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

export type TAdminDashboardResponse = Response<TAdminDashboardData>;
export type TEditorialDashboardResponse = Response<TEditorialDashboardData>;
export type TReaderDashboardResponse = Response<TReaderDashboardData>;
```

- [ ] **Step 2: Write the service**

`/admin`'s dashboard (both Admin and Editorial tiers) uses `@/lib/admin-api`, matching every other `/admin` page's convention. `/user`'s reader dashboard uses `@/lib/api`, matching every other `/user` page's convention (confirm this split against `apps/frontend/src/services/admin-event.service.ts` for the admin-api call style, and `apps/frontend/src/services/bookmark.service.ts` for the public api call style, before writing — both were already established in earlier phases of this same project).

```ts
// apps/frontend/src/services/dashboard.service.ts
import adminApi from "@/lib/admin-api";
import api from "@/lib/api";
import type {
  TAdminDashboardResponse,
  TEditorialDashboardResponse,
  TReaderDashboardResponse,
} from "@/types/dashboard.type";

export async function fetchAdminDashboard(): Promise<TAdminDashboardResponse> {
  const response = await adminApi.get("/api/dashboard/admin");
  return response.data as TAdminDashboardResponse;
}

export async function fetchEditorialDashboard(): Promise<TEditorialDashboardResponse> {
  const response = await adminApi.get("/api/dashboard/editorial");
  return response.data as TEditorialDashboardResponse;
}

export async function fetchReaderDashboard(): Promise<TReaderDashboardResponse> {
  const response = await api.get("/api/dashboard/reader");
  return response.data as TReaderDashboardResponse;
}
```

(Adjust `adminApi.get`'s call shape and `api.get`'s call shape to match whatever Step 1's file-reads actually show — `admin-api` is axios-shaped (`response.data` is the parsed body directly), `api` is the `Fetch` wrapper class (`response.data` is also the parsed body per its `FetchResponse<T>` type) — both should end up as `response.data as T`, but verify against the real files rather than trusting this plan blindly, since it's easy to mix up call conventions between the two clients.)

- [ ] **Step 3: Verify**

```bash
cd apps/frontend && npx tsc --noEmit && npx eslint src/types/dashboard.type.ts src/services/dashboard.service.ts
```
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/types/dashboard.type.ts apps/frontend/src/services/dashboard.service.ts
git commit -m "feat: frontend dashboard service and types"
```

---

## Phases 3–6 (scope only — detailed immediately before each starts, same pattern used successfully for this project's earlier backend-frontend-parity plan)

- **Phase 3 — Admin tier frontend:** Make `apps/frontend/src/app/(dashboard)/admin/page.tsx` role-aware (read `useUser()`'s role, branch between `AdminTierDashboard` and `EditorialTierDashboard`). Build `AdminTierDashboard` under `admin/_components/`, composed of: existing `AdminStatisticsSection` extended with the 4 new stat cards (comments/reactions/pending/flagged) sourced from `fetchAdminDashboard()` instead of its current 4 separate parallel queries; existing `ChartAreaInteractiveSection` re-pointed at the new endpoint's `view_trends` (or left as-is if it's simpler to keep its own query — decide when detailing this phase); new `CategoryBreakdownChart` (bar chart, recharts, mirrors `ChartAreaInteractiveSection`'s `ChartContainer` usage); new `UserGrowthChart` (same pattern); new `UpcomingEventsWidget` (small card list); new `RecentActivityFeed` (row list with type-based icons). Delete `DataTableUserActivitiesSection/` (component + `user-activities-data.ts`) and its import in `page.tsx` entirely.
- **Phase 4 — Editorial tier frontend:** Build `EditorialTierDashboard` reusing `CategoryBreakdownChart`/`RecentActivityFeed` from Phase 3 (shared components, not duplicated), plus new conditionally-rendered `MyContentPerformanceSection` (stat cards + personalized view-trend chart + top-articles mini-list, rendered only when `editorialData.my_content` is present in the response) and `ModerationQueueSection` (stat cards + queue list, rendered only when `editorialData.moderation_queue` is present).
- **Phase 5 — Reader tier frontend:** Enrich `apps/frontend/src/app/(dashboard)/user/page.tsx` in place: keep the 3 existing stat cards (now optionally re-sourced from `fetchReaderDashboard()`'s `following` field for consistency, or left on their current individual queries — decide when detailing), add an `EngagementTrendChart` (line/area chart from `engagement_trend`), a `BadgeProgressWidget` (progress bars per badge from `badge_progress`), a `FollowingSummaryCard` (3 counts), and reuse `UpcomingEventsWidget` from Phase 3.
- **Phase 6 — Cleanup and final verification:** Confirm `DataTableUserActivitiesSection` has zero remaining references anywhere (grep), confirm the 3 old separate-query patterns in `AdminStatisticsSection`/`ChartAreaInteractiveSection` are fully replaced (no dead/unused imports left behind), full-repo `tsc`/`eslint`/`next build` (frontend) + `tsc`/`jest` (backend), verify all 3 dashboard routes render correctly for each real role by checking the route table in a production build and confirming no new eslint errors outside this project's own files.

---

## Self-review

**Spec coverage:** Every content item from the design spec's "Content per tier" section maps to a named component in Phases 3–5. The 3 backend endpoints (Phase 1) match the spec's "Backend" section exactly (module shape, role gates, consolidated-payload approach, caching).

**Placeholder scan:** No TBD/TODO. The one spot needing a decision during Phase 3/5 detailing (whether `ChartAreaInteractiveSection`/the 3 existing `/user` stat cards keep their own queries vs. re-source from the new consolidated endpoint) is flagged explicitly as a decision point, not silently assumed, since both existing sections already work correctly today and re-plumbing them is a judgment call about DRY-ness vs. touching working code unnecessarily.

**Type consistency:** `TAdminDashboardData`/`TEditorialDashboardData`/`TReaderDashboardData` and their nested types are defined once in Task 1 (backend) and mirrored field-for-field in Task 5 (frontend) — same field names throughout, `Date` (backend) vs `string` (frontend, since JSON has no Date type) is the only intentional difference. Function names (`getAdminDashboardData`, `getEditorialDashboardData`, `getReaderDashboardData`, `fetchAdminDashboard`, `fetchEditorialDashboard`, `fetchReaderDashboard`) are used consistently between where they're defined and where Phases 3–5 will call them.
