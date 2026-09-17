"use client";

import { cn } from "@/lib/utils";
import {
  createBookmark,
  deleteBookmark,
  fetchMyBookmarks,
} from "@/services/bookmark.service";
import { getMyProfile } from "@/services/user-profile.service";
import { TNews } from "@/types/news.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import React from "react";
import { toast } from "react-toastify";

type SaveProps = {
  news: Partial<TNews>;
};

const Save: React.FC<SaveProps> = ({ news }) => {
  const queryClient = useQueryClient();
  const newsId = news?._id;

  // Only show the button when the visitor is signed in — mirrors the
  // logged-in-only pattern used by FollowAuthorButton.
  const { data: profileRes, isLoading: isProfileLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    retry: false,
  });
  const isLoggedIn = !!profileRes?.data;

  // There's no "check bookmark status for a single article" endpoint, so we
  // ask the backend for the current user's bookmarks filtered to this news
  // id (AppQueryFind passes unrecognized query params straight through as a
  // mongo filter) and check whether it came back non-empty.
  const bookmarkQueryKey = ["bookmark", newsId];
  const { data: bookmarksRes, isFetching: isCheckingBookmark } = useQuery({
    queryKey: bookmarkQueryKey,
    queryFn: () => fetchMyBookmarks({ news: newsId }),
    enabled: isLoggedIn && !!newsId,
  });

  const bookmark = bookmarksRes?.data?.[0];
  const is_saved = !!bookmark;

  const { mutate: toggleBookmark, isPending } = useMutation({
    mutationFn: async () => {
      if (bookmark?._id) {
        return deleteBookmark(bookmark._id);
      }
      return createBookmark(newsId!);
    },
    onSuccess: (res) => {
      if (res?.success === false) {
        toast.error(res?.message || "Something went wrong. Please try again.");
        return;
      }
      toast.success(
        is_saved ? "Removed from saved articles" : "Article saved",
      );
      queryClient.invalidateQueries({ queryKey: bookmarkQueryKey });
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  // Don't render if not logged in, still checking auth, or there's no
  // article to bookmark yet.
  if (isProfileLoading || !isLoggedIn || !newsId) return null;

  return (
    <div className="bg-muted flex h-10 items-center rounded-md p-1">
      <button
        disabled={isPending || isCheckingBookmark}
        onClick={() => toggleBookmark()}
        title={is_saved ? "Remove from saved articles" : "Save article"}
        className="flex h-full cursor-pointer items-center gap-1 px-2 disabled:opacity-60"
      >
        <Bookmark
          className={cn("size-5", {
            "fill-current": is_saved,
          })}
        />
      </button>
    </div>
  );
};

export default Save;
