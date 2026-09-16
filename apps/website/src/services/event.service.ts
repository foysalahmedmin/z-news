import { ENV } from "@/config";
import { TEventResponse, TEventsResponse } from "@/types/event.type";

export async function fetchEvent(
  slug: string,
  query?: Record<string, any>,
): Promise<TEventResponse> {
  try {
    const queryString = query
      ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
      : "";

    const url = `${ENV.api_url}/api/event/${slug}/public${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      next: { revalidate: 60 * 0.25 },
    });

    if (!response.ok) {
      return {
        data: null,
        message: "Failed to fetch event",
        success: false,
      } as any;
    }

    return response.json() as Promise<TEventResponse>;
  } catch (error) {
    return {
      data: null,
      message: "Failed to fetch event",
      success: false,
    } as any;
  }
}

export async function fetchEvents(
  query?: Record<string, any>,
): Promise<TEventsResponse> {
  try {
    const queryString = query
      ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
      : "";

    const url = `${ENV.api_url}/api/event/public${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      next: { revalidate: 60 * 0.25 },
    });

    if (!response.ok) {
      return { data: [], message: "Failed to fetch events", success: false };
    }

    return response.json() as Promise<TEventsResponse>;
  } catch (error) {
    return { data: [], message: "Failed to fetch events", success: false };
  }
}
