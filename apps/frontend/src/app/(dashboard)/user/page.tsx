"use client";

import type { TStatistic } from "@/components/partials/admin/StatisticCard";
import { StatisticCard } from "@/components/partials/admin/StatisticCard";
import useUser from "@/hooks/states/useUser";
import { fetchMyBookmarks } from "@/services/bookmark.service";
import { fetchNotificationRecipientsBySelf } from "@/services/notification-recipient.service";
import { getMyProfile } from "@/services/user-profile.service";
import { useQuery } from "@tanstack/react-query";

// Overview page for the plain-signed-in-user dashboard shell (`/user`).
// Just a welcome heading and a handful of at-a-glance stats, wired to real,
// already-existing endpoints (unread notification count, bookmark count,
// profile reputation score). The sub-pages these numbers link to
// (bookmarks/notifications/badges) are built in a later phase.
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
    </div>
  );
}
