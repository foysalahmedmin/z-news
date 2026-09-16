import { ENV } from "@/config";
import {
  TBulkNewsHeadlineResponse,
  TNewsHeadlineResponse,
} from "@/types/news-headline.type";

export const fetchNewsHeadline = async (
  id: string,
  query?: Record<string, any>,
): Promise<TNewsHeadlineResponse> => {
  const queryString = query
    ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
    : "";

  const url = `${ENV.api_url}/api/news-headline/${id}/public${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    next: { revalidate: 60 * 0.5 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch news headline");
  }

  return response.json() as Promise<TNewsHeadlineResponse>;
};

export const fetchBulkNewsHeadlines = async (
  query?: Record<string, any>,
): Promise<TBulkNewsHeadlineResponse> => {
  const queryString = query
    ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
    : "";

  const url = `${ENV.api_url}/api/news-headline/public${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    next: { revalidate: 60 * 0.25 },
  });

  if (!response.ok) {
    return {
      data: [],
      message: "Failed to fetch news headlines",
      success: false,
    };
  }

  return response.json() as Promise<TBulkNewsHeadlineResponse>;
};
