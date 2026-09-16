import { ENV } from "@/config";
import { TReactionResponse, TReactionsResponse } from "@/types/reaction.type";

export const fetchReactions = async (
  query?: Record<string, any>,
): Promise<TReactionsResponse> => {
  const queryString = query
    ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
    : "";

  const url = `${ENV.api_url}/api/reaction/self${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-cache",
    credentials: "include",
  });

  if (!response.ok) {
    return {
      data: [],
      message: "Failed to fetch reactions",
      success: false,
    };
  }

  return response.json() as Promise<TReactionsResponse>;
};

export const fetchNewsReaction = async (
  news_id?: string,
  query?: Record<string, any>,
): Promise<TReactionResponse> => {
  if (!news_id) {
    console.error("news_id is required");
  }

  const queryString = query
    ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
    : "";

  const url = `${ENV.api_url}/api/reaction/news/${news_id}/self${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-cache",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch news reaction");
  }

  return response.json() as Promise<TReactionResponse>;
};

export const createReaction = async (payload: any) => {
  const url = `${ENV.api_url}/api/reaction`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return response.json() as Promise<TReactionResponse>;
};

export const updateReaction = async (_id: string, payload: any) => {
  const url = `${ENV.api_url}/api/reaction/${_id}/self`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return response.json() as Promise<TReactionResponse>;
};

export const deleteReaction = async (_id: string) => {
  const url = `${ENV.api_url}/api/reaction/${_id}/self`;
  const response = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  return response.json() as Promise<TReactionResponse>;
};
