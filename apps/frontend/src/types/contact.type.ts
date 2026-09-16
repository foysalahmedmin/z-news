import type { Response } from "./response.type";

export type TContact = {
  _id: string;
  name: string;
  email: string;
  message: string;
  status?: "pending" | "read" | "replied" | "archived";
  created_at: string;
  updated_at?: string;
};

export type TContactPayload = {
  name: string;
  email: string;
  message: string;
};

export type TContactResponse = Response<TContact>;

