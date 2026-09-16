import api from "@/lib/api";
import type {
  TNotificationRecipientReadAllResponse,
  TNotificationRecipientResponse,
  TNotificationRecipientsResponse,
} from "@/types/notification-recipient";

export async function fetchNotificationRecipientsBySelf(query?: {
  page?: number;
  limit?: number;
  is_read?: boolean;
  is_count_only?: boolean;
}): Promise<TNotificationRecipientsResponse> {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const url = `/api/notification-recipient/bulk/self?${params.toString()}`;
  const response = await api.get(url);

  return response.data;
}

export async function fetchNotificationRecipientBySelf(
  _id: string,
): Promise<TNotificationRecipientResponse> {
  const url = `/api/notification-recipient/${_id}/self`;
  const response = await api.get(url);

  return response.data;
}

export async function updateNotificationRecipientBySelf(
  _id: string,
  payload: { is_read?: boolean },
): Promise<TNotificationRecipientResponse> {
  const url = `/api/notification-recipient/${_id}/self`;
  const response = await api.patch(url, payload);

  return response.data;
}

export async function readAllNotificationRecipientBySelf(): Promise<TNotificationRecipientReadAllResponse> {
  const url = `/api/notification-recipient/read-all/self`;
  const response = await api.patch(url);

  return response.data;
}

export async function deleteNotificationRecipientBySelf(
  id: string,
): Promise<TNotificationRecipientResponse> {
  const response = await api.delete(`/api/notification-recipient/${id}/self`);
  return response.data;
}
