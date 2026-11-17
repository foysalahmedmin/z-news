import { ENV } from "@/config";
import { getInternalHeaders } from "@/lib/api";
import { TEventResponse, TEventsResponse } from "@/types/event.type";

// 5 min + on-demand expiry via the "events" tag (app/api/revalidate).
const EVENT_CACHE = { revalidate: 300, tags: ["events"] };

// 404 -> { data: null } (page calls notFound()); other failures throw so ISR
// keeps the last good page.
export async function fetchEvent(
  slug: string,
  query?: Record<string, any>,
): Promise<TEventResponse> {
  const queryString = query
    ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
    : "";

  const url = `${ENV.api_url}/api/event/${encodeURIComponent(slug)}/public${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getInternalHeaders(),
    next: EVENT_CACHE,
  });

  if (response.status === 404) {
    return { data: null, message: "Event not found", success: false } as any;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch event "${slug}": ${response.status}`);
  }

  return response.json() as Promise<TEventResponse>;
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
    headers: getInternalHeaders(),
    next: EVENT_CACHE,
  });

    if (!response.ok) {
      return { data: [], message: "Failed to fetch events", success: false };
    }

    return response.json() as Promise<TEventsResponse>;
  } catch (error) {
    return { data: [], message: "Failed to fetch events", success: false };
  }
}
