import type { Response } from "./response.type";

// GET /api/view/analytics/top
// Backend: ViewServices.getTopViewedNews (apps/backend/src/modules/view/view.service.ts)
export type TTopViewedNewsItem = {
  _id: string;
  title: string;
  slug: string;
  status: string;
  view_count: number;
};

// GET /api/view/analytics/trends
// Backend: ViewServices.getViewTrends (apps/backend/src/modules/view/view.service.ts)
export type TViewTrendItem = {
  date: string;
  count: number;
};

// GET /api/view/analytics/total
// Backend: ViewServices.getTotalViewCount (apps/backend/src/modules/view/view.service.ts)
export type TTotalViewCount = {
  total: number;
};

export type TTopViewedNewsResponse = Response<TTopViewedNewsItem[]>;
export type TViewTrendsResponse = Response<TViewTrendItem[]>;
export type TTotalViewCountResponse = Response<TTotalViewCount>;
