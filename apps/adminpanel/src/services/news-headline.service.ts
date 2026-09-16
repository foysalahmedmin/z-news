import api from "@/lib/api";
import type {
  TNewsHeadlineResponse,
  TNewsHeadlinesResponse,
  TStatus,
} from "@/types/news-headline.type";

// ========================= GET =========================

// GET Self News Headlines (Admin)
export async function fetchSelfNewsHeadlines(
  query?: Record<string, any>,
): Promise<TNewsHeadlinesResponse> {
  const response = await api.get("/api/news-Headline/self", { params: query });
  return response.data as TNewsHeadlinesResponse;
}

// GET All News Headlines (Admin)
export async function fetchNewsHeadlines(
  query?: Record<string, any>,
): Promise<TNewsHeadlinesResponse> {
  const response = await api.get("/api/news-Headline", { params: query });
  return response.data as TNewsHeadlinesResponse;
}

// GET Self Single News Headline
export async function fetchSelfNewsHeadline(
  id: string,
): Promise<TNewsHeadlineResponse> {
  const response = await api.get(`/api/news-Headline/${id}/self`);
  return response.data as TNewsHeadlineResponse;
}

// GET Single News Headline (Admin)
export async function fetchNewsHeadline(
  id: string,
): Promise<TNewsHeadlineResponse> {
  const response = await api.get(`/api/news-Headline/${id}`);
  return response.data as TNewsHeadlineResponse;
}

// ========================= POST =========================

// Create News Headline
export async function createNewsHeadline(payload: {
  news: string;
  status?: TStatus;
  published_at?: string | Date;
  expired_at?: string | Date;
}): Promise<TNewsHeadlineResponse> {
  const response = await api.post("/api/news-Headline", payload);
  return response.data as TNewsHeadlineResponse;
}

// Bulk Restore Self News Headlines
export async function restoreSelfNewsHeadlines(payload: {
  ids: string[];
}): Promise<TNewsHeadlinesResponse> {
  const response = await api.post(
    "/api/news-Headline/bulk/restore/self",
    payload,
  );
  return response.data as TNewsHeadlinesResponse;
}

// Bulk Restore News Headlines (Admin)
export async function restoreNewsHeadlines(payload: {
  ids: string[];
}): Promise<TNewsHeadlinesResponse> {
  const response = await api.post("/api/news-Headline/bulk/restore", payload);
  return response.data as TNewsHeadlinesResponse;
}

// Restore Single Self News Headline
export async function restoreSelfNewsHeadline(
  id: string,
): Promise<TNewsHeadlineResponse> {
  const response = await api.post(`/api/news-Headline/${id}/restore/self`);
  return response.data as TNewsHeadlineResponse;
}

// Restore Single News Headline (Admin)
export async function restoreNewsHeadline(
  id: string,
): Promise<TNewsHeadlineResponse> {
  const response = await api.post(`/api/news-Headline/${id}/restore`);
  return response.data as TNewsHeadlineResponse;
}

// ========================= PATCH =========================

// Update Bulk Self News Headlines
export async function updateSelfNewsHeadlines(payload: {
  ids: string[];
  status?: TStatus;
}): Promise<TNewsHeadlinesResponse> {
  const response = await api.patch("/api/news-Headline/bulk/self", payload);
  return response.data as TNewsHeadlinesResponse;
}

// Update Self Single News Headline
export async function updateSelfNewsHeadline(
  id: string,
  payload: {
    news?: string;
    status?: TStatus;
    published_at?: string | Date;
    expired_at?: string | Date;
  },
): Promise<TNewsHeadlineResponse> {
  const response = await api.patch(`/api/news-Headline/${id}/self`, payload);
  return response.data as TNewsHeadlineResponse;
}

// Update Bulk News Headlines (Admin)
export async function updateNewsHeadlines(payload: {
  ids: string[];
  status?: TStatus;
}): Promise<TNewsHeadlinesResponse> {
  const response = await api.patch("/api/news-Headline/bulk", payload);
  return response.data as TNewsHeadlinesResponse;
}

// Update Single News Headline (Admin)
export async function updateNewsHeadline(
  id: string,
  payload: {
    news?: string;
    status?: TStatus;
    published_at?: string | Date;
    expired_at?: string | Date;
  },
): Promise<TNewsHeadlineResponse> {
  const response = await api.patch(`/api/news-Headline/${id}`, payload);
  return response.data as TNewsHeadlineResponse;
}

// ========================= DELETE =========================

// Bulk Delete Self News Headlines
export async function deleteSelfNewsHeadlines(payload: {
  ids: string[];
}): Promise<TNewsHeadlinesResponse> {
  const response = await api.delete("/api/news-Headline/bulk/self", {
    data: payload,
  });
  return response.data as TNewsHeadlinesResponse;
}

// Bulk Permanent Delete News Headlines (Admin)
export async function deleteNewsHeadlinesPermanent(payload: {
  ids: string[];
}): Promise<TNewsHeadlinesResponse> {
  const response = await api.delete("/api/news-Headline/bulk/permanent", {
    data: payload,
  });
  return response.data as TNewsHeadlinesResponse;
}

// Bulk Soft Delete News Headlines (Admin)
export async function deleteNewsHeadlines(payload: {
  ids: string[];
}): Promise<TNewsHeadlinesResponse> {
  const response = await api.delete("/api/news-Headline/bulk", {
    data: payload,
  });
  return response.data as TNewsHeadlinesResponse;
}

// Delete Self Single News Headline
export async function deleteSelfNewsHeadline(
  id: string,
): Promise<TNewsHeadlineResponse> {
  const response = await api.delete(`/api/news-Headline/${id}/self`);
  return response.data as TNewsHeadlineResponse;
}

// Delete Single Permanent News Headline (Admin)
export async function deleteNewsHeadlinePermanent(
  id: string,
): Promise<TNewsHeadlineResponse> {
  const response = await api.delete(`/api/news-Headline/${id}/permanent`);
  return response.data as TNewsHeadlineResponse;
}

// Delete Single Soft News Headline (Admin)
export async function deleteNewsHeadline(
  id: string,
): Promise<TNewsHeadlineResponse> {
  const response = await api.delete(`/api/news-Headline/${id}`);
  return response.data as TNewsHeadlineResponse;
}
