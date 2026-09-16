// Comment Services (FrontEnd)

import api from "@/lib/api";
import type {
  TBulkUpdateCommentPayload,
  TCommentResponse,
  TCommentsResponse,
  TCreateCommentPayload,
  TUpdateCommentPayload,
  TUpdateSelfCommentPayload,
} from "@/types/comment.type";

// ========================= GET =========================
export async function fetchPublicComments(
  query?: Record<string, any>,
): Promise<TCommentsResponse> {
  const response = await api.get("/api/comment/public", {
    params: query,
    withCredentials: true,
  });
  return response.data;
}

export async function fetchSelfComments(
  query?: Record<string, any>,
): Promise<TCommentsResponse> {
  const response = await api.get("/api/comment/self", {
    params: query,
    withCredentials: true,
  });
  return response.data;
}

export async function fetchComments(
  query?: Record<string, any>,
): Promise<TCommentsResponse> {
  const response = await api.get("/api/comment", {
    params: query,
    withCredentials: true,
  });
  return response.data;
}

export async function fetchSelfComment(id: string): Promise<TCommentResponse> {
  const response = await api.get(`/api/comment/${id}/self`, {
    withCredentials: true,
  });
  return response.data;
}

export async function fetchComment(id: string): Promise<TCommentResponse> {
  const response = await api.get(`/api/comment/${id}`, {
    withCredentials: true,
  });
  return response.data;
}

export async function fetchFlaggedComments(query?: {
  min_flags?: number;
}): Promise<TCommentsResponse> {
  const response = await api.get("/api/comment-enhanced/flagged/list", {
    params: query,
    withCredentials: true,
  });
  return response.data;
}

// ========================= POST =========================
export async function createComment(
  payload: TCreateCommentPayload,
): Promise<TCommentResponse> {
  const response = await api.post("/api/comment", payload, {
    withCredentials: true,
  });
  return response.data;
}

export async function restoreSelfComments(payload: {
  ids: string[];
}): Promise<TCommentsResponse> {
  const response = await api.post("/api/comment/bulk/restore/self", payload, {
    withCredentials: true,
  });
  return response.data;
}

export async function restoreComments(payload: {
  ids: string[];
}): Promise<TCommentsResponse> {
  const response = await api.post("/api/comment/bulk/restore", payload, {
    withCredentials: true,
  });
  return response.data;
}

export async function restoreSelfComment(
  id: string,
): Promise<TCommentResponse> {
  const response = await api.post(
    `/api/comment/${id}/restore/self`,
    {},
    {
      withCredentials: true,
    },
  );
  return response.data;
}

export async function restoreComment(id: string): Promise<TCommentResponse> {
  const response = await api.post(
    `/api/comment/${id}/restore`,
    {},
    {
      withCredentials: true,
    },
  );
  return response.data;
}

// ========================= PATCH =========================
export async function updateSelfComments(
  payload: TBulkUpdateCommentPayload,
): Promise<TCommentsResponse> {
  const response = await api.patch("/api/comment/bulk/self", payload, {
    withCredentials: true,
  });
  return response.data;
}

export async function updateSelfComment(
  id: string,
  payload: TUpdateSelfCommentPayload,
): Promise<TCommentResponse> {
  const response = await api.patch(`/api/comment/${id}/self`, payload, {
    withCredentials: true,
  });
  return response.data;
}

export async function updateComments(
  payload: TBulkUpdateCommentPayload,
): Promise<TCommentsResponse> {
  const response = await api.patch("/api/comment/bulk", payload, {
    withCredentials: true,
  });
  return response.data;
}

export async function updateComment(
  id: string,
  payload: TUpdateCommentPayload,
): Promise<TCommentResponse> {
  const response = await api.patch(`/api/comment/${id}`, payload, {
    withCredentials: true,
  });
  return response.data;
}

export async function moderateComment(
  id: string,
  payload: { status: "approved" | "rejected"; reason?: string },
): Promise<TCommentResponse> {
  const response = await api.patch(
    `/api/comment-enhanced/${id}/moderate`,
    payload,
    {
      withCredentials: true,
    },
  );
  return response.data;
}

export async function pinComment(id: string): Promise<TCommentResponse> {
  const response = await api.patch(
    `/api/comment-enhanced/${id}/pin`,
    {},
    {
      withCredentials: true,
    },
  );
  return response.data;
}

export async function unpinComment(id: string): Promise<TCommentResponse> {
  const response = await api.patch(
    `/api/comment-enhanced/${id}/unpin`,
    {},
    {
      withCredentials: true,
    },
  );
  return response.data;
}

// ========================= DELETE =========================
export async function deleteSelfComments(payload: {
  ids: string[];
}): Promise<TCommentsResponse> {
  const response = await api.delete("/api/comment/bulk/self", {
    data: payload,
    withCredentials: true,
  });
  return response.data;
}

export async function deleteCommentsPermanent(payload: {
  ids: string[];
}): Promise<TCommentsResponse> {
  const response = await api.delete("/api/comment/bulk/permanent", {
    data: payload,
    withCredentials: true,
  });
  return response.data;
}

export async function deleteComments(payload: {
  ids: string[];
}): Promise<TCommentsResponse> {
  const response = await api.delete("/api/comment/bulk", {
    data: payload,
    withCredentials: true,
  });
  return response.data;
}

export async function deleteSelfComment(id: string): Promise<TCommentResponse> {
  const response = await api.delete(`/api/comment/${id}/self`, {
    withCredentials: true,
  });
  return response.data;
}

export async function deleteCommentPermanent(
  id: string,
): Promise<TCommentResponse> {
  const response = await api.delete(`/api/comment/${id}/permanent`, {
    withCredentials: true,
  });
  return response.data;
}

export async function deleteComment(id: string): Promise<TCommentResponse> {
  const response = await api.delete(`/api/comment/${id}`, {
    withCredentials: true,
  });
  return response.data;
}
