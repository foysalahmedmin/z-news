# Role-Based Real-Data Dashboards — Design

**Status:** Approved (via chat brainstorming session, 2026-09-19). Ready for implementation planning.

## Problem

Today there are two dashboard surfaces:

- `/admin` — one dashboard, shown identically to every role that can reach it (super-admin, admin, editor, author, contributor). It has 4 real stat cards and one real view-trends chart (both wired to `/api/view/analytics/*` in an earlier phase), plus a third section, `DataTableUserActivitiesSection`, that renders 30 entirely fictional users (`user-activities-data.ts` — fake names, fake emails, and roles like `"manager"`/`"viewer"` that don't exist in the real system) with inert Edit/Delete buttons. It duplicates what `/admin/users` already does for real, with made-up data.
- `/user` — a personal dashboard for any signed-in role (subscriber, user, and technically everyone else too, since the route isn't role-gated beyond "must be signed in"). It has 3 real stat cards (unread notifications, bookmark count, reputation score) and no charts at all.

Neither surface differentiates by role. An editor, an author, and a super-admin all see the same `/admin` page. The goal of this project: delete the fake data, and give every role a dashboard that actually reflects what that role does in the system — statistics, charts, and real recent activity/events — built on new backend aggregation work.

## Decisions made during brainstorming

1. **Three dashboard tiers, not 7 bespoke pages and not 1 generic page:**
   - **Admin tier** — super-admin, admin.
   - **Editorial tier** — editor, author, contributor.
   - **Reader tier** — subscriber, user (and any other role visiting `/user` for their personal stats).
2. **"Events" means both things the user could have meant** — a real widget surfacing the actual `Event` model (upcoming events), AND a real recent-activity feed (new articles, comments, signups) replacing the fake table.
3. **Editorial tier is one shared page template with a couple of role-conditional sections**, not 3 fully separate designs and not one identical page for all three roles. "My Content Performance" (author/contributor) and "Moderation Queue" (editor) render conditionally within the same dashboard.
4. **Backend serves dashboards from one consolidated, cached endpoint per tier** (a new `dashboard` module), not by composing many small existing endpoints client-side. This keeps the aggregation logic in one place and matches how the admin dashboard's stat cards currently *don't* work (4 separate parallel queries today) — this project intentionally moves away from that pattern for the new work.

## Where each tier lives

- **Admin tier** → the existing `/admin` route. `apps/frontend/src/app/(dashboard)/admin/page.tsx` becomes role-aware: it reads the signed-in user's role and renders either `AdminTierDashboard` or `EditorialTierDashboard`.
- **Editorial tier** → the same `/admin` route, via the role branch above.
- **Reader tier** → the existing `/user` route (`apps/frontend/src/app/(dashboard)/user/page.tsx`), enriched in place — not a new route.

This reuses the two dashboard shells already built (admin shell, user shell) rather than adding new route groups or layouts.

## Content per tier

### Admin tier

Keep (already real, built in an earlier phase): Total Views / Total Users / Total Categories / Total News stat cards, and the 7d/30d/90d view-trends area chart.

Add:
- Stat cards: Total Comments, Total Reactions, Pending Moderation (pending-review articles + flagged comments, combined or as two cards).
- Category-performance chart — article count per category (bar chart), sorted descending, top N categories.
- User-growth-over-time chart — new signups per day/week over the selected range.
- **Upcoming Events** widget — small list, real `Event` records, soonest-first.
- **Recent Activity** feed — replaces `DataTableUserActivitiesSection` entirely. Merged, time-sorted feed of real events: newly published articles, new comments, new user signups (each row: type icon, short description, actor, timestamp, link to the thing). This is the direct fix for the fake-data complaint.

Remove: `DataTableUserActivitiesSection` component and `user-activities-data.ts` — deleted, not just unwired.

### Editorial tier (editor / author / contributor)

Shared, all three roles: category-performance chart (identical data/component to the admin tier's), Recent Activity feed (site-wide, same feed as admin tier — contributors/authors benefit from seeing what's happening beyond their own content).

Conditional — **author, contributor**: "My Content Performance" section — my articles by status (draft/pending/published/archived), total views/comments/reactions across my articles, a personalized view-trend chart (views on my articles only, not site-wide), a small "my top articles by views" list.

Conditional — **editor** (and admin roles, if they ever land on this branch): "Moderation Queue" section — pending-review article count, flagged-comment count, a short list of the most recent items awaiting review with direct links.

### Reader tier (`/user`)

Keep (already real): Unread Notifications, Bookmarks, Reputation Score stat cards.

Add:
- "My Engagement Over Time" chart — the viewer's own comments + reactions, grouped by day, last 30 days.
- **Badge progress** widget — wires the already-existing, currently-unused `GET /api/badge/progress` endpoint.
- **Following** summary — counts of followed authors/categories/topics (data already available via `getMyProfile()`, just not surfaced on this page yet).
- Upcoming Events widget — same component/data source as the other two tiers.

## Backend

New module: `apps/backend/src/modules/dashboard/` (route, controller, service, type — following this codebase's existing module shape).

Three endpoints:
- `GET /api/dashboard/admin` — `auth('super-admin', 'admin')`.
- `GET /api/dashboard/editorial` — `auth('super-admin', 'admin', 'editor', 'author', 'contributor')`; the service branches on `req.user.role` to decide whether to include the "my content" or "moderation queue" section (or both, if a super-admin/admin happens to call it).
- `GET /api/dashboard/reader` — `auth()` with the full role list (any signed-in role) — everyone has a personal reader dashboard, independent of their admin-side privileges.

Each endpoint runs its own MongoDB aggregation pipelines against existing models (News, User, Comment, Reaction, View, Event, Bookmark, UserProfile, Badge) and returns one consolidated JSON payload — no new persistent "activity log" collection; the Recent Activity feed is *derived* on read by aggregating existing timestamped collections (News.published_at, Comment.created_at, User.created_at), not written by instrumenting every controller with logging calls. Each endpoint is cached with a short TTL (matching the existing `withCache`/`invalidateCacheByPattern` pattern already used elsewhere in the backend, e.g. `news-headline.service.ts`) since dashboard aggregations are more expensive than a typical list query and don't need to be real-time-fresh on every render.

## Frontend

- `apps/frontend/src/services/dashboard.service.ts` — `fetchAdminDashboard()` / `fetchEditorialDashboard()` via `@/lib/admin-api` (matching every other `/admin` page's convention), `fetchReaderDashboard()` via `@/lib/api` (matching `/user`'s existing convention — its current services all use the public Fetch client, not the admin axios client).
- New presentational components, reused across tiers where the data shape matches: a Recent-Activity feed row/list, an Upcoming-Events widget card, a badge-progress bar. Charts built from the existing `@/components/ui/Chart` (recharts) wrapper and `StatisticCard`, matching the existing view-trends chart's structure (time-range selector, gradient area fill) rather than introducing a new charting approach.
- `AdminTierDashboard` and `EditorialTierDashboard` components under `apps/frontend/src/app/(dashboard)/admin/_components/`; `/admin/page.tsx` picks between them based on `useUser()`'s role.
- `/user/page.tsx` gets its new sections added in place.

## Out of scope

- No new persistent activity-log/audit-log collection — everything is derived by aggregation from existing collections.
- No real-time push/websocket updates — dashboards load-on-visit plus whatever short-TTL cache freshness the backend provides, consistent with how the rest of this app already works (e.g. the existing notification bells poll every 30s rather than push).
- No changes to the 7 individual role permissions/route-gating elsewhere in the app — this project only adds 3 new read endpoints and reshapes 2 existing pages.
