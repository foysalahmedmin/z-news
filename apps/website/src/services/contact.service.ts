import { ENV } from "@/config";
import api from "@/lib/api";
import type { TContactPayload, TContactResponse } from "@/types/contact.type";

export const submitContact = async (
  payload: TContactPayload,
): Promise<TContactResponse> => {
  const url = `${ENV.api_url}/api/contact`;

  const response = await api.post<TContactResponse>(url, payload);

  if (!response.data.success) {
    console.error(response.data.message || "Failed to submit contact form");
  }

  return response.data;
};
