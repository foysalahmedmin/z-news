import api from "@/lib/admin-api";
import type {
  TMediaCreatePayload,
  TMediaListResponse,
  TMediaResponse,
  TMediaUpdatePayload,
} from "@/types/media.type";

// GET /api/media is fully public (no auth middleware — see
// media.route.ts), but @/lib/admin-api works fine for that too: it just
// won't attach a token when the viewer is unauthenticated. Media's admin
// CRUD lives in this single media.service.ts (not split into
// admin-media.service.ts/media.service.ts) — same as file.service.ts does
// for File.

// ========================= GET =========================

// GET All Media
export async function fetchMedia(
  query?: Record<string, any>,
): Promise<TMediaListResponse> {
  const response = await api.get("/api/media", { params: query });
  return response.data as TMediaListResponse;
}

// GET Single Media Item
export async function fetchMediaItem(id: string): Promise<TMediaResponse> {
  const response = await api.get(`/api/media/${id}`);
  return response.data as TMediaResponse;
}

// ========================= POST =========================

// Create Media (super-admin, admin, editor, author)
export async function createMedia(
  payload: TMediaCreatePayload,
): Promise<TMediaResponse> {
  const response = await api.post("/api/media", payload);
  return response.data as TMediaResponse;
}

// ========================= PATCH =========================

// Update Media (super-admin, admin, editor)
export async function updateMedia(
  id: string,
  payload: TMediaUpdatePayload,
): Promise<TMediaResponse> {
  const response = await api.patch(`/api/media/${id}`, payload);
  return response.data as TMediaResponse;
}

// ========================= DELETE =========================

// Delete Media (super-admin, admin) — soft delete only, no restore route
// exists on the backend for Media.
export async function deleteMedia(id: string): Promise<TMediaResponse> {
  const response = await api.delete(`/api/media/${id}`);
  return response.data as TMediaResponse;
}
