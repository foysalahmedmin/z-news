import api from "@/lib/api";
import type {
  TCreatePollPayload,
  TPollResponse,
  TPollResultsResponse,
  TPollsResponse,
  TUpdatePollPayload,
  TVotePollPayload,
} from "@/types/poll.type";

// Writes here are gated only by `auth()` (any authenticated role, enforced
// server-side by ownership checks in poll.service.ts) rather than an
// admin-only role, and reads are public -- so this uses @/lib/api (the plain
// Fetch client), matching bookmark.service.ts, rather than @/lib/admin-api.

export const fetchPolls = async (
  query?: Record<string, any>,
): Promise<TPollsResponse> => {
  const queryString = query
    ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
    : "";
  const response = await api.get(`/api/poll${queryString}`);
  return response.data as TPollsResponse;
};

export const fetchActivePolls = async (): Promise<TPollsResponse> => {
  const response = await api.get("/api/poll/active");
  return response.data as TPollsResponse;
};

export const fetchFeaturedPolls = async (
  limit?: number,
): Promise<TPollsResponse> => {
  const queryString = limit ? `?limit=${limit}` : "";
  const response = await api.get(`/api/poll/featured${queryString}`);
  return response.data as TPollsResponse;
};

export const fetchPollsByNews = async (
  newsId: string,
): Promise<TPollsResponse> => {
  const response = await api.get(`/api/poll/news/${newsId}`);
  return response.data as TPollsResponse;
};

export const fetchPoll = async (id: string): Promise<TPollResponse> => {
  const response = await api.get(`/api/poll/${id}`);
  return response.data as TPollResponse;
};

export const fetchPollResults = async (
  id: string,
): Promise<TPollResultsResponse> => {
  const response = await api.get(`/api/poll/${id}/results`);
  return response.data as TPollResultsResponse;
};

export const createPoll = async (
  payload: TCreatePollPayload,
): Promise<TPollResponse> => {
  const response = await api.post("/api/poll", payload);
  return response.data as TPollResponse;
};

export const updatePoll = async (
  id: string,
  payload: TUpdatePollPayload,
): Promise<TPollResponse> => {
  const response = await api.patch(`/api/poll/${id}`, payload);
  return response.data as TPollResponse;
};

export const deletePoll = async (id: string): Promise<TPollResponse> => {
  const response = await api.delete(`/api/poll/${id}`);
  return response.data as TPollResponse;
};

export const votePoll = async (
  id: string,
  payload: TVotePollPayload,
): Promise<TPollResponse> => {
  const response = await api.post(`/api/poll/${id}/vote`, payload);
  return response.data as TPollResponse;
};
