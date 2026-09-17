import { ENV } from "@/config";
import type { TUserState } from "@/types/state.type";
import type { TUserProfile } from "@/types/user-profile.type";
import { getCookie } from "cookies-next";

type TProfileResponse = {
  data: TUserProfile;
  success: boolean;
  message: string;
};

const BASE = `${ENV.api_url}/api/user-profiles`;

// The backend's auth() middleware reads the access token from the
// Authorization header only (never from a cookie), so every auth()-protected
// route below must attach it manually — the same "user" cookie
// useUser.tsx writes on sign-in, read here via cookies-next's isomorphic
// getCookie the same way src/lib/api.ts's request interceptor does.
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const cookie = await getCookie("user");
  try {
    const user = cookie ? (JSON.parse(cookie) as TUserState) : null;
    return user?.token ? { Authorization: user.token } : {};
  } catch {
    return {};
  }
};

// ──────────────────────────────────────────────── GET MY PROFILE
export const getMyProfile = async (): Promise<TProfileResponse> => {
  const response = await fetch(`${BASE}/me`, {
    method: "GET",
    credentials: "include",
    cache: "no-cache",
    headers: await getAuthHeaders(),
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
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
    },
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
    headers: await getAuthHeaders(),
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
      ...(await getAuthHeaders()),
    },
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
    headers: await getAuthHeaders(),
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
      ...(await getAuthHeaders()),
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
      headers: await getAuthHeaders(),
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
