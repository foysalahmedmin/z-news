import api from "@/lib/api";
import type {
  TBookmarkResponse,
  TBookmarksResponse,
} from "@/types/bookmark.type";

export const fetchMyBookmarks = async (
  query?: Record<string, any>,
): Promise<TBookmarksResponse> => {
  const queryString = query
    ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
    : "";
  const response = await api.get(`/api/bookmark${queryString}`);
  return response.data as TBookmarksResponse;
};

export const createBookmark = async (
  news: string,
): Promise<TBookmarkResponse> => {
  const response = await api.post("/api/bookmark", { news });
  return response.data as TBookmarkResponse;
};

export const deleteBookmark = async (
  bookmarkId: string,
): Promise<TBookmarkResponse> => {
  const response = await api.delete(`/api/bookmark/${bookmarkId}`);
  return response.data as TBookmarkResponse;
};
