import { ENV } from "@/config";
import { getAuthHeaders } from "@/lib/api";
import type { TUserProfile } from "@/types/user-profile.type";

type TProfileResponse = {
  data: TUserProfile;
  success: boolean;
  message: string;
};

const BASE = `${ENV.api_url}/api/user-profiles`;

// ──────────────────────────────────────────────── GET MY PROFILE
export const getMyProfile = async (): Promise<TProfileResponse> => {
  const headers = getAuthHeaders();
  // Anonymous visitors have no profile; skip a request that can only 401.
  if (!headers.Authorization) {
    return { success: false, message: "Not signed in" } as TProfileResponse;
  }
  const response = await fetch(`${BASE}/me`, {
    method: "GET",
    credentials: "include",
    cache: "no-cache",
    headers,
  });
  return response.json();
};

// ──────────────────────────────────────────────── UPDATE MY PROFILE
export const updateMyProfile = async (payload: {
  bio?: string;
  location?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
}): Promise<TProfileResponse> => {
  const response = await fetch(`${BASE}/me`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return response.json();
};

// ──────────────────────────────────────────────── UPDATE NOTIFICATION PREFERENCES
export const updateNotificationPreferences = async (payload: {
  notification_preferences?: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    comment_replies?: boolean;
    article_updates?: boolean;
    newsletter?: boolean;
  };
  email_frequency?: "instant" | "daily" | "weekly" | "never";
}): Promise<TProfileResponse> => {
  const response = await fetch(`${BASE}/me/notifications`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return response.json();
};

// ──────────────────────────────────────────────── GET PUBLIC PROFILE
export const getPublicProfile = async (
  userId: string,
): Promise<TProfileResponse> => {
  const response = await fetch(`${BASE}/${userId}`, {
    method: "GET",
    next: { revalidate: 60 },
  });
  return response.json();
};

// ──────────────────────────────────────────────── FOLLOW AUTHOR
export const followAuthor = async (
  authorId: string,
): Promise<TProfileResponse> => {
  const response = await fetch(`${BASE}/follow/author`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ author_id: authorId }),
  });
  return response.json();
};

// ──────────────────────────────────────────────── UNFOLLOW AUTHOR
export const unfollowAuthor = async (
  authorId: string,
): Promise<TProfileResponse> => {
  const response = await fetch(`${BASE}/follow/author/${authorId}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return response.json();
};

// ──────────────────────────────────────────────── FOLLOW CATEGORY
export const followCategory = async (
  categoryId: string,
): Promise<TProfileResponse> => {
  const response = await fetch(`${BASE}/follow/category`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ category_id: categoryId }),
  });
  return response.json();
};

// ──────────────────────────────────────────────── UNFOLLOW CATEGORY
export const unfollowCategory = async (
  categoryId: string,
): Promise<TProfileResponse> => {
  const response = await fetch(`${BASE}/follow/category/${categoryId}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return response.json();
};

// ──────────────────────────────────────────────── FOLLOW TOPIC
export const followTopic = async (topic: string): Promise<TProfileResponse> => {
  const response = await fetch(`${BASE}/follow/topic`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ topic }),
  });
  return response.json();
};

// ──────────────────────────────────────────────── UNFOLLOW TOPIC
export const unfollowTopic = async (
  topic: string,
): Promise<TProfileResponse> => {
  const response = await fetch(
    `${BASE}/follow/topic/${encodeURIComponent(topic)}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: getAuthHeaders(),
    },
  );
  return response.json();
};

// ──────────────────────────────────────────────── TOP USERS BY REPUTATION
export const getTopUsers = async (
  limit?: number,
): Promise<{
  data: TUserProfile[];
  success: boolean;
}> => {
  const url = limit ? `${BASE}/top?limit=${limit}` : `${BASE}/top`;
  const response = await fetch(url, {
    method: "GET",
    next: { revalidate: 60 },
  });
  return response.json();
};
