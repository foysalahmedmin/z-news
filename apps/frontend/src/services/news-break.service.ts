import { ENV } from "@/config";
import { getInternalHeaders } from "@/lib/api";
import {
  TBulkNewsBreakResponse,
  TNewsBreakResponse,
} from "@/types/news-break.type";

// 5 min + on-demand expiry (app/api/revalidate). Items embed their news.
const BREAK_CACHE = { revalidate: 300, tags: ["breaks", "news"] };

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
    headers: getInternalHeaders(),
    next: BREAK_CACHE,
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
    headers: getInternalHeaders(),
    next: BREAK_CACHE,
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
