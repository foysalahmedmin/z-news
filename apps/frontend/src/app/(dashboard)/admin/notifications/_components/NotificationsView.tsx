"use client";

// Ported from apps/adminpanel's src/pages/(common)/NotificationsPage/index.tsx.
//
// This route has no role restriction in the source app (any authenticated
// role can view their own notifications) — matches apps/frontend's
// admin-menu-items.ts entry for "notifications", which also carries no
// `roles` list.
//
// Conversion notes:
// - `Total`/`Unread` counts came from apps/adminpanel's `useNotification()`
//   (Redux, kept live by `NotificationApplier` over socket.io). apps/frontend
//   ports the notification Redux slice/store as unused scaffolding (no
//   <Provider> is mounted — see @/providers/AppProviders.tsx and
//   @/hooks/states/useUser.tsx's cookie-based replacement for the equivalent
//   user-slice), so reading from it here would crash at runtime. Instead,
//   counts are fetched the same way `NotificationApplier` did under the
//   hood: `fetchNotificationRecipientsBySelf({ is_count_only: true })`,
//   polled on an interval as a fallback.
// - TODO(real-time): `socket.io-client` is not a dependency of apps/frontend
//   (see apps/frontend/src/components/partials/admin/Header/Notification/index.tsx
//   for the same gap/TODO on the header bell). Live push updates
//   (`notification-recipient-created/updated/deleted`, bulk read-all) are
//   NOT wired here; this page instead polls counts every 30s and relies on
//   react-query cache invalidation after each mutation. A later phase should
//   add socket.io-client as a dependency and restore real-time updates.
// - react-router's useNavigate -> not needed, this page doesn't navigate.
// - date-fns isn't a dependency of apps/frontend, so `formatDistanceToNow`
//   is replaced with the small Intl.RelativeTimeFormat-based `formatTimeAgo`
//   helper in @/lib/utils (same swap other ported admin pages made).
import Loader from "@/components/partials/admin/Loader";
import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import useAlert from "@/hooks/ui/useAlert";
import { cn, formatTimeAgo } from "@/lib/utils";
import {
  deleteNotificationRecipientBySelf,
  fetchNotificationRecipientsBySelf,
  readAllNotificationRecipientBySelf,
  updateNotificationRecipientBySelf,
} from "@/services/notification-recipient.service";
import type { TNotificationRecipient } from "@/types/notification-recipient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Mail, MailOpen, Trash2 } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

type TNotificationStatistics = { unread?: number };

const NotificationsView: React.FC = () => {
  const queryClient = useQueryClient();
  const confirm = useAlert();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      is_read: filter === "all" ? undefined : filter === "read",
    } as { page: number; limit: number; is_read?: boolean };
  }, [page, limit, filter]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications", queryParams],
    queryFn: () => fetchNotificationRecipientsBySelf(queryParams),
  });

  // Stand-in for the source app's live Redux counts (see module notes
  // above): a lightweight count-only fetch, polled every 30s.
  const { data: countsData } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: () => fetchNotificationRecipientsBySelf({ is_count_only: true }),
    refetchInterval: 30000,
  });

  const statistics = countsData?.meta?.statistics as
    | TNotificationStatistics
    | undefined;
  const unread = Number(statistics?.unread || 0);
  const total = Number(countsData?.meta?.total || 0);

  const items = (data?.data || []) as TNotificationRecipient[];
  const metaTotal = Number(data?.meta?.total || 0);
  const metaPage = Number(data?.meta?.page || page);
  const metaLimit = Number(data?.meta?.limit || limit);

  const { mutate: updateMutation } = useMutation({
    mutationFn: ({
      _id,
      ...payload
    }: Partial<{ _id: string; is_read: boolean }>) =>
      updateNotificationRecipientBySelf(_id!, { ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  const { mutate: deleteMutation } = useMutation({
    mutationFn: (id: string) => deleteNotificationRecipientBySelf(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  const { mutate: markAllAsReadMutation } = useMutation({
    mutationFn: readAllNotificationRecipientBySelf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  const handleMarkAsRead = async (item: TNotificationRecipient) => {
    updateMutation({ _id: item._id, is_read: true });
  };

  const handleDelete = useCallback(
    async (item: TNotificationRecipient) => {
      const ok = await confirm({
        title: "Delete notification",
        message: "Are you sure you want to delete this notification?",
        confirmText: "Delete",
        cancelText: "Cancel",
      });
      if (ok) {
        deleteMutation(item._id);
      }
    },
    [confirm, deleteMutation],
  );

  const handleMarkAllAsRead = async () => {
    markAllAsReadMutation();
  };

  return (
    <main className="flex size-full flex-col space-y-6">
      <PageHeader />

      <section className="flex flex-1 flex-col space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-muted-foreground text-sm">
            <span className="font-medium">Total:</span> {metaTotal || total} ·{" "}
            <span className="font-medium">Unread:</span> {unread}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleMarkAllAsRead}
              size="sm"
              variant="outline"
              disabled={unread === 0}
            >
              <CheckCheck className="mr-2 size-4" />
              Mark all as read
            </Button>

            <div className="inline-flex overflow-hidden rounded border">
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  filter === "all"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  filter === "unread"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => setFilter("unread")}
              >
                Unread
              </button>
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  filter === "read"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => setFilter("read")}
              >
                Read
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col space-y-4">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <Loader className="min-h-auto lg:min-h-auto" />
            </div>
          ) : isError ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              Failed to load notifications.
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              No notifications found.
            </div>
          ) : (
            <div>
              {items.map((item) => {
                const timeAgo = formatTimeAgo(item.created_at);

                return (
                  <div
                    key={item._id}
                    className={cn(
                      "rounded border p-4 transition-colors",
                      item.is_read ? "bg-card" : "border-primary/40 bg-muted",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-2">
                          {item.is_read ? (
                            <MailOpen className="text-muted-foreground size-4" />
                          ) : (
                            <Mail className="text-primary size-4" />
                          )}
                          <p
                            className={cn(
                              "truncate font-semibold",
                              item.is_read
                                ? "text-muted-foreground"
                                : "text-foreground",
                            )}
                            title={item.notification?.title}
                          >
                            {item.notification?.title}
                          </p>
                        </div>
                        <p className="text-muted-foreground mt-1 leading-relaxed">
                          {item.notification?.message}
                        </p>
                        <div className="text-muted-foreground mt-2 text-xs">
                          {timeAgo}
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-2">
                        {!item.is_read && (
                          <Button
                            onClick={() => handleMarkAsRead(item)}
                            size={"sm"}
                            variant="outline"
                            className="[--accent:green]"
                            shape={"default"}
                          >
                            <CheckCheck className="size-4" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDelete(item)}
                          size={"sm"}
                          variant="outline"
                          className="text-red-600 [--accent:red] hover:text-red-700"
                          shape={"default"}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Pagination
          total={metaTotal}
          limit={metaLimit}
          page={metaPage}
          setLimit={setLimit}
          setPage={setPage}
        />
      </section>
    </main>
  );
};

export default NotificationsView;
