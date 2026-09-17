"use client";

// Ported from apps/adminpanel's src/pages/(common)/CommentsPage/index.tsx.
// react-router's useNavigate -> next/navigation's useRouter. This is an
// admin CRUD page (approve/reject/pin/delete), so it reads/writes through
// @/services/admin-comment.service.ts + @/types/admin-comment.type.ts
// (the admin-api/axios client with auth + refresh handling) rather than
// the public, read-only @/services/comment.service.ts. date-fns isn't a
// dependency of this app, so `formatDistanceToNow` is replaced with the
// small Intl.RelativeTimeFormat-based `formatTimeAgo` helper in @/lib/utils.
import Loader from "@/components/partials/admin/Loader";
import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import useAlert from "@/hooks/ui/useAlert";
import { cn, formatTimeAgo } from "@/lib/utils";
import {
  deleteComment,
  fetchComments,
  pinComment,
  unpinComment,
  updateComment,
} from "@/services/admin-comment.service";
import type { TComment } from "@/types/admin-comment.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCheck,
  FileText,
  Pin,
  PinOff,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";

const CommentsView: React.FC = () => {
  const queryClient = useQueryClient();
  const confirm = useAlert();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected" | "flagged"
  >("all");

  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      status: filter === "all" ? undefined : filter,
    } as { page: number; limit: number; status?: string };
  }, [page, limit, filter]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["comments", queryParams],
    queryFn: () => fetchComments(queryParams),
  });

  const items = (data?.data || []) as TComment[];
  const metaTotal = Number(data?.meta?.total || 0);
  const metaPage = Number(data?.meta?.page || page);
  const metaLimit = Number(data?.meta?.limit || limit);

  const { mutate: updateMutation } = useMutation({
    mutationFn: ({
      _id,
      ...payload
    }: Partial<{ _id: string; status: "pending" | "approved" | "rejected" }>) =>
      updateComment(_id!, { ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const { mutate: deleteMutation } = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const handleApprove = async (item: TComment) => {
    updateMutation({ _id: item._id, status: "approved" });
  };

  const handleReject = async (item: TComment) => {
    updateMutation({ _id: item._id, status: "rejected" });
  };

  const handleDelete = useCallback(
    async (item: TComment) => {
      const ok = await confirm({
        title: "Delete comment",
        message: "Are you sure you want to delete this comment?",
        confirmText: "Delete",
        cancelText: "Cancel",
      });
      if (ok) {
        deleteMutation(item._id);
      }
    },
    [confirm, deleteMutation],
  );

  const handleViewNews = (newsId: string) => {
    router.push(`/admin/news-articles/${newsId}`);
  };

  return (
    <main className="flex size-full flex-col space-y-6">
      <PageHeader />

      <section className="flex flex-1 flex-col space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-muted-foreground text-sm">
            <span className="font-medium">Total:</span> {metaTotal}
          </div>

          <div className="flex items-center gap-2">
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
                  filter === "pending"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => setFilter("pending")}
              >
                Pending
              </button>
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  filter === "approved"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => setFilter("approved")}
              >
                Approved
              </button>
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  filter === "rejected"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => setFilter("rejected")}
              >
                Rejected
              </button>
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  filter === "flagged"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => setFilter("flagged")}
              >
                Flagged
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
              Failed to load comments.
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              No comments found.
            </div>
          ) : (
            <div>
              {items.map((item) => {
                const timeAgo = formatTimeAgo(item.created_at);
                const isFlagged = item.flagged_count && item.flagged_count > 0;

                return (
                  <div
                    key={item._id}
                    className={cn(
                      "rounded border p-4 transition-colors",
                      item.status === "approved"
                        ? "bg-card"
                        : item.status === "rejected"
                          ? "border-red-200 bg-red-50/50"
                          : "border-yellow-200 bg-yellow-50/50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-2">
                          <FileText className="text-muted-foreground size-4" />
                          <p
                            className="text-foreground truncate font-semibold"
                            title={item.news?.title}
                          >
                            {item.news?.title}
                          </p>
                          <span
                            className={cn(
                              "w-fit rounded-full border px-2 py-1 text-xs font-bold",
                              item.status === "approved"
                                ? "border-green-200 bg-green-100 text-green-700"
                                : item.status === "rejected"
                                  ? "border-red-200 bg-red-100 text-red-700"
                                  : "border-yellow-200 bg-yellow-100 text-yellow-700",
                            )}
                          >
                            {item.status || "pending"}
                          </span>
                          {isFlagged && (
                            <span className="flex items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                              <ShieldAlert className="size-3" />
                              {item.flagged_count} Reports
                            </span>
                          )}
                          {item.is_pinned && (
                            <span className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                              <Pin className="size-3" />
                              Pinned
                            </span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-muted-foreground text-sm">
                            <span className="font-medium">By:</span> {item.name}{" "}
                            ({item.email})
                          </p>
                          <p className="text-foreground leading-relaxed">
                            {item.content}
                          </p>
                        </div>
                        <div className="text-muted-foreground mt-2 text-xs">
                          {timeAgo}
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-2">
                        {item.is_pinned ? (
                          <Button
                            onClick={() =>
                              unpinComment(item._id).then(() =>
                                queryClient.invalidateQueries({
                                  queryKey: ["comments"],
                                }),
                              )
                            }
                            size={"sm"}
                            variant="outline"
                            className="[--accent:gray]"
                            shape={"default"}
                            title="Unpin from top"
                          >
                            <PinOff className="size-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() =>
                              pinComment(item._id).then(() =>
                                queryClient.invalidateQueries({
                                  queryKey: ["comments"],
                                }),
                              )
                            }
                            size={"sm"}
                            variant="outline"
                            className="[--accent:blue]"
                            shape={"default"}
                            title="Pin to top"
                          >
                            <Pin className="size-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleViewNews(item.news._id)}
                          size={"sm"}
                          variant="outline"
                          className="[--accent:blue]"
                          shape={"default"}
                        >
                          <FileText className="size-4" />
                        </Button>
                        {item.status !== "approved" && (
                          <Button
                            onClick={() => handleApprove(item)}
                            size={"sm"}
                            variant="outline"
                            className="[--accent:green]"
                            shape={"default"}
                          >
                            <CheckCheck className="size-4" />
                            Approve
                          </Button>
                        )}
                        {item.status !== "rejected" && (
                          <Button
                            onClick={() => handleReject(item)}
                            size={"sm"}
                            variant="outline"
                            className="[--accent:orange]"
                            shape={"default"}
                          >
                            Reject
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

export default CommentsView;
