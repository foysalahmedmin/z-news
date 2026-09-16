import api from "@/lib/api";
import type {
  TNewsBreakResponse,
  TNewsBreaksResponse,
  TStatus,
} from "@/types/news-break.type";

// ========================= GET =========================

// GET Self News Breaks (Admin)
export async function fetchSelfNewsBreaks(
  query?: Record<string, any>,
): Promise<TNewsBreaksResponse> {
  const response = await api.get("/api/news-break/self", { params: query });
  return response.data as TNewsBreaksResponse;
}

// GET All News Breaks (Admin)
export async function fetchNewsBreaks(
  query?: Record<string, any>,
): Promise<TNewsBreaksResponse> {
  const response = await api.get("/api/news-break", { params: query });
  return response.data as TNewsBreaksResponse;
}

// GET Self Single News Break
export async function fetchSelfNewsBreak(
  id: string,
): Promise<TNewsBreakResponse> {
  const response = await api.get(`/api/news-break/${id}/self`);
  return response.data as TNewsBreakResponse;
}

// GET Single News Break (Admin)
export async function fetchNewsBreak(id: string): Promise<TNewsBreakResponse> {
  const response = await api.get(`/api/news-break/${id}`);
  return response.data as TNewsBreakResponse;
}

// ========================= POST =========================

// Create News Break
export async function createNewsBreak(payload: {
  news: string;
  status?: TStatus;
  published_at?: string | Date;
  expired_at?: string | Date;
}): Promise<TNewsBreakResponse> {
  const response = await api.post("/api/news-break", payload);
  return response.data as TNewsBreakResponse;
}

// Bulk Restore Self News Breaks
export async function restoreSelfNewsBreaks(payload: {
  ids: string[];
}): Promise<TNewsBreaksResponse> {
  const response = await api.post("/api/news-break/bulk/restore/self", payload);
  return response.data as TNewsBreaksResponse;
}

// Bulk Restore News Breaks (Admin)
export async function restoreNewsBreaks(payload: {
  ids: string[];
}): Promise<TNewsBreaksResponse> {
  const response = await api.post("/api/news-break/bulk/restore", payload);
  return response.data as TNewsBreaksResponse;
}

// Restore Single Self News Break
export async function restoreSelfNewsBreak(
  id: string,
): Promise<TNewsBreakResponse> {
  const response = await api.post(`/api/news-break/${id}/restore/self`);
  return response.data as TNewsBreakResponse;
}

// Restore Single News Break (Admin)
export async function restoreNewsBreak(
  id: string,
): Promise<TNewsBreakResponse> {
  const response = await api.post(`/api/news-break/${id}/restore`);
  return response.data as TNewsBreakResponse;
}

// ========================= PATCH =========================

// Update Bulk Self News Breaks
export async function updateSelfNewsBreaks(payload: {
  ids: string[];
  status?: TStatus;
}): Promise<TNewsBreaksResponse> {
  const response = await api.patch("/api/news-break/bulk/self", payload);
  return response.data as TNewsBreaksResponse;
}

// Update Self Single News Break
export async function updateSelfNewsBreak(
  id: string,
  payload: {
    news?: string;
    status?: TStatus;
    published_at?: string | Date;
    expired_at?: string | Date;
  },
): Promise<TNewsBreakResponse> {
  const response = await api.patch(`/api/news-break/${id}/self`, payload);
  return response.data as TNewsBreakResponse;
}

// Update Bulk News Breaks (Admin)
export async function updateNewsBreaks(payload: {
  ids: string[];
  status?: TStatus;
}): Promise<TNewsBreaksResponse> {
  const response = await api.patch("/api/news-break/bulk", payload);
  return response.data as TNewsBreaksResponse;
}

// Update Single News Break (Admin)
export async function updateNewsBreak(
  id: string,
  payload: {
    news?: string;
    status?: TStatus;
    published_at?: string | Date;
    expired_at?: string | Date;
  },
): Promise<TNewsBreakResponse> {
  const response = await api.patch(`/api/news-break/${id}`, payload);
  return response.data as TNewsBreakResponse;
}

// ========================= DELETE =========================

// Bulk Delete Self News Breaks
export async function deleteSelfNewsBreaks(payload: {
  ids: string[];
}): Promise<TNewsBreaksResponse> {
  const response = await api.delete("/api/news-break/bulk/self", {
    data: payload,
  });
  return response.data as TNewsBreaksResponse;
}

// Bulk Permanent Delete News Breaks (Admin)
export async function deleteNewsBreaksPermanent(payload: {
  ids: string[];
}): Promise<TNewsBreaksResponse> {
  const response = await api.delete("/api/news-break/bulk/permanent", {
    data: payload,
  });
  return response.data as TNewsBreaksResponse;
}

// Bulk Soft Delete News Breaks (Admin)
export async function deleteNewsBreaks(payload: {
  ids: string[];
}): Promise<TNewsBreaksResponse> {
  const response = await api.delete("/api/news-break/bulk", { data: payload });
  return response.data as TNewsBreaksResponse;
}

// Delete Self Single News Break
export async function deleteSelfNewsBreak(
  id: string,
): Promise<TNewsBreakResponse> {
  const response = await api.delete(`/api/news-break/${id}/self`);
  return response.data as TNewsBreakResponse;
}

// Delete Single Permanent News Break (Admin)
export async function deleteNewsBreakPermanent(
  id: string,
): Promise<TNewsBreakResponse> {
  const response = await api.delete(`/api/news-break/${id}/permanent`);
  return response.data as TNewsBreakResponse;
}

// Delete Single Soft News Break (Admin)
export async function deleteNewsBreak(id: string): Promise<TNewsBreakResponse> {
  const response = await api.delete(`/api/news-break/${id}`);
  return response.data as TNewsBreakResponse;
}
