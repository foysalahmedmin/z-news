import api from "@/lib/api";
import { Response } from "@/types/response.type";

export type TTemplate = {
  _id: string;
  name: string;
  description?: string;
  category?: { _id: string; name: string };
  structure: any;
  default_fields?: any;
  is_active: boolean;
  created_at: string;
};

export async function fetchTemplates(
  query?: Record<string, any>,
): Promise<Response<TTemplate[]>> {
  const response = await api.get("/api/template", { params: query });
  return response.data;
}

export async function fetchTemplate(id: string): Promise<Response<TTemplate>> {
  const response = await api.get(`/api/template/${id}`);
  return response.data;
}

export async function createTemplate(
  payload: any,
): Promise<Response<TTemplate>> {
  const response = await api.post("/api/template", payload);
  return response.data;
}

export async function updateTemplate(
  id: string,
  payload: any,
): Promise<Response<TTemplate>> {
  const response = await api.patch(`/api/template/${id}`, payload);
  return response.data;
}

export async function deleteTemplate(id: string): Promise<Response<TTemplate>> {
  const response = await api.delete(`/api/template/${id}`);
  return response.data;
}
