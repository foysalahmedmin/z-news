import api from "@/lib/admin-api";
import type {
  TCreateNotificationPayload,
  TNotificationResponse,
  TNotificationsResponse,
  TUpdateNotificationPayload,
} from "@/types/admin-notification.type";

// Admin CRUD for the admin-authored `Notification` module (/api/notification)
// — distinct from notification-recipient.service (the per-user inbox).
// Conventions mirrored 1:1 from admin-event.service.ts.

// GET All Notifications (Admin)
export async function fetchNotifications(
  query?: Record<string, any>,
): Promise<TNotificationsResponse> {
  const response = await api.get("/api/notification", { params: query });
  return response.data as TNotificationsResponse;
}

// GET Single Notification by ID (Admin)
export async function fetchNotification(
  id: string,
): Promise<TNotificationResponse> {
  const response = await api.get(`/api/notification/${id}`);
  return response.data as TNotificationResponse;
}

// POST Create Notification (Admin)
export async function createNotification(
  payload: TCreateNotificationPayload,
): Promise<TNotificationResponse> {
  const response = await api.post("/api/notification", payload);
  return response.data as TNotificationResponse;
}

// PATCH Bulk Update Notifications (Admin)
export async function updateNotifications(payload: {
  ids: string[];
  status?: "active" | "inactive" | "archived";
}): Promise<TNotificationsResponse> {
  const response = await api.patch("/api/notification/bulk", payload);
  return response.data as TNotificationsResponse;
}

// PATCH Single Notification (Admin)
export async function updateNotification(
  id: string,
  payload: TUpdateNotificationPayload,
): Promise<TNotificationResponse> {
  const response = await api.patch(`/api/notification/${id}`, payload);
  return response.data as TNotificationResponse;
}

// DELETE Bulk Permanent Delete (Admin)
export async function deleteNotificationsPermanent(payload: {
  ids: string[];
}): Promise<TNotificationsResponse> {
  const response = await api.delete("/api/notification/bulk/permanent", {
    data: payload,
  });
  return response.data as TNotificationsResponse;
}

// DELETE Bulk Soft Delete (Admin)
export async function deleteNotifications(payload: {
  ids: string[];
}): Promise<TNotificationsResponse> {
  const response = await api.delete("/api/notification/bulk", {
    data: payload,
  });
  return response.data as TNotificationsResponse;
}

// DELETE Single Permanent Delete (Admin)
export async function deleteNotificationPermanent(
  id: string,
): Promise<TNotificationResponse> {
  const response = await api.delete(`/api/notification/${id}/permanent`);
  return response.data as TNotificationResponse;
}

// DELETE Single Soft Delete (Admin)
export async function deleteNotification(
  id: string,
): Promise<TNotificationResponse> {
  const response = await api.delete(`/api/notification/${id}`);
  return response.data as TNotificationResponse;
}

// POST Bulk Restore Notifications (Admin)
export async function restoreNotifications(payload: {
  ids: string[];
}): Promise<TNotificationsResponse> {
  const response = await api.post("/api/notification/bulk/restore", payload);
  return response.data as TNotificationsResponse;
}

// POST Single Restore Notification (Admin)
export async function restoreNotification(
  id: string,
): Promise<TNotificationResponse> {
  const response = await api.post(`/api/notification/${id}/restore`);
  return response.data as TNotificationResponse;
}
