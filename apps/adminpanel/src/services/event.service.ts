import api from "@/lib/api";
import type {
  TEventCreatePayload,
  TEventResponse,
  TEventsResponse,
  TEventUpdatePayload,
} from "@/types/event.type";

// GET All Events (Admin)
export async function fetchEvents(
  query?: Record<string, any>,
): Promise<TEventsResponse> {
  const response = await api.get("/api/event", { params: query });
  return response.data as TEventsResponse;
}

// GET Single Event by ID (Admin)
export async function fetchEvent(id: string): Promise<TEventResponse> {
  const response = await api.get(`/api/event/${id}`);
  return response.data as TEventResponse;
}

// POST Create Event (Admin)
export async function createEvent(
  payload: TEventCreatePayload,
): Promise<TEventResponse> {
  const response = await api.post("/api/event", payload);
  return response.data as TEventResponse;
}

// PATCH Bulk Update Events (Admin)
export async function updateEvents(payload: {
  ids: string[];
  status?: "active" | "inactive";
}): Promise<TEventsResponse> {
  const response = await api.patch("/api/event/bulk", payload);
  return response.data as TEventsResponse;
}

// PATCH Single Event (Admin)
export async function updateEvent(
  id: string,
  payload: Partial<TEventUpdatePayload>,
): Promise<TEventResponse> {
  const response = await api.patch(`/api/event/${id}`, payload);
  return response.data as TEventResponse;
}

// DELETE Bulk Permanent Delete (Admin)
export async function deleteEventsPermanent(payload: {
  ids: string[];
}): Promise<TEventsResponse> {
  const response = await api.delete("/api/event/bulk/permanent", {
    data: payload,
  });
  return response.data as TEventsResponse;
}

// DELETE Bulk Soft Delete (Admin)
export async function deleteEvents(payload: {
  ids: string[];
}): Promise<TEventsResponse> {
  const response = await api.delete("/api/event/bulk", { data: payload });
  return response.data as TEventsResponse;
}

// DELETE Single Permanent Delete (Admin)
export async function deleteEventPermanent(
  id: string,
): Promise<TEventResponse> {
  const response = await api.delete(`/api/event/${id}/permanent`);
  return response.data as TEventResponse;
}

// DELETE Single Soft Delete (Admin)
export async function deleteEvent(id: string): Promise<TEventResponse> {
  const response = await api.delete(`/api/event/${id}`);
  return response.data as TEventResponse;
}

// POST Bulk Restore Events (Admin)
export async function restoreEvents(payload: {
  ids: string[];
}): Promise<TEventsResponse> {
  const response = await api.post("/api/event/bulk/restore", payload);
  return response.data as TEventsResponse;
}

// POST Single Restore Event (Admin)
export async function restoreEvent(id: string): Promise<TEventResponse> {
  const response = await api.post(`/api/event/${id}/restore`);
  return response.data as TEventResponse;
}
