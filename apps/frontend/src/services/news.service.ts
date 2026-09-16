import { ENV } from "@/config";
import { TBulkNewsResponse, TNewsResponse } from "@/types/news.type";

export const fetchNews = async (
  slug: string,
  query?: Record<string, any>,
): Promise<TNewsResponse> => {
  try {
    const queryString = query
      ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
      : "";

    const url = `${ENV.api_url}/api/news/${slug}/public${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      next: { revalidate: 60 * 0.5 },
    });

    if (!response.ok) {
      return {
        data: null,
        message: "Failed to fetch news",
        success: false,
      } as any;
    }

    return response.json() as Promise<TNewsResponse>;
  } catch (error) {
    return {
      data: null,
      message: "Failed to fetch news",
      success: false,
    } as any;
  }
};

export const fetchBulkNews = async (
  query?: Record<string, any>,
): Promise<TBulkNewsResponse> => {
  try {
    const queryString = query
      ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
      : "";

    const url = `${ENV.api_url}/api/news/public${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      next: { revalidate: 60 * 0.25 },
    });

    if (!response.ok) {
      return {
        data: [],
        message: "Failed to fetch all news",
        success: false,
      } as any;
    }

    return response.json() as Promise<TBulkNewsResponse>;
  } catch (error) {
    return {
      data: [],
      message: "Failed to fetch all news",
      success: false,
    } as any;
  }
};
