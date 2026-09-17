import api from "@/lib/admin-api";
import type {
  TTopViewedNewsResponse,
  TTotalViewCountResponse,
  TViewTrendsResponse,
} from "@/types/admin-view.type";

// GET Top Viewed News (Admin) — /api/view/analytics/top
export async function fetchTopViewedNews(
  query?: Record<string, any>,
): Promise<TTopViewedNewsResponse> {
  const response = await api.get("/api/view/analytics/top", {
    params: query,
  });
  return response.data as TTopViewedNewsResponse;
}

// GET View Trends (Admin) — /api/view/analytics/trends
export async function fetchViewTrends(
  query?: Record<string, any>,
): Promise<TViewTrendsResponse> {
  const response = await api.get("/api/view/analytics/trends", {
    params: query,
  });
  return response.data as TViewTrendsResponse;
}

// GET Total View Count (Admin) — /api/view/analytics/total
export async function fetchTotalViewCount(
  query?: Record<string, any>,
): Promise<TTotalViewCountResponse> {
  const response = await api.get("/api/view/analytics/total", {
    params: query,
  });
  return response.data as TTotalViewCountResponse;
}
