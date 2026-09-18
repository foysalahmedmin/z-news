import adminApi from "@/lib/admin-api";
import api from "@/lib/api";
import type {
  TAdminDashboardResponse,
  TEditorialDashboardResponse,
  TReaderDashboardResponse,
} from "@/types/dashboard.type";

// GET Admin Dashboard (Admin, Super-Admin)
export async function fetchAdminDashboard(): Promise<TAdminDashboardResponse> {
  const response = await adminApi.get("/api/dashboard/admin");
  return response.data as TAdminDashboardResponse;
}

// GET Editorial Dashboard (Admin, Super-Admin, Editor, Author, Contributor)
export async function fetchEditorialDashboard(): Promise<TEditorialDashboardResponse> {
  const response = await adminApi.get("/api/dashboard/editorial");
  return response.data as TEditorialDashboardResponse;
}

// GET Reader Dashboard (all authenticated roles)
export async function fetchReaderDashboard(): Promise<TReaderDashboardResponse> {
  const response = await api.get("/api/dashboard/reader");
  return response.data as TReaderDashboardResponse;
}
