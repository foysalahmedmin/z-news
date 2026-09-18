"use client";

import { fetchNotificationRecipientsBySelf } from "@/services/notification-recipient.service";
import { useQuery } from "@tanstack/react-query";

// Shared unread-notification-count hook for all three header bells
// (public/admin/user). Wraps a count-only fetch of the caller's own
// notification recipients filtered to unread, polled every 30s — the same
// polling convention used by apps/frontend's admin NotificationsView.tsx
// (see that file's module notes for why this polls instead of a live
// socket.io push).
//
// Response shape: `getSelfNotificationRecipients` (backend) returns the
// unread count in two equivalent places when queried with `is_read: false`:
// - `meta.total` — the main filtered query's own count (since the query is
//   itself filtered to unread items, this already *is* the unread count).
// - `meta.statistics.unread` — an independent, fixed-filter count computed
//   by `AppQueryFind.execute()`'s `statisticsQueries` (always counts
//   `{ is_read: false, recipient: user._id }` regardless of the main
//   query's own filter).
// Both resolve to the same number here. This hook prefers
// `meta.statistics.unread` to match NotificationsView.tsx's existing
// convention, falling back to `meta.total`.
type TNotificationStatistics = { unread?: number };

export function useUnreadNotificationCount() {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () =>
      fetchNotificationRecipientsBySelf({
        is_read: false,
        is_count_only: true,
      }),
    refetchInterval: 30000,
  });

  const statistics = data?.meta?.statistics as
    | TNotificationStatistics
    | undefined;
  const count = Number(statistics?.unread ?? data?.meta?.total ?? 0);

  return { count, isLoading };
}

export default useUnreadNotificationCount;
