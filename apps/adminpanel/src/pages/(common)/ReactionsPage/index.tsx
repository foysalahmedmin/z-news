import Loader from "@/components/partials/Loader";
import PageHeader from "@/components/sections/PageHeader";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import useAlert from "@/hooks/ui/useAlert";
import { cn } from "@/lib/utils";
import {
  deleteReaction,
  fetchReactions,
  updateReaction,
} from "@/services/reaction.service";
import type { TReaction } from "@/types/reaction.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCheck,
  FileText,
  Heart,
  Smile,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Zap,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";

const ReactionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const confirm = useAlert();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState<
    | "all"
    | "like"
    | "dislike"
    | "insightful"
    | "funny"
    | "disagree"
    | "pending"
    | "approved"
    | "rejected"
  >("all");

  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      type: ["like", "dislike", "insightful", "funny", "disagree"].includes(
        filter,
      )
        ? filter
        : undefined,
      status:
        filter === "pending" || filter === "approved" || filter === "rejected"
          ? filter
          : undefined,
    } as { page: number; limit: number; type?: string; status?: string };
  }, [page, limit, filter]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reactions", queryParams],
    queryFn: () => fetchReactions(queryParams),
  });

  const items = (data?.data || []) as TReaction[];
  const metaTotal = Number(data?.meta?.total || 0);
  const metaPage = Number(data?.meta?.page || page);
  const metaLimit = Number(data?.meta?.limit || limit);

  const { mutate: updateMutation } = useMutation({
    mutationFn: ({
      _id,
      ...payload
    }: Partial<{ _id: string; status: "pending" | "approved" | "rejected" }>) =>
      updateReaction(_id!, { ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reactions"] });
    },
  });

  const { mutate: deleteMutation } = useMutation({
    mutationFn: (id: string) => deleteReaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reactions"] });
    },
  });

  const handleApprove = async (item: TReaction) => {
    updateMutation({ _id: item._id, status: "approved" });
  };

  const handleReject = async (item: TReaction) => {
    updateMutation({ _id: item._id, status: "rejected" });
  };

  const handleDelete = useCallback(
    async (item: TReaction) => {
      const ok = await confirm({
        title: "Delete reaction",
        message: "Are you sure you want to delete this reaction?",
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
    navigate(`/news-articles/${newsId}`);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case "like":
        return <ThumbsUp className="size-4 text-green-600" />;
      case "dislike":
        return <ThumbsDown className="size-4 text-red-600" />;
      case "insightful":
        return <Zap className="size-4 text-amber-500" />;
      case "funny":
        return <Smile className="size-4 text-yellow-500" />;
      case "disagree":
        return <ThumbsDown className="size-4 scale-x-[-1] text-orange-600" />;
      default:
        return <Heart className="size-4 text-gray-600" />;
    }
  };

  const getReactionColor = (type: string) => {
    switch (type) {
      case "like":
        return "text-green-600 bg-green-50 border-green-200";
      case "dislike":
        return "text-red-600 bg-red-50 border-red-200";
      case "insightful":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "funny":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "disagree":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
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
                  filter === "like"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => setFilter("like")}
              >
                Likes
              </button>
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  filter === "dislike"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => setFilter("dislike")}
              >
                Dislikes
              </button>
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  filter === "insightful"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => setFilter("insightful")}
              >
                Insightful
              </button>
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  filter === "funny"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => setFilter("funny")}
              >
                Funny
              </button>
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  filter === "disagree"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => setFilter("disagree")}
              >
                Disagree
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
              Failed to load reactions.
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              No reactions found.
            </div>
          ) : (
            <div>
              {items.map((item) => {
                const timeAgo = formatDistanceToNow(new Date(item.created_at), {
                  addSuffix: true,
                });

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
                          {getReactionIcon(item.type)}
                          <p
                            className="text-foreground truncate font-semibold"
                            title={item.news?.title}
                          >
                            {item.news?.title}
                          </p>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-1 text-xs font-medium",
                              getReactionColor(item.type),
                            )}
                          >
                            {item.type}
                          </span>
                          {item.status && (
                            <span
                              className={cn(
                                "rounded-full border px-2 py-1 text-xs font-medium",
                                getStatusColor(item.status),
                              )}
                            >
                              {item.status}
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground mt-2 text-xs">
                          {timeAgo}
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-2">
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

export default ReactionsPage;
