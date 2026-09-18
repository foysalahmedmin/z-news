"use client";

import NewsCardList from "@/components/cards/NewsCard/NewsCardList";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { FormControl } from "@/components/ui/FormControl";
import {
  deleteBookmark,
  fetchMyBookmarks,
  fetchMyReadingLists,
  moveBookmarkToReadingList,
  updateBookmark,
} from "@/services/bookmark.service";
import type { TBookmark } from "@/types/bookmark.type";
import type { TNews } from "@/types/news.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookmarkX } from "lucide-react";
import { toast } from "react-toastify";

// The article a bookmark points at (`Pick`ed from `TNews`, matching the
// `.populate("news", "title slug thumbnail description published_at")`
// projection the backend uses everywhere it does populate `news`).
type TPopulatedNews = Pick<
  TNews,
  "_id" | "title" | "slug" | "description" | "thumbnail" | "published_at"
>;

// `GET /api/bookmark` (what `fetchMyBookmarks` calls) never populates
// `news` on the backend — apps/backend's bookmark.repository
// `findBookmarksPaginated` doesn't chain `.populate()` the way the other
// bookmark endpoints (create/update/move, reading-list reads) do — so
// `bookmark.news` genuinely arrives as a bare ObjectId string here even
// though `TBookmark["news"]` elsewhere is populated. Handle both shapes
// rather than assume one.
const getPopulatedNews = (news: TBookmark["news"]): TPopulatedNews | null => {
  const value = news as unknown as string | TPopulatedNews;
  return value && typeof value === "object" ? value : null;
};

const BOOKMARKS_QUERY_KEY = ["my-bookmarks"];
const READING_LISTS_QUERY_KEY = ["my-reading-lists"];

export default function UserBookmarksPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: BOOKMARKS_QUERY_KEY,
    queryFn: () => fetchMyBookmarks(),
  });

  const { data: readingListsRes } = useQuery({
    queryKey: READING_LISTS_QUERY_KEY,
    queryFn: () => fetchMyReadingLists(),
  });

  const bookmarks = data?.data || [];
  const readingLists = readingListsRes?.data || [];

  const invalidateBookmarks = () =>
    queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });

  const { mutate: toggleRead, isPending: isTogglingRead } = useMutation({
    mutationFn: ({ id, is_read }: { id: string; is_read: boolean }) =>
      updateBookmark(id, { is_read }),
    onSuccess: (res) => {
      if (res?.success === false) {
        toast.error(res?.message || "Something went wrong. Please try again.");
        return;
      }
      toast.success("Bookmark updated");
      invalidateBookmarks();
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const { mutate: moveBookmark, isPending: isMoving } = useMutation({
    mutationFn: ({
      id,
      readingListId,
    }: {
      id: string;
      readingListId: string;
    }) => moveBookmarkToReadingList(id, readingListId),
    onSuccess: (res) => {
      if (res?.success === false) {
        toast.error(res?.message || "Something went wrong. Please try again.");
        return;
      }
      toast.success("Moved to reading list");
      invalidateBookmarks();
      queryClient.invalidateQueries({ queryKey: READING_LISTS_QUERY_KEY });
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const { mutate: removeBookmark, isPending: isRemoving } = useMutation({
    mutationFn: (id: string) => deleteBookmark(id),
    onSuccess: (res) => {
      if (res?.success === false) {
        toast.error(res?.message || "Something went wrong. Please try again.");
        return;
      }
      toast.success("Removed from saved articles");
      invalidateBookmarks();
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-foreground text-2xl font-semibold">Bookmarks</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Articles you&apos;ve saved to read later.
        </p>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading bookmarks…</p>
      ) : bookmarks.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            You haven&apos;t saved any articles yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => {
            const news = getPopulatedNews(bookmark.news);

            return (
              <Card key={bookmark._id}>
                <CardContent className="flex flex-col gap-4 py-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    {news ? (
                      <NewsCardList
                        news={news}
                        classNameThumbnail="md:w-40"
                        classNameTitle="line-clamp-2"
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Article details aren&apos;t available for this
                        bookmark (news id: {bookmark.news}).
                      </p>
                    )}
                    {bookmark.notes && (
                      <p className="bg-muted text-muted-foreground mt-3 rounded-md p-2 text-sm">
                        {bookmark.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-stretch gap-2 md:w-52">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-accent size-4"
                        checked={bookmark.is_read}
                        disabled={isTogglingRead}
                        onChange={(e) =>
                          toggleRead({
                            id: bookmark._id,
                            is_read: e.target.checked,
                          })
                        }
                      />
                      {bookmark.is_read ? "Read" : "Unread"}
                    </label>

                    <FormControl
                      as="select"
                      className="h-8 text-sm"
                      value={bookmark.reading_list || ""}
                      disabled={isMoving || readingLists.length === 0}
                      onChange={(e) => {
                        const readingListId = e.target.value;
                        if (readingListId) {
                          moveBookmark({ id: bookmark._id, readingListId });
                        }
                      }}
                    >
                      <option value="">
                        {readingLists.length === 0
                          ? "No reading lists yet"
                          : "Move to reading list…"}
                      </option>
                      {readingLists.map((list) => (
                        <option key={list._id} value={list._id}>
                          {list.name}
                        </option>
                      ))}
                    </FormControl>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isRemoving}
                      onClick={() => removeBookmark(bookmark._id)}
                    >
                      <BookmarkX className="size-4" /> Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
