"use client";

import TrendAreaChart from "@/app/(dashboard)/admin/_components/TrendAreaChart";
import UpcomingEventsWidget from "@/app/(dashboard)/admin/_components/UpcomingEventsWidget";
import BadgeProgressWidget from "@/app/(dashboard)/user/_components/BadgeProgressWidget";
import FollowingSummaryCard from "@/app/(dashboard)/user/_components/FollowingSummaryCard";
import type { TStatistic } from "@/components/partials/admin/StatisticCard";
import { StatisticCard } from "@/components/partials/admin/StatisticCard";
import useUser from "@/hooks/states/useUser";
import { fetchMyBookmarks } from "@/services/bookmark.service";
import { fetchReaderDashboard } from "@/services/dashboard.service";
import { fetchNotificationRecipientsBySelf } from "@/services/notification-recipient.service";
import { getMyProfile } from "@/services/user-profile.service";
import { useQuery } from "@tanstack/react-query";

// Overview page for the plain-signed-in-user dashboard shell (`/user`).
// The 3 stat cards (unread notifications, bookmarks, reputation score) stay
// on their own separate queries -- `getReaderDashboardData()` on the
// backend (apps/backend/src/modules/dashboard/dashboard.service.ts) only
// computes engagement_trend/badge_progress/following/upcoming_events, it
// does not include these 3 counts anywhere in its payload, so there's
// nothing on the new endpoint to switch them to. The new consolidated
// `fetchReaderDashboard()` query runs alongside them purely to power the
// sections added below (chart, badges, following, upcoming events).
export default function UserDashboardPage() {
  const { user } = useUser();

  const { data: notificationsResponse } = useQuery({
    queryKey: ["user-dashboard", "unread-notifications"],
    queryFn: () =>
      fetchNotificationRecipientsBySelf({ is_read: false, is_count_only: true }),
  });

  const { data: bookmarksResponse } = useQuery({
    queryKey: ["user-dashboard", "bookmarks-count"],
    queryFn: () => fetchMyBookmarks({ limit: 1 }),
  });

  const { data: profileResponse } = useQuery({
    queryKey: ["user-dashboard", "my-profile"],
    queryFn: () => getMyProfile(),
  });

  const { data: readerDashboard } = useQuery({
    queryKey: ["reader-dashboard"],
    queryFn: () => fetchReaderDashboard(),
  });

  const statistics: TStatistic[] = [
    {
      title: "Unread Notifications",
      value: notificationsResponse?.meta?.total ?? 0,
      subtitle: "Waiting for you",
      description: "Notifications you haven't read yet.",
      icon: "bell",
    },
    {
      title: "Bookmarks",
      value: bookmarksResponse?.meta?.total ?? 0,
      subtitle: "Saved articles",
      description: "Articles you've bookmarked to read later.",
      icon: "bookmark",
    },
    {
      title: "Reputation Score",
      value: profileResponse?.data?.reputation_score ?? 0,
      subtitle: "Community standing",
      description: "Earned from comments, reactions, and reading activity.",
      icon: "award",
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-foreground text-2xl font-semibold">
          Welcome back, {user?.info?.name || "there"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here&apos;s a quick look at your account.
        </p>
      </header>

      <section className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statistics.map((item) => (
          <StatisticCard key={item.title} item={item} />
        ))}
      </section>

      <TrendAreaChart
        title="My Engagement"
        description="Comments and reactions, last 30 days"
        data={readerDashboard?.data?.engagement_trend ?? []}
      />

      <section className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        <BadgeProgressWidget data={readerDashboard?.data?.badge_progress ?? []} />
        <FollowingSummaryCard
          data={
            readerDashboard?.data?.following ?? {
              authors_count: 0,
              categories_count: 0,
              topics_count: 0,
            }
          }
        />
      </section>

      <UpcomingEventsWidget data={readerDashboard?.data?.upcoming_events ?? []} />
    </div>
  );
}
