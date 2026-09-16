import { ENV } from "@/config";
import { TCommentResponse, TCommentsResponse } from "@/types/comment.type";
import { TReactionType } from "@/types/reaction.type";

export const fetchComments = async (
  query?: Record<string, any>,
): Promise<TCommentsResponse> => {
  const queryString = query
    ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
    : "";

  const url = `${ENV.api_url}/api/comment/public${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-cache",
    credentials: "include",
  });

  if (!response.ok) {
    return {
      data: [],
      message: "Failed to fetch comments",
      success: false,
    };
  }

  return response.json() as Promise<TCommentsResponse>;
};

export const createComment = async (payload: any) => {
  const url = `${ENV.api_url}/api/comment`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return response.json() as Promise<TCommentResponse>;
};

export const updateComment = async (_id: string, payload: any) => {
  const url = `${ENV.api_url}/api/comment/${_id}/self`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return response.json() as Promise<TCommentResponse>;
};

export const deleteComment = async (_id: string) => {
  const url = `${ENV.api_url}/api/comment/${_id}/self`;
  const response = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  return response.json() as Promise<TCommentResponse>;
};

export const fetchThreadedComments = async (
  newsId: string,
): Promise<TCommentsResponse> => {
  const url = `${ENV.api_url}/api/comment-enhanced/news/${newsId}/threaded`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-cache",
    credentials: "include",
  });

  if (!response.ok) {
    return {
      data: [],
      message: "Failed to fetch threaded comments",
      success: false,
    };
  }

  return response.json() as Promise<TCommentsResponse>;
};

export const fetchCommentReplies = async (
  commentId: string,
): Promise<TCommentsResponse> => {
  const url = `${ENV.api_url}/api/comment-enhanced/${commentId}/replies`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-cache",
    credentials: "include",
  });

  if (!response.ok) {
    return {
      data: [],
      message: "Failed to fetch comment replies",
      success: false,
    };
  }

  return response.json() as Promise<TCommentsResponse>;
};

export const createCommentReply = async (commentId: string, payload: any) => {
  const url = `${ENV.api_url}/api/comment-enhanced/${commentId}/reply`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return response.json() as Promise<TCommentResponse>;
};

export const addCommentReaction = async (
  commentId: string,
  type: TReactionType,
) => {
  const url = `${ENV.api_url}/api/comment-enhanced/${commentId}/reaction`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ type }),
  });
  return response.json() as Promise<TCommentResponse>;
};

export const removeCommentReaction = async (commentId: string) => {
  const url = `${ENV.api_url}/api/comment-enhanced/${commentId}/reaction`;
  const response = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
  return response.json() as Promise<TCommentResponse>;
};

export const pinComment = async (commentId: string) => {
  const url = `${ENV.api_url}/api/comment-enhanced/${commentId}/pin`;
  const response = await fetch(url, {
    method: "PATCH",
    credentials: "include",
  });
  return response.json() as Promise<TCommentResponse>;
};

export const unpinComment = async (commentId: string) => {
  const url = `${ENV.api_url}/api/comment-enhanced/${commentId}/unpin`;
  const response = await fetch(url, {
    method: "PATCH",
    credentials: "include",
  });
  return response.json() as Promise<TCommentResponse>;
};
