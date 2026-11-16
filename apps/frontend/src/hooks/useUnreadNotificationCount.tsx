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
// Shares the ["notifications-count"] query (same key, same request) with the
// notifications pages, so their invalidations after read/delete also update
// every bell. `meta.statistics.unread` is computed by the backend with a fixed
// `{ is_read: false, recipient }` filter regardless of the main query.
type TNotificationStatistics = { unread?: number };

export function useUnreadNotificationCount() {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: () => fetchNotificationRecipientsBySelf({ is_count_only: true }),
    refetchInterval: 30000,
  });

  const statistics = data?.meta?.statistics as
    | TNotificationStatistics
    | undefined;
  const count = Number(statistics?.unread ?? 0);

  return { count, isLoading };
}

export default useUnreadNotificationCount;
