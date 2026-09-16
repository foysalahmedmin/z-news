import api from "@/lib/api";
import type {
  TCategoriesResponse,
  TCategoryCreatePayload,
  TCategoryResponse,
  TCategoryUpdatePayload,
} from "@/types/category.type";

// GET All Categories (Admin)
export async function fetchCategories(
  query?: Record<string, any>,
): Promise<TCategoriesResponse> {
  const response = await api.get("/api/category", { params: query });
  return response.data as TCategoriesResponse;
}

export async function fetchCategoriesTree(
  query?: Record<string, any>,
): Promise<TCategoriesResponse> {
  const response = await api.get("/api/category/tree", { params: query });
  return response.data as TCategoriesResponse;
}

// GET Single Category by ID (Admin)
export async function fetchCategory(id: string): Promise<TCategoryResponse> {
  const response = await api.get(`/api/category/${id}`);
  return response.data as TCategoryResponse;
}

// POST Create Category (Admin)
export async function createCategory(
  payload: TCategoryCreatePayload,
): Promise<TCategoryResponse> {
  const response = await api.post("/api/category", payload);
  return response.data as TCategoryResponse;
}

// PATCH Bulk Update Categories (Admin)
export async function updateCategories(payload: {
  ids: string[];
  status?: "active" | "inactive";
}): Promise<TCategoriesResponse> {
  const response = await api.patch("/api/category/bulk", payload);
  return response.data as TCategoriesResponse;
}

// PATCH Single Category (Admin)
export async function updateCategory(
  id: string,
  payload: Partial<TCategoryUpdatePayload>,
): Promise<TCategoryResponse> {
  const response = await api.patch(`/api/category/${id}`, payload);
  return response.data as TCategoryResponse;
}

// DELETE Bulk Permanent Delete (Admin)
export async function deleteCategoriesPermanent(payload: {
  ids: string[];
}): Promise<TCategoriesResponse> {
  const response = await api.delete("/api/category/bulk/permanent", {
    data: payload,
  });
  return response.data as TCategoriesResponse;
}

// DELETE Bulk Soft Delete (Admin)
export async function deleteCategories(payload: {
  ids: string[];
}): Promise<TCategoriesResponse> {
  const response = await api.delete("/api/category/bulk", { data: payload });
  return response.data as TCategoriesResponse;
}

// DELETE Single Permanent Delete (Admin)
export async function deleteCategoryPermanent(
  id: string,
): Promise<TCategoryResponse> {
  const response = await api.delete(`/api/category/${id}/permanent`);
  return response.data as TCategoryResponse;
}

// DELETE Single Soft Delete (Admin)
export async function deleteCategory(id: string): Promise<TCategoryResponse> {
  const response = await api.delete(`/api/category/${id}`);
  return response.data as TCategoryResponse;
}

// POST Bulk Restore Categories (Admin)
export async function restoreCategories(payload: {
  ids: string[];
}): Promise<TCategoriesResponse> {
  const response = await api.post("/api/category/bulk/restore", payload);
  return response.data as TCategoriesResponse;
}

// POST Single Restore Category (Admin)
export async function restoreCategory(id: string): Promise<TCategoryResponse> {
  const response = await api.post(`/api/category/${id}/restore`);
  return response.data as TCategoryResponse;
}
