"use client";

// Ported from apps/adminpanel's src/pages/(common)/CommentsPage/index.tsx.
// react-router's useNavigate -> next/navigation's useRouter. This is an
// admin CRUD page (approve/reject/pin/delete), so it reads/writes through
// @/services/admin-comment.service.ts + @/types/admin-comment.type.ts
// (the admin-api/axios client with auth + refresh handling) rather than
// the public, read-only @/services/comment.service.ts. date-fns isn't a
// dependency of this app, so `formatDistanceToNow` is replaced with the
// small Intl.RelativeTimeFormat-based `formatTimeAgo` helper in @/lib/utils.
//
// Phase G (comment moderation polish) adds:
// - A "Flagged Queue" tab, distinct from the "Flagged" status filter tab:
//   the status filter answers "comments whose `status` field is flagged",
//   while the queue answers "comments with N+ reports regardless of
//   status" via the dedicated GET /api/comment-enhanced/flagged/list
//   endpoint (fetchFlaggedComments) with a min_flags threshold.
// - The queue's Approve/Reject actions call the admin-only
//   PATCH /api/comment-enhanced/:id/moderate endpoint (moderateComment),
//   which can carry an optional moderation reason, instead of the base
//   PATCH /api/comment/:id (updateComment) used by the standard list.
// - A per-row "History" action opens the public, no-auth
//   GET /api/comment-enhanced/:comment_id/history endpoint
//   (fetchCommentHistory) in a modal.
import Loader from "@/components/partials/admin/Loader";
import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { FormControl, FormControlLabel } from "@/components/ui/FormControl";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseTrigger,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import useAlert from "@/hooks/ui/useAlert";
import { cn, formatTimeAgo } from "@/lib/utils";
import {
  deleteComment,
  fetchComments,
  fetchCommentHistory,
  fetchFlaggedComments,
  moderateComment,
  pinComment,
  unpinComment,
  updateComment,
} from "@/services/admin-comment.service";
import type { TComment } from "@/types/admin-comment.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCheck,
  FileText,
  History,
  Pin,
  PinOff,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";

const MIN_FLAGS_OPTIONS = [2, 3, 5, 10, 20];

type CommentCardProps = {
  item: TComment;
  onApprove: (item: TComment) => void;
  onReject: (item: TComment) => void;
  onDelete: (item: TComment) => void;
  onViewNews: (newsId: string) => void;
  onViewHistory: (item: TComment) => void;
  onPin: (item: TComment) => void;
  onUnpin: (item: TComment) => void;
};

// Shared row renderer for both the standard status-filtered list and the
// Flagged Queue list. Approve/Reject handlers are injected by the caller so
// each list can wire them to a different backend action (base PATCH vs the
// enhanced moderate endpoint).
const CommentCard: React.FC<CommentCardProps> = ({
  item,
  onApprove,
  onReject,
  onDelete,
  onViewNews,
  onViewHistory,
  onPin,
  onUnpin,
}) => {
  const timeAgo = formatTimeAgo(item.created_at);
  const isFlagged = item.flagged_count && item.flagged_count > 0;

  return (
    <div
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
              <span className="font-medium">By:</span> {item.name} (
              {item.email})
            </p>
            <p className="text-foreground leading-relaxed">{item.content}</p>
          </div>
          <div className="text-muted-foreground mt-2 text-xs">{timeAgo}</div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {item.is_pinned ? (
            <Button
              onClick={() => onUnpin(item)}
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
              onClick={() => onPin(item)}
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
            onClick={() => onViewNews(item.news._id)}
            size={"sm"}
            variant="outline"
            className="[--accent:blue]"
            shape={"default"}
          >
            <FileText className="size-4" />
          </Button>
          <Button
            onClick={() => onViewHistory(item)}
            size={"sm"}
            variant="outline"
            className="[--accent:gray]"
            shape={"default"}
            title="View edit history"
          >
            <History className="size-4" />
          </Button>
          {item.status !== "approved" && (
            <Button
              onClick={() => onApprove(item)}
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
              onClick={() => onReject(item)}
              size={"sm"}
              variant="outline"
              className="[--accent:orange]"
              shape={"default"}
            >
              Reject
            </Button>
          )}
          <Button
            onClick={() => onDelete(item)}
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
};

type CommentHistoryModalProps = {
  commentId: string | null;
  onClose: () => void;
};

// Edit-history viewer for GET /api/comment-enhanced/:comment_id/history
// (public, no auth). Shows the current content plus previous versions,
// most recent first.
const CommentHistoryModal: React.FC<CommentHistoryModalProps> = ({
  commentId,
  onClose,
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["comment-history", commentId],
    queryFn: () => fetchCommentHistory(commentId as string),
    enabled: !!commentId,
  });

  const history = data?.data;
  const previousEntries = useMemo(
    () => [...(history?.edit_history || [])].reverse(),
    [history?.edit_history],
  );

  return (
    <Modal isOpen={!!commentId} setIsOpen={(open) => !open && onClose()}>
      <ModalBackdrop>
        <ModalContent size="base">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <History className="size-5" />
              Edit History
            </ModalTitle>
            <ModalCloseTrigger onClick={onClose} />
          </ModalHeader>

          <ModalBody className="max-h-[70vh] space-y-4 overflow-y-auto">
            {isLoading ? (
              <div className="text-muted-foreground p-6 text-center text-sm">
                Loading history...
              </div>
            ) : isError ? (
              <div className="p-6 text-center text-sm text-red-600">
                Failed to load edit history.
              </div>
            ) : !history ? (
              <div className="text-muted-foreground p-6 text-center text-sm">
                No history found.
              </div>
            ) : (
              <>
                <div className="rounded border border-blue-200 bg-blue-50/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 uppercase">
                      Current Version
                    </span>
                    {history.is_edited && history.edited_at && (
                      <span className="text-muted-foreground text-xs">
                        {formatTimeAgo(history.edited_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-foreground mt-2 text-sm leading-relaxed">
                    {history.current_content}
                  </p>
                </div>

                {previousEntries.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    This comment has never been edited.
                  </p>
                ) : (
                  previousEntries.map((entry, index) => (
                    <div
                      key={`${entry.edited_at}-${index}`}
                      className="rounded border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs font-bold uppercase">
                          Previous Version
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {formatTimeAgo(entry.edited_at)}
                        </span>
                      </div>
                      <p className="text-foreground mt-2 text-sm leading-relaxed">
                        {entry.content}
                      </p>
                    </div>
                  ))
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalBackdrop>
    </Modal>
  );
};

const CommentsView: React.FC = () => {
  const queryClient = useQueryClient();
  const confirm = useAlert();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected" | "flagged"
  >("all");

  // "status": the standard, paginated list filtered by the comment's
  // `status` field (existing behavior). "queue": the dedicated
  // report-count-threshold queue from GET /flagged/list.
  const [view, setView] = useState<"status" | "queue">("status");
  const [minFlags, setMinFlags] = useState(3);

  const [historyCommentId, setHistoryCommentId] = useState<string | null>(
    null,
  );

  const [rejectTarget, setRejectTarget] = useState<TComment | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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
    enabled: view === "status",
  });

  const items = (data?.data || []) as TComment[];
  const metaTotal = Number(data?.meta?.total || 0);
  const metaPage = Number(data?.meta?.page || page);
  const metaLimit = Number(data?.meta?.limit || limit);

  const {
    data: flaggedData,
    isLoading: isFlaggedLoading,
    isError: isFlaggedError,
  } = useQuery({
    queryKey: ["flagged-comments", minFlags],
    queryFn: () => fetchFlaggedComments({ min_flags: minFlags }),
    enabled: view === "queue",
  });

  const flaggedItems = (flaggedData?.data || []) as TComment[];

  const invalidateCommentLists = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["comments"] });
    queryClient.invalidateQueries({ queryKey: ["flagged-comments"] });
  }, [queryClient]);

  const { mutate: updateMutation } = useMutation({
    mutationFn: ({
      _id,
      ...payload
    }: Partial<{ _id: string; status: "pending" | "approved" | "rejected" }>) =>
      updateComment(_id!, { ...payload }),
    onSuccess: invalidateCommentLists,
  });

  const { mutate: moderateMutation } = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: "approved" | "rejected";
      reason?: string;
    }) => moderateComment(id, { status, reason }),
    onSuccess: invalidateCommentLists,
  });

  const { mutate: deleteMutation } = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: invalidateCommentLists,
  });

  const handleApprove = async (item: TComment) => {
    updateMutation({ _id: item._id, status: "approved" });
  };

  const handleReject = async (item: TComment) => {
    updateMutation({ _id: item._id, status: "rejected" });
  };

  // Flagged Queue tab: use the admin-only moderate endpoint so the action
  // can carry a reason, instead of the base updateComment PATCH.
  const handleQueueApprove = useCallback(
    (item: TComment) => {
      moderateMutation({ id: item._id, status: "approved" });
    },
    [moderateMutation],
  );

  const openRejectModal = useCallback((item: TComment) => {
    setRejectTarget(item);
    setRejectReason("");
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectTarget(null);
    setRejectReason("");
  }, []);

  const confirmQueueReject = useCallback(() => {
    if (!rejectTarget) return;
    moderateMutation({
      id: rejectTarget._id,
      status: "rejected",
      reason: rejectReason.trim() || undefined,
    });
    closeRejectModal();
  }, [rejectTarget, rejectReason, moderateMutation, closeRejectModal]);

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

  const handleViewHistory = useCallback((item: TComment) => {
    setHistoryCommentId(item._id);
  }, []);

  const handlePin = useCallback(
    (item: TComment) => {
      pinComment(item._id).then(invalidateCommentLists);
    },
    [invalidateCommentLists],
  );

  const handleUnpin = useCallback(
    (item: TComment) => {
      unpinComment(item._id).then(invalidateCommentLists);
    },
    [invalidateCommentLists],
  );

  return (
    <main className="flex size-full flex-col space-y-6">
      <PageHeader />

      <section className="flex flex-1 flex-col space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-muted-foreground text-sm">
            <span className="font-medium">Total:</span>{" "}
            {view === "status" ? metaTotal : flaggedItems.length}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {view === "queue" && (
              <div className="flex items-center gap-2">
                <FormControlLabel
                  htmlFor="min-flags"
                  className="mb-0 text-sm font-medium whitespace-nowrap"
                >
                  Min. reports
                </FormControlLabel>
                <FormControl
                  as="select"
                  id="min-flags"
                  className="h-8 w-20 px-2 text-xs"
                  value={minFlags}
                  onChange={(e) => setMinFlags(Number(e.target.value))}
                >
                  {MIN_FLAGS_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}+
                    </option>
                  ))}
                </FormControl>
              </div>
            )}

            <div className="inline-flex overflow-hidden rounded border">
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  view === "status" && filter === "all"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => {
                  setView("status");
                  setFilter("all");
                }}
              >
                All
              </button>
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  view === "status" && filter === "pending"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => {
                  setView("status");
                  setFilter("pending");
                }}
              >
                Pending
              </button>
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  view === "status" && filter === "approved"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => {
                  setView("status");
                  setFilter("approved");
                }}
              >
                Approved
              </button>
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  view === "status" && filter === "rejected"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => {
                  setView("status");
                  setFilter("rejected");
                }}
              >
                Rejected
              </button>
              <button
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  view === "status" && filter === "flagged"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => {
                  setView("status");
                  setFilter("flagged");
                }}
                title="Comments whose status field is 'flagged'"
              >
                Flagged
              </button>
              <button
                className={cn(
                  "flex cursor-pointer items-center gap-1 border-l-2 border-red-200 px-3 py-1.5 text-sm",
                  view === "queue"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card",
                )}
                onClick={() => setView("queue")}
                title="Comments with N+ reports, regardless of status"
              >
                <ShieldAlert className="size-3.5" />
                Flagged Queue
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col space-y-4">
          {view === "status" ? (
            isLoading ? (
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
                {items.map((item) => (
                  <CommentCard
                    key={item._id}
                    item={item}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                    onViewNews={handleViewNews}
                    onViewHistory={handleViewHistory}
                    onPin={handlePin}
                    onUnpin={handleUnpin}
                  />
                ))}
              </div>
            )
          ) : isFlaggedLoading ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <Loader className="min-h-auto lg:min-h-auto" />
            </div>
          ) : isFlaggedError ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              Failed to load flagged comments.
            </div>
          ) : flaggedItems.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              No comments with {minFlags}+ reports.
            </div>
          ) : (
            <div>
              {flaggedItems.map((item) => (
                <CommentCard
                  key={item._id}
                  item={item}
                  onApprove={handleQueueApprove}
                  onReject={openRejectModal}
                  onDelete={handleDelete}
                  onViewNews={handleViewNews}
                  onViewHistory={handleViewHistory}
                  onPin={handlePin}
                  onUnpin={handleUnpin}
                />
              ))}
            </div>
          )}
        </div>

        {view === "status" && (
          <Pagination
            total={metaTotal}
            limit={metaLimit}
            page={metaPage}
            setLimit={setLimit}
            setPage={setPage}
          />
        )}
      </section>

      <CommentHistoryModal
        commentId={historyCommentId}
        onClose={() => setHistoryCommentId(null)}
      />

      <Modal
        isOpen={!!rejectTarget}
        setIsOpen={(open) => !open && closeRejectModal()}
      >
        <ModalBackdrop>
          <ModalContent size="sm">
            <ModalHeader>
              <ModalTitle>Reject Comment</ModalTitle>
              <ModalCloseTrigger onClick={closeRejectModal} />
            </ModalHeader>
            <ModalBody className="space-y-3">
              <p className="text-muted-foreground text-sm">
                Optionally provide a reason for rejecting this comment. It
                will be recorded with the moderation action.
              </p>
              <div>
                <FormControlLabel htmlFor="reject-reason">
                  Reason (optional)
                </FormControlLabel>
                <FormControl
                  as="textarea"
                  id="reject-reason"
                  placeholder="e.g. Spam, harassment, off-topic..."
                  maxLength={500}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-20"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={closeRejectModal}>
                Cancel
              </Button>
              <Button
                className="[--accent:orange]"
                onClick={confirmQueueReject}
              >
                Reject
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalBackdrop>
      </Modal>
    </main>
  );
};

export default CommentsView;
