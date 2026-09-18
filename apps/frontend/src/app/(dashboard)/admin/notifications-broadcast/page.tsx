"use client";

import PageHeader from "@/components/partials/admin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import useAlert from "@/hooks/ui/useAlert";
import {
  deleteNotification,
  fetchNotifications,
} from "@/services/admin-notification.service";
import type { TNotification } from "@/types/admin-notification.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import NotificationComposerSection from "./_components/NotificationComposerSection";
import NotificationsDataTableSection from "./_components/NotificationsDataTableSection";

// Admin-authored broadcast composer for the `Notification` module
// (/api/notification) — distinct from /admin/notifications (the
// notification-recipient inbox view). A dedicated page rather than a modal
// flow: composing + sending a broadcast is this page's primary action, with
// the list of past broadcasts underneath for reference/cleanup.
const NotificationsBroadcastPage = () => {
  const queryClient = useQueryClient();
  const confirm = useAlert();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-created_at");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications", { sort, search, page, limit }],
    queryFn: () =>
      fetchNotifications({
        page,
        limit,
        sort: sort || "-created_at",
        ...(search && { search }),
      }),
  });

  const delete_mutation = useMutation({
    mutationFn: (_id: string) => deleteNotification(_id),
    onSuccess: (data) => {
      toast.success(data?.message || "Broadcast deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to delete broadcast");
      console.error("Delete Notification Error:", error);
    },
  });

  const onDelete = async (notification: TNotification) => {
    const ok = await confirm({
      title: "Delete Broadcast",
      message: "Are you sure you want to delete this broadcast notification?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (ok) {
      delete_mutation.mutate(notification._id);
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader name="Broadcast" />

      <NotificationComposerSection />

      <Card>
        <CardHeader>
          <CardTitle>Past Broadcasts</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationsDataTableSection
            data={data?.data || []}
            isLoading={isLoading}
            isError={isError}
            onDelete={onDelete}
            state={{
              total: data?.meta?.total || 0,
              page,
              setPage,
              limit,
              setLimit,
              search,
              setSearch,
              sort,
              setSort,
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
};

export default NotificationsBroadcastPage;
