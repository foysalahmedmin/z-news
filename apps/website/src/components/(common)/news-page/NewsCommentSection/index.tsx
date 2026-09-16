// components/CommentSection.tsx
"use client";

import NewsCommentCardSkeleton from "@/components/skeletons/cards-skeleton/NewsCommentCardSkeleton";
import { Button } from "@/components/ui/Button";
import { FormControl, formControlVariants } from "@/components/ui/FormControl";
import { URLS } from "@/config";
import { cn } from "@/lib/utils";
import {
  addCommentReaction,
  createComment,
  createCommentReply,
  deleteComment,
  fetchThreadedComments,
  updateComment,
} from "@/services/comment.service";
import { TComment } from "@/types/comment.type";
import { TNews } from "@/types/news.type";
import { TReactionType } from "@/types/reaction.type";
import { formatCount } from "@/utils/formatCount";
import { formatDate } from "@/utils/formatDate";
import Cookies from "js-cookie";
import {
  Check,
  ChevronRight,
  CornerDownRight,
  Edit2,
  Flag,
  MessageCircle,
  Pin,
  Reply,
  Send,
  Smile,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const NewsCommentCard = ({
  guest_token,
  comment,
  onUpdate,
  onDelete,
  onReply,
  onReaction,
  isReply = false,
}: {
  guest_token?: string;
  comment: TComment;
  onUpdate: (id: string, updatedComment: TComment) => void;
  onDelete: (id: string) => void;
  onReply?: (parentId: string, replyToUser?: string) => void;
  onReaction?: (commentId: string, type: "like" | "dislike") => void;
  isReply?: boolean;
}) => {
  const {
    _id,
    name,
    email,
    content,
    is_edited,
    is_pinned,
    created_at,
    user,
    guest,
    replies,
    reply_count,
    reaction_counts,
    thread_level = 0,
    status,
  } = comment || {};
  const image = user?.image ? URLS.user + "/" + user?.image : "";

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editForm, setEditForm] = useState({
    name: name || "",
    email: email || "",
    content: content || "",
  });

  const formRef = useRef<HTMLFormElement>(null);

  const isOwner =
    guest_token === guest || (user && Cookies.get("user") === user._id);

  const createdAt = new Date(comment.created_at);
  const now = new Date();
  const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  const isControllable = isOwner || diffHours <= 12;

  const handleUpdateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !isOwner) return;

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const updatedName = formData.get("name") as string;
    const updatedEmail = formData.get("email") as string;
    const updatedContent = formData.get("content") as string;

    if (!updatedName || !updatedEmail || !updatedContent) return;

    setIsLoading(true);
    try {
      const { data } = await updateComment(_id, {
        name: updatedName,
        email: updatedEmail,
        content: updatedContent,
      });

      if (data) {
        onUpdate(_id, data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (isLoading || !isOwner) return;

    if (!window.confirm("আপনি কি নিশ্চিত যে এই মন্তব্যটি মুছে ফেলতে চান?")) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteComment(_id);
      onDelete(_id);
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (type: TReactionType) => {
    if (isLoading) return;
    try {
      const { data } = await addCommentReaction(_id, type);
      if (data) {
        onUpdate(_id, data);
      }
    } catch (error) {
      console.error("Error reacting to comment:", error);
    }
  };

  const handleFlagComment = async () => {
    if (isLoading) return;
    if (!window.confirm("আপনি কি নিশ্চিত যে এই মন্তব্যটি রিপোর্ট করতে চান?"))
      return;
    try {
      // Assuming addCommentFlag service exists or adding it inline
      await fetch(`${URLS.api}/api/comment-enhanced/${_id}/flag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ reason: "Reported by user" }),
      });
      alert("ধন্যবাদ, আমরা আপনার রিপোর্টটি পেয়েছি।");
    } catch (error) {
      console.error("Error flagging comment:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: name || "",
      email: email || "",
      content: content || "",
    });
  };

  return (
    <div
      className={cn(
        "rounded-md p-4 transition-colors",
        isEditing ? "bg-muted/50 border" : "bg-transparent",
        is_pinned && "border-l-accent bg-accent/5 border-l-4",
        isReply ? `border-muted/50 ml-4 border-l sm:ml-8` : "",
        status === "flagged" && "opacity-50 grayscale",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {image ? (
            <Image
              src={image}
              alt={name}
              width={isReply ? 24 : 32}
              height={isReply ? 24 : 32}
              className="rounded-full"
            />
          ) : (
            <div
              className={cn(
                "bg-muted flex items-center justify-center rounded-full",
                isReply ? "h-6 w-6" : "h-8 w-8",
              )}
            >
              <span
                className={cn(
                  "text-muted-foreground font-medium",
                  isReply ? "text-[10px]" : "text-xs",
                )}
              >
                {name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          {!isEditing ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-medium",
                        isReply ? "text-sm" : "text-base",
                      )}
                    >
                      {name}{" "}
                      {isOwner && (
                        <span className="text-accent text-[10px] font-normal">
                          (আপনি)
                        </span>
                      )}
                    </span>
                    {is_pinned && (
                      <span className="bg-accent/10 text-accent flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium">
                        <Pin size={10} fill="currentColor" /> পিন করা
                      </span>
                    )}
                    <span className="text-muted-foreground text-[10px]">
                      {formatDate(new Date(created_at), "relative")}
                    </span>
                  </div>
                  {is_edited && (
                    <span className="text-muted-foreground text-[10px]">
                      (সম্পাদিত)
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {onReply && !isReply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReply(_id, user?._id)}
                      className="h-8 w-8 p-0"
                      title="উত্তর দিন"
                    >
                      <Reply size={14} className="text-muted-foreground" />
                    </Button>
                  )}
                  {isOwner && isControllable && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        disabled={isLoading}
                        className="text-foreground h-8 w-8 p-0"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteComment}
                        disabled={isLoading}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </>
                  )}
                  {!isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFlagComment}
                      className="text-muted-foreground h-8 w-8 p-0 hover:text-red-500"
                      title="রিপোর্ট করুন"
                    >
                      <Flag size={14} />
                    </Button>
                  )}
                </div>
              </div>

              {/* Content */}
              <p
                className={cn(
                  "flex flex-wrap gap-1 whitespace-pre-wrap",
                  isReply ? "text-sm" : "text-base",
                )}
              >
                {content.split(/(@\w+)/g).map((part, i) =>
                  part.startsWith("@") ? (
                    <span
                      key={i}
                      className="text-accent cursor-pointer font-bold hover:underline"
                    >
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  ),
                )}
              </p>

              {/* Reactions & Meta */}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => handleReaction("like")}
                    className="hover:bg-muted flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors"
                    title="পছন্দ করি"
                  >
                    <ThumbsUp size={14} className="text-primary" />
                    <span className="font-medium">
                      {reaction_counts?.like || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => handleReaction("dislike")}
                    className="hover:bg-muted flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors"
                    title="অপছন্দ করি"
                  >
                    <ThumbsDown size={14} className="text-red-500" />
                    <span className="font-medium">
                      {reaction_counts?.dislike || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => handleReaction("insightful")}
                    className="hover:bg-muted flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors"
                    title="তথ্যবহুল"
                  >
                    <Zap size={14} className="text-amber-500" />
                    <span className="font-medium">
                      {reaction_counts?.insightful || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => handleReaction("funny")}
                    className="hover:bg-muted flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors"
                    title="হা হা"
                  >
                    <Smile size={14} className="text-yellow-500" />
                    <span className="font-medium">
                      {reaction_counts?.funny || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => handleReaction("disagree")}
                    className="hover:bg-muted flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors"
                    title="একমত নই"
                  >
                    <ThumbsDown
                      size={14}
                      className="scale-x-[-1] text-orange-500"
                    />
                    <span className="font-medium">
                      {reaction_counts?.disagree || 0}
                    </span>
                  </button>
                </div>

                {reply_count! > 0 && !isReply && (
                  <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <MessageCircle size={12} />
                    <span>{formatCount(reply_count || 0)} টি উত্তর</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Edit Form */
            <form
              ref={formRef}
              onSubmit={handleUpdateComment}
              className="space-y-3"
            >
              <div className="space-y-2">
                <FormControl
                  type="text"
                  name="name"
                  placeholder="আপনার নাম"
                  defaultValue={editForm.name}
                />
                <FormControl
                  type="email"
                  name="email"
                  placeholder="আপনার ইমেইল"
                  defaultValue={editForm.email}
                />
                <textarea
                  name="content"
                  placeholder="আপনার মন্তব্য লিখুন..."
                  className={cn(
                    formControlVariants({
                      variant: "default",
                      size: "default",
                    }),
                    "h-auto py-2",
                  )}
                  rows={4}
                  defaultValue={editForm.content}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  <X size={14} />
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  <Check size={14} />
                  {isLoading ? "আপডেট হচ্ছে..." : "আপডেট"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Replies (Recursive up to 5 levels) */}
      {replies && replies.length > 0 && (thread_level || 0) < 5 && (
        <div className="mt-2 space-y-4">
          {replies.map((reply) => (
            <NewsCommentCard
              key={reply._id}
              guest_token={guest_token}
              comment={reply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReply={onReply}
              onReaction={onReaction}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

type NewsCommentSectionProps = {
  news?: Partial<TNews>;
};

const NewsCommentSection: React.FC<NewsCommentSectionProps> = ({ news }) => {
  const [comments, setComments] = useState<TComment[]>([]);
  const [meta, setMeta] = useState<{
    total?: number;
    limit?: number;
    page?: number;
    guest_token?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [saveCredentials, setSaveCredentials] = useState(false);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Get saved credentials from cookies
  const [savedName, setSavedName] = useState(Cookies.get("guest_name") || "");
  const [savedEmail, setSavedEmail] = useState(
    Cookies.get("guest_email") || "",
  );

  const formRef = useRef<HTMLFormElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true);
      try {
        const { data, meta } = await fetchThreadedComments(news?._id as string);
        setComments(data || []);
        setMeta(meta || {});
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (news?._id) {
      loadComments();
    }
  }, [news?._id]);

  // Set saveCredentials checkbox if credentials exist
  useEffect(() => {
    if (savedName || savedEmail) {
      setSaveCredentials(true);
    }
  }, [savedName, savedEmail]);

  // Submit new comment or reply
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const content = formData.get("content") as string;

    if (!name || !email || !content) return;

    // Save credentials to cookies if checkbox is checked
    if (saveCredentials) {
      Cookies.set("guest_name", name, { expires: 365 }); // Save for 1 year
      Cookies.set("guest_email", email, { expires: 365 });
      setSavedName(name);
      setSavedEmail(email);
    }

    setIsSubmitting(true);
    try {
      let result;
      if (replyTo) {
        result = await createCommentReply(replyTo.id, {
          name,
          email,
          content,
        });
      } else {
        result = await createComment({
          news: news?._id,
          name,
          email,
          content,
        });
      }

      const { data } = result;

      if (data?._id) {
        if (replyTo) {
          // Update the parent comment with the new reply locally
          setComments((prev) =>
            prev.map((c) => {
              if (c._id === replyTo.id) {
                return {
                  ...c,
                  replies: [...(c.replies || []), data],
                  reply_count: (c.reply_count || 0) + 1,
                };
              }
              return c;
            }),
          );
          setReplyTo(null);
        } else {
          setComments((prev) => [data, ...prev]);
          setMeta((prev) => ({ ...prev, total: (prev.total || 0) + 1 }));
        }

        // Reset only content field, keep name and email if saved
        const form = formRef.current;
        if (!form) return;

        const contentField = form.querySelector(
          'textarea[name="content"]',
        ) as HTMLTextAreaElement | null;

        if (contentField) {
          contentField.value = "";
        }
        if (!saveCredentials) {
          form.reset();
        }
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear saved credentials
  const handleToggleCredentials = (bool: boolean) => {
    if (bool) {
      setSaveCredentials(true);
    } else {
      setSaveCredentials(false);
      if (savedEmail || savedName) {
        Cookies.remove("guest_name");
        Cookies.remove("guest_email");
        setSavedName("");
        setSavedEmail("");
      }
    }
  };

  // Recursive update function
  const updateRecursive = (
    comments: TComment[],
    id: string,
    updated: TComment,
  ): TComment[] => {
    return comments.map((c) => {
      if (c._id === id) return updated;
      if (c.replies && c.replies.length > 0) {
        return {
          ...c,
          replies: updateRecursive(c.replies, id, updated),
        };
      }
      return c;
    });
  };

  // Recursive delete function
  const deleteRecursive = (comments: TComment[], id: string): TComment[] => {
    return comments
      .filter((c) => c._id !== id)
      .map((c) => {
        if (c.replies && c.replies.length > 0) {
          const newReplies = deleteRecursive(c.replies, id);
          return {
            ...c,
            replies: newReplies,
            reply_count:
              c.replies.length !== newReplies.length
                ? Math.max(0, (c.reply_count || 1) - 1)
                : c.reply_count,
          };
        }
        return c;
      });
  };

  // Handle comment update (Recursive)
  const handleUpdateComment = (id: string, updatedComment: TComment) => {
    setComments((prev) => updateRecursive(prev, id, updatedComment));
  };

  // Handle comment delete (Recursive)
  const handleDeleteComment = (id: string) => {
    setComments((prev) => deleteRecursive(prev, id));
    setMeta((prev) => ({ ...prev, total: Math.max((prev.total || 1) - 1, 0) }));
  };

  const handleReplyClick = (parentId: string, replyToUserId?: string) => {
    const parentComment = comments.find((c) => c._id === parentId);
    if (parentComment) {
      setReplyTo({ id: parentId, name: parentComment.name });
      // Scroll to form
      formRef.current?.scrollIntoView({ behavior: "smooth" });
      contentRef.current?.focus();
    }
  };

  return (
    <div className="container mx-auto">
      <div className="bg-card rounded-md border p-6 shadow">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full cursor-pointer items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <h3 className="text-xl font-bold">
              মন্তব্য ({formatCount(meta?.total || 0)})
            </h3>
          </div>
          <ChevronRight
            className={cn("transition-transform duration-200", {
              "rotate-90": isOpen,
            })}
            size={20}
          />
        </div>

        <div
          className={cn(
            "relative grid grid-rows-[0fr] overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out",
            {
              "grid-rows-[1fr]": isOpen,
            },
          )}
        >
          <div
            className={cn(
              "invisible min-h-0 origin-top scale-y-0 space-y-2 overflow-hidden opacity-0 transition-transform duration-300 ease-in-out",
              {
                "visible min-h-fit origin-top scale-y-100 opacity-100 delay-100":
                  isOpen,
              },
            )}
          >
            {/* Comment Form */}
            <form
              ref={formRef}
              onSubmit={handleSubmitComment}
              className="mt-4 space-y-4 px-0.5"
            >
              {replyTo && (
                <div className="bg-muted flex items-center justify-between rounded-md px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CornerDownRight size={14} />
                    <span>
                      <strong>{replyTo.name}</strong>-কে উত্তর দিচ্ছেন
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="space-y-2">
                <FormControl
                  type="text"
                  name="name"
                  placeholder="আপনার নাম"
                  defaultValue={savedName}
                  required
                />
                <FormControl
                  type="email"
                  name="email"
                  placeholder="আপনার ইমেইল"
                  defaultValue={savedEmail}
                  required
                />
                <textarea
                  ref={contentRef}
                  name="content"
                  placeholder={
                    replyTo ? "আপনার উত্তর লিখুন..." : "আপনার মন্তব্য লিখুন..."
                  }
                  className={cn(
                    formControlVariants({
                      variant: "default",
                      size: "default",
                    }),
                    "h-auto py-2",
                  )}
                  rows={4}
                  required
                />
              </div>

              {/* Save credentials option */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={saveCredentials}
                      onChange={(e) =>
                        handleToggleCredentials(e.target.checked)
                      }
                      className="border-muted accent-accent rounded"
                    />
                    <span className="text-muted-foreground text-sm">
                      নাম ও ইমেইল মনে রাখুন
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  <Send size={16} />
                  {isSubmitting
                    ? "পাঠানো হচ্ছে..."
                    : replyTo
                      ? "উত্তর পাঠান"
                      : "মন্তব্য পাঠান"}
                </Button>
              </div>
            </form>

            {/* Comments List */}
            {isLoading ? (
              <div className="space-y-4 py-8">
                {Array.from({ length: 3 }).map((_, index) => (
                  <NewsCommentCardSkeleton key={index} />
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="space-y-4 py-8 text-center">
                <MessageCircle
                  size={48}
                  className="text-muted-foreground mx-auto"
                />
                <p className="text-muted-foreground">
                  এখনও কোনো মন্তব্য নেই। প্রথম মন্তব্য করুন!
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {comments.map((comment) => (
                  <NewsCommentCard
                    key={comment._id}
                    comment={comment}
                    guest_token={meta?.guest_token}
                    onUpdate={handleUpdateComment}
                    onDelete={handleDeleteComment}
                    onReply={handleReplyClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCommentSection;
