// Reaction Services (FrontEnd)

import api from "@/lib/api";
import type {
  TBulkUpdateReactionPayload,
  TCreateReactionPayload,
  TReactionResponse,
  TReactionsResponse,
  TUpdateReactionPayload,
  TUpdateSelfReactionPayload,
} from "@/types/reaction.type";

// ========================= GET =========================
export async function fetchSelfReactions(
  query?: Record<string, any>,
): Promise<TReactionsResponse> {
  const response = await api.get("/api/reaction/self", {
    params: query,
    withCredentials: true,
  });
  return response.data;
}

export async function fetchReactions(
  query?: Record<string, any>,
): Promise<TReactionsResponse> {
  const response = await api.get("/api/reaction", {
    params: query,
    withCredentials: true,
  });
  return response.data;
}

export async function fetchSelfNewsReaction(
  newsId: string,
): Promise<TReactionResponse> {
  const response = await api.get(`/api/reaction/news/${newsId}/self`, {
    withCredentials: true,
  });
  return response.data;
}

export async function fetchSelfReaction(
  id: string,
): Promise<TReactionResponse> {
  const response = await api.get(`/api/reaction/${id}/self`, {
    withCredentials: true,
  });
  return response.data;
}

export async function fetchReaction(id: string): Promise<TReactionResponse> {
  const response = await api.get(`/api/reaction/${id}`, {
    withCredentials: true,
  });
  return response.data;
}

// ========================= PATCH =========================
export async function updateSelfReactions(
  payload: TBulkUpdateReactionPayload,
): Promise<TReactionsResponse> {
  const response = await api.patch("/api/reaction/bulk/self", payload, {
    withCredentials: true,
  });
  return response.data;
}

export async function updateSelfReaction(
  id: string,
  payload: TUpdateSelfReactionPayload,
): Promise<TReactionResponse> {
  const response = await api.patch(`/api/reaction/${id}/self`, payload, {
    withCredentials: true,
  });
  return response.data;
}

export async function updateReactions(
  payload: TBulkUpdateReactionPayload,
): Promise<TReactionsResponse> {
  const response = await api.patch("/api/reaction/bulk", payload, {
    withCredentials: true,
  });
  return response.data;
}

export async function updateReaction(
  id: string,
  payload: TUpdateReactionPayload,
): Promise<TReactionResponse> {
  const response = await api.patch(`/api/reaction/${id}`, payload, {
    withCredentials: true,
  });
  return response.data;
}

// ========================= DELETE =========================
export async function deleteSelfReactions(payload: {
  ids: string[];
}): Promise<TReactionsResponse> {
  const response = await api.delete("/api/reaction/bulk/self", {
    data: payload,
    withCredentials: true,
  });
  return response.data;
}

export async function deleteReactions(payload: {
  ids: string[];
}): Promise<TReactionsResponse> {
  const response = await api.delete("/api/reaction/bulk", {
    data: payload,
    withCredentials: true,
  });
  return response.data;
}

export async function deleteSelfReaction(
  id: string,
): Promise<TReactionResponse> {
  const response = await api.delete(`/api/reaction/${id}/self`, {
    withCredentials: true,
  });
  return response.data;
}

export async function deleteReaction(id: string): Promise<TReactionResponse> {
  const response = await api.delete(`/api/reaction/${id}`, {
    withCredentials: true,
  });
  return response.data;
}

// ========================= POST =========================
export async function createReaction(
  payload: TCreateReactionPayload,
): Promise<TReactionResponse> {
  const response = await api.post("/api/reaction", payload, {
    withCredentials: true,
  });
  return response.data;
}
