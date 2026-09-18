import api from "@/lib/admin-api";
import type {
  TBadgeAwardResponse,
  TBadgeCreatePayload,
  TBadgeResponse,
  TBadgesResponse,
  TBadgeUpdatePayload,
} from "@/types/admin-badge.type";

// GET All Badges (Admin) — backend supports `category`, `rarity` and
// `is_active` filters only (apps/backend/.../badge.service.ts#getAllBadges);
// there is no pagination/search/sort support server-side, so any of those
// keys passed here are simply ignored by the API.
export async function fetchBadges(
  query?: Record<string, any>,
): Promise<TBadgesResponse> {
  const response = await api.get("/api/badge", { params: query });
  return response.data as TBadgesResponse;
}

// GET Single Badge by ID (Public route, used here for admin fetch-by-id)
export async function fetchBadge(id: string): Promise<TBadgeResponse> {
  const response = await api.get(`/api/badge/${id}`);
  return response.data as TBadgeResponse;
}

// POST Create Badge (super-admin, admin)
export async function createBadge(
  payload: TBadgeCreatePayload,
): Promise<TBadgeResponse> {
  const response = await api.post("/api/badge", payload);
  return response.data as TBadgeResponse;
}

// PATCH Update Badge (super-admin, admin)
export async function updateBadge(
  id: string,
  payload: TBadgeUpdatePayload,
): Promise<TBadgeResponse> {
  const response = await api.patch(`/api/badge/${id}`, payload);
  return response.data as TBadgeResponse;
}

// DELETE Badge (super-admin, admin) — soft delete
export async function deleteBadge(id: string): Promise<TBadgeResponse> {
  const response = await api.delete(`/api/badge/${id}`);
  return response.data as TBadgeResponse;
}

// POST Seed Default Badges (super-admin only)
export async function seedBadges(): Promise<TBadgesResponse> {
  const response = await api.post("/api/badge/seed");
  return response.data as TBadgesResponse;
}

// POST Award Badge — evaluates criteria and awards any newly-earned badges
// to the given user (super-admin, admin). `badgeId` is accepted for callers
// that want to award a specific badge, but the backend route only takes a
// `userId` param and auto-evaluates all active badges' criteria.
export async function awardBadge(
  userId: string,
  _badgeId?: string,
): Promise<TBadgeAwardResponse> {
  const response = await api.post(`/api/badge/award/${userId}`);
  return response.data as TBadgeAwardResponse;
}
