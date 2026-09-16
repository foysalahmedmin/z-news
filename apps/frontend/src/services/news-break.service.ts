import { ENV } from "@/config";
import {
  TBulkNewsBreakResponse,
  TNewsBreakResponse,
} from "@/types/news-break.type";

export const fetchNewsBreak = async (
  id: string,
  query?: Record<string, any>,
): Promise<TNewsBreakResponse> => {
  const queryString = query
    ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
    : "";

  const url = `${ENV.api_url}/api/news-break/${id}/public${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    next: { revalidate: 60 * 0.5 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch news break");
  }

  return response.json() as Promise<TNewsBreakResponse>;
};

export const fetchBulkNewsBreaks = async (
  query?: Record<string, any>,
): Promise<TBulkNewsBreakResponse> => {
  const queryString = query
    ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
    : "";

  const url = `${ENV.api_url}/api/news-break/public${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    next: { revalidate: 60 * 0.25 },
  });

  if (!response.ok) {
    return {
      data: [],
      message: "Failed to fetch news breaks",
      success: false,
    };
  }

  return response.json() as Promise<TBulkNewsBreakResponse>;
};
