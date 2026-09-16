import api from "@/lib/api";
import type {
  TFileResponse,
  TFilesResponse,
  TFileStatus,
  TFileUpdatePayload,
} from "@/types/file.type";

// ========================= GET =========================

// GET All Files (Admin)
export async function fetchFiles(
  query?: Record<string, any>,
): Promise<TFilesResponse> {
  const response = await api.get("/api/file", { params: query });
  return response.data as TFilesResponse;
}

// GET Self Files
export async function fetchSelfFiles(
  query?: Record<string, any>,
): Promise<TFilesResponse> {
  const response = await api.get("/api/file/self", { params: query });
  return response.data as TFilesResponse;
}

// GET Single File (Admin)
export async function fetchFile(id: string): Promise<TFileResponse> {
  const response = await api.get(`/api/file/${id}`);
  return response.data as TFileResponse;
}

// ========================= POST =========================

// Create File
export async function createFile(payload: FormData): Promise<TFileResponse> {
  const response = await api.post("/api/file", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data as TFileResponse;
}

// Bulk Restore Files (Admin)
export async function restoreFiles(payload: {
  ids: string[];
}): Promise<TFilesResponse> {
  const response = await api.post("/api/file/bulk/restore", payload);
  return response.data as TFilesResponse;
}

// Restore Single File (Admin)
export async function restoreFile(id: string): Promise<TFileResponse> {
  const response = await api.post(`/api/file/${id}/restore`);
  return response.data as TFileResponse;
}

// ========================= PATCH =========================

// Update Bulk Files (Admin)
export async function updateFiles(payload: {
  ids: string[];
  status?: TFileStatus;
}): Promise<TFilesResponse> {
  const response = await api.patch("/api/file/bulk", payload);
  return response.data as TFilesResponse;
}

// Update Single File (Admin)
export async function updateFile(
  id: string,
  payload: TFileUpdatePayload,
): Promise<TFileResponse> {
  const response = await api.patch(`/api/file/${id}`, payload);
  return response.data as TFileResponse;
}

// ========================= DELETE =========================

// Bulk Delete Files (Admin)
export async function deleteFiles(payload: {
  ids: string[];
}): Promise<TFilesResponse> {
  const response = await api.delete("/api/file/bulk", {
    data: payload,
  });
  return response.data as TFilesResponse;
}

// Bulk Permanent Delete Files (Admin)
export async function deleteFilesPermanent(payload: {
  ids: string[];
}): Promise<TFilesResponse> {
  const response = await api.delete("/api/file/bulk/permanent", {
    data: payload,
  });
  return response.data as TFilesResponse;
}

// Delete Single File (Admin)
export async function deleteFile(id: string): Promise<TFileResponse> {
  const response = await api.delete(`/api/file/${id}`);
  return response.data as TFileResponse;
}

// Delete Single Permanent File (Admin)
export async function deleteFilePermanent(id: string): Promise<TFileResponse> {
  const response = await api.delete(`/api/file/${id}/permanent`);
  return response.data as TFileResponse;
}
