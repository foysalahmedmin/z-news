import api from "@/lib/api";
import type {
  TBookmarkResponse,
  TBookmarksResponse,
  TReadingListResponse,
  TReadingListsResponse,
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

export const updateBookmark = async (
  bookmarkId: string,
  payload: { notes?: string; is_read?: boolean },
): Promise<TBookmarkResponse> => {
  const response = await api.patch(`/api/bookmark/${bookmarkId}`, payload);
  return response.data as TBookmarkResponse;
};

export const moveBookmarkToReadingList = async (
  bookmarkId: string,
  readingListId: string,
): Promise<TBookmarkResponse> => {
  const response = await api.patch(`/api/bookmark/${bookmarkId}/move`, {
    reading_list_id: readingListId,
  });
  return response.data as TBookmarkResponse;
};

// ============ READING LIST SERVICES ============

export const createReadingList = async (payload: {
  name: string;
  description?: string;
  is_public?: boolean;
}): Promise<TReadingListResponse> => {
  const response = await api.post("/api/bookmark/reading-list", payload);
  return response.data as TReadingListResponse;
};

export const fetchMyReadingLists = async (): Promise<TReadingListsResponse> => {
  const response = await api.get("/api/bookmark/reading-list/my");
  return response.data as TReadingListsResponse;
};

export const fetchPublicReadingLists = async (
  limit?: number,
): Promise<TReadingListsResponse> => {
  const queryString = limit ? `?${new URLSearchParams({ limit: String(limit) }).toString()}` : "";
  const response = await api.get(`/api/bookmark/reading-list/public${queryString}`);
  return response.data as TReadingListsResponse;
};

export const fetchReadingList = async (
  readingListId: string,
): Promise<TReadingListResponse> => {
  const response = await api.get(`/api/bookmark/reading-list/${readingListId}`);
  return response.data as TReadingListResponse;
};

export const updateReadingList = async (
  readingListId: string,
  payload: { name?: string; description?: string; is_public?: boolean },
): Promise<TReadingListResponse> => {
  const response = await api.patch(
    `/api/bookmark/reading-list/${readingListId}`,
    payload,
  );
  return response.data as TReadingListResponse;
};

export const deleteReadingList = async (
  readingListId: string,
): Promise<TReadingListResponse> => {
  const response = await api.delete(`/api/bookmark/reading-list/${readingListId}`);
  return response.data as TReadingListResponse;
};

export const followReadingList = async (
  readingListId: string,
): Promise<TReadingListResponse> => {
  const response = await api.post(
    `/api/bookmark/reading-list/${readingListId}/follow`,
  );
  return response.data as TReadingListResponse;
};

export const unfollowReadingList = async (
  readingListId: string,
): Promise<TReadingListResponse> => {
  const response = await api.delete(
    `/api/bookmark/reading-list/${readingListId}/follow`,
  );
  return response.data as TReadingListResponse;
};
