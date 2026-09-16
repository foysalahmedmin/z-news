import { ENV } from "@/config";
import { Response } from "@/types/response.type";

export const fetchNewsView = async (
  news_id?: string,
  query?: Record<string, any>,
): Promise<Response<null>> => {
  if (!news_id) {
    console.error("news_id is required");
  }

  const queryString = query
    ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
    : "";

  const url = `${ENV.api_url}/api/view/news/${news_id}/self${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-cache",
    credentials: "include",
  });

  if (!response.ok) {
    return {
      data: null,
      message: "Failed to fetch news",
      success: false,
    };
  }

  return response.json() as Promise<Response<null>>;
};
