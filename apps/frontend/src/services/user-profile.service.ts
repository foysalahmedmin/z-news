import { ENV } from "@/config";
import type { TUserProfile } from "@/types/user-profile.type";

type TProfileResponse = {
  data: TUserProfile;
  success: boolean;
  message: string;
};

const BASE = `${ENV.api_url}/api/user-profiles`;

// ──────────────────────────────────────────────── GET MY PROFILE
export const getMyProfile = async (): Promise<TProfileResponse> => {
  const response = await fetch(`${BASE}/me`, {
    method: "GET",
    credentials: "include",
    cache: "no-cache",
  });
  return response.json();
};

// ──────────────────────────────────────────────── GET PUBLIC PROFILE
export const getPublicProfile = async (
  userId: string,
): Promise<TProfileResponse> => {
  const response = await fetch(`${BASE}/${userId}`, {
    method: "GET",
    credentials: "include",
    cache: "no-cache",
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ authorId }),
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categoryId }),
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
  });
  return response.json();
};

// ──────────────────────────────────────────────── FOLLOW TOPIC
export const followTopic = async (topic: string): Promise<TProfileResponse> => {
  const response = await fetch(`${BASE}/follow/topic`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
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
    },
  );
  return response.json();
};

// ──────────────────────────────────────────────── TOP USERS BY REPUTATION
export const getTopUsers = async (): Promise<{
  data: TUserProfile[];
  success: boolean;
}> => {
  const response = await fetch(`${BASE}/top`, {
    method: "GET",
    credentials: "include",
    cache: "no-cache",
  });
  return response.json();
};
