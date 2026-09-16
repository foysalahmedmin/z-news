import api from "@/lib/api";
import type { TUserResponse, TUsersResponse } from "@/types/user.type";

// GET Self
export async function fetchSelf(): Promise<TUserResponse> {
  const response = await api.get("/api/user/self");
  return response.data as TUserResponse;
}

// GET All ["admin", "author"] (Admin)
export async function fetchWritersUsers(
  query?: Record<string, any>,
): Promise<TUsersResponse> {
  const response = await api.get("/api/user/writers", { params: query });
  return response.data as TUsersResponse;
}

// GET All Users (Admin)
export async function fetchUsers(
  query?: Record<string, any>,
): Promise<TUsersResponse> {
  const response = await api.get("/api/user", { params: query });
  return response.data as TUsersResponse;
}

// GET Single User by ID (Admin)
export async function fetchUser(id: string): Promise<TUserResponse> {
  const response = await api.get(`/api/user/${id}`);
  return response.data as TUserResponse;
}

// PATCH Self
export async function updateSelf(
  payload: Partial<{
    image?: File | string | null;
    name: string;
    email: string;
  }>,
): Promise<TUserResponse> {
  const formData = new FormData();
  if (payload.name) formData.append("name", payload.name);
  if (payload.email) formData.append("email", payload.email);
  if (payload.image) formData.append("image", payload.image);
  const response = await api.patch("/api/user/self", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return response.data as TUserResponse;
}

// PATCH Bulk Users (Admin)
export async function updateUsers(payload: {
  ids: string[];
  status?: "in-progress" | "blocked";
  role?: "editor" | "author" | "contributor" | "subscriber" | "user";
  is_verified?: boolean;
}): Promise<TUsersResponse> {
  const response = await api.patch("/api/user/bulk", payload);
  return response.data as TUsersResponse;
}

// PATCH Single User (Admin)
export async function updateUser(
  id: string,
  payload: {
    image?: File | string | null;
    name?: string;
    email?: string;
    status?: "in-progress" | "blocked";
    role?: "editor" | "author" | "contributor" | "subscriber" | "user";
    is_verified?: boolean;
  },
): Promise<TUserResponse> {
  const formData = new FormData();
  if (payload.name) formData.append("name", payload.name);
  if (payload.email) formData.append("email", payload.email);
  if (payload.image) formData.append("image", payload.image);
  if (payload.status) formData.append("status", payload.status);
  if (payload.role) formData.append("role", payload.role);
  if (typeof payload.is_verified === "boolean")
    formData.append("is_verified", payload.is_verified.toString());

  const response = await api.patch(`/api/user/${id}`, payload);
  return response.data as TUserResponse;
}

// DELETE Bulk Permanent (Admin)
export async function deleteUsersPermanent(payload: {
  ids: string[];
}): Promise<TUsersResponse> {
  const response = await api.delete("/api/user/bulk/permanent", {
    data: payload,
  });
  return response.data as TUsersResponse;
}

// DELETE Bulk Soft Delete (Admin)
export async function deleteUsers(payload: {
  ids: string[];
}): Promise<TUsersResponse> {
  const response = await api.delete("/api/user/bulk", { data: payload });
  return response.data as TUsersResponse;
}

// DELETE Single Permanent (Admin)
export async function deleteUserPermanent(id: string): Promise<TUserResponse> {
  const response = await api.delete(`/api/user/${id}/permanent`);
  return response.data as TUserResponse;
}

// DELETE Single Soft Delete (Admin)
export async function deleteUser(id: string): Promise<TUserResponse> {
  const response = await api.delete(`/api/user/${id}`);
  return response.data as TUserResponse;
}

// POST Bulk Restore (Admin)
export async function restoreUsers(payload: {
  ids: string[];
}): Promise<TUsersResponse> {
  const response = await api.post("/api/user/bulk/restore", payload);
  return response.data as TUsersResponse;
}

// POST Single Restore (Admin)
export async function restoreUser(id: string): Promise<TUserResponse> {
  const response = await api.post(`/api/user/${id}/restore`);
  return response.data as TUserResponse;
}
