import { ENV } from "@/config";
import { TBulkNewsResponse, TNewsResponse } from "@/types/news.type";

// Public data is cached for 5 min and also expired on demand by the backend
// through POST /api/revalidate (see app/api/revalidate/route.ts) using these
// tags. News embeds its category/event, so those tags expire it too.
const NEWS_CACHE = {
  revalidate: 300,
  tags: ["news", "categories", "events"],
};

// 404 -> { data: null } so the page can call notFound(). Any other failure
// throws, so ISR keeps serving the last good page instead of caching an error.
export const fetchNews = async (
  slug: string,
  query?: Record<string, any>,
): Promise<TNewsResponse> => {
  const queryString = query
    ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
    : "";

  const url = `${ENV.api_url}/api/news/${encodeURIComponent(slug)}/public${queryString}`;

  const response = await fetch(url, { method: "GET", next: NEWS_CACHE });

  if (response.status === 404) {
    return { data: null, message: "News not found", success: false } as any;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch news "${slug}": ${response.status}`);
  }

  return response.json() as Promise<TNewsResponse>;
};

export const fetchBulkNews = async (
  query?: Record<string, any>,
): Promise<TBulkNewsResponse> => {
  try {
    const queryString = query
      ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
      : "";

    const url = `${ENV.api_url}/api/news/public${queryString}`;

    const response = await fetch(url, { method: "GET", next: NEWS_CACHE });

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
