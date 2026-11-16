import { ENV } from "@/config";
import { getAuthHeaders } from "@/lib/api";
import { Response } from "@/types/response.type";

// Records one view of the article (as the signed-in user, or as the guest
// identified by the API's guest cookie) and returns the view count in meta.
export const recordNewsView = async (
  news_id: string,
): Promise<Response<null>> => {
  const url = `${ENV.api_url}/api/view/news/${news_id}/self`;

  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return {
      data: null,
      message: "Failed to record view",
      success: false,
    };
  }

  return response.json() as Promise<Response<null>>;
};
