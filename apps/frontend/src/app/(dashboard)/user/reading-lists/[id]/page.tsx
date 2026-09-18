"use client";

import NewsCardList from "@/components/cards/NewsCard/NewsCardList";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { FormControl, FormControlLabel } from "@/components/ui/FormControl";
import useUser from "@/hooks/states/useUser";
import useAlert from "@/hooks/ui/useAlert";
import {
  deleteReadingList,
  fetchReadingList,
  followReadingList,
  unfollowReadingList,
  updateReadingList,
} from "@/services/bookmark.service";
import type { TBookmark } from "@/types/bookmark.type";
import type { TNews } from "@/types/news.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type TPopulatedNews = Pick<
  TNews,
  "_id" | "title" | "slug" | "description" | "thumbnail" | "published_at"
>;

// Same populated-vs-bare-id ambiguity as the bookmarks list page: the
// backend populates `news` inside `bookmarks` for every reading-list read
// endpoint this page can hit, but `TBookmark["news"]` is still typed as a
// plain string, so this narrows at runtime instead of trusting the type.
const getPopulatedNews = (news: TBookmark["news"]): TPopulatedNews | null => {
  const value = news as unknown as string | TPopulatedNews;
  return value && typeof value === "object" ? value : null;
};

// `list.user` is typed as a plain id string on `TReadingList`, but
// `getReadingListById` (what `fetchReadingList` calls) always populates it
// with `"name email image"` — same populated-vs-bare-id situation as `news`
// above.
const getOwnerId = (user: string | undefined): string | undefined => {
  const value = user as unknown as string | { _id: string } | undefined;
  if (!value) return undefined;
  return typeof value === "object" ? value._id : value;
};

export default function ReadingListDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useAlert();
  const { user } = useUser();
  const currentUserId = user?.info?._id;

  const queryKey = ["reading-list", id];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => fetchReadingList(id || ""),
    enabled: Boolean(id),
  });

  const list = data?.data;
  const ownerId = getOwnerId(list?.user);
  const isOwner = Boolean(
    currentUserId && ownerId && currentUserId === ownerId,
  );
  const isFollowing = Boolean(
    currentUserId && list?.followers?.includes(currentUserId),
  );

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (list) {
      setName(list.name || "");
      setDescription(list.description || "");
      setIsPublic(Boolean(list.is_public));
    }
  }, [list]);

  const invalidateList = () => queryClient.invalidateQueries({ queryKey });

  const { mutate: saveEdits, isPending: isSaving } = useMutation({
    mutationFn: () =>
      updateReadingList(id || "", { name, description, is_public: isPublic }),
    onSuccess: (res) => {
      if (res?.success === false) {
        toast.error(res?.message || "Something went wrong. Please try again.");
        return;
      }
      toast.success("Reading list updated");
      invalidateList();
      queryClient.invalidateQueries({ queryKey: ["my-reading-lists"] });
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const { mutate: removeList, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteReadingList(id || ""),
    onSuccess: (res) => {
      if (res?.success === false) {
        toast.error(res?.message || "Something went wrong. Please try again.");
        return;
      }
      toast.success("Reading list deleted");
      queryClient.invalidateQueries({ queryKey: ["my-reading-lists"] });
      router.push("/user/reading-lists");
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const { mutate: toggleFollow, isPending: isTogglingFollow } = useMutation({
    mutationFn: () =>
      isFollowing
        ? unfollowReadingList(id || "")
        : followReadingList(id || ""),
    onSuccess: (res) => {
      if (res?.success === false) {
        toast.error(res?.message || "Something went wrong. Please try again.");
        return;
      }
      toast.success(
        isFollowing ? "Unfollowed reading list" : "Following reading list",
      );
      invalidateList();
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const onDelete = async () => {
    const ok = await confirm({
      title: "Delete Reading List",
      message:
        "Are you sure you want to delete this reading list? This cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (ok) removeList();
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Loading reading list…</p>
    );
  }

  if (isError || !list) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-10 text-center text-sm">
          This reading list isn&apos;t available. It may be private or no
          longer exist.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 py-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <FormControlLabel>Name</FormControlLabel>
                <FormControl
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <FormControlLabel>Description</FormControlLabel>
                <FormControl
                  as="textarea"
                  className="h-auto min-h-20 py-2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <label className="inline-flex items-center gap-2">
                <input
                  className="accent-accent size-5"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span className="text-sm font-medium">Public</span>
              </label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isSaving}
                  onClick={() => saveEdits()}
                >
                  {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-foreground text-2xl font-semibold">
                    {list.name}
                  </h1>
                  <Badge
                    className={
                      list.is_public
                        ? undefined
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {list.is_public ? "Public" : "Private"}
                  </Badge>
                </div>
                {list.description && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    {list.description}
                  </p>
                )}
                <p className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                  <Users className="size-3.5" />
                  {list.followers?.length || 0} follower
                  {list.followers?.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                {isOwner ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="[--accent:red]"
                      disabled={isDeleting}
                      onClick={onDelete}
                    >
                      <Trash2 className="size-4" /> Delete
                    </Button>
                  </>
                ) : list.is_public ? (
                  <Button
                    type="button"
                    variant={isFollowing ? "outline" : "default"}
                    disabled={isTogglingFollow}
                    onClick={() => toggleFollow()}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-foreground text-lg font-semibold">
          Articles ({list.bookmarks?.length || 0})
        </h2>
        {!list.bookmarks || list.bookmarks.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              No articles in this reading list yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {list.bookmarks.map((bookmark) => {
              const news = getPopulatedNews(bookmark.news);

              return (
                <Card key={bookmark._id}>
                  <CardContent className="py-4">
                    {news ? (
                      <NewsCardList
                        news={news}
                        classNameThumbnail="md:w-40"
                        classNameTitle="line-clamp-2"
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Article details aren&apos;t available for this
                        bookmark.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
