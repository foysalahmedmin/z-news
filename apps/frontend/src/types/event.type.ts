import type { Response } from "./response.type";

export type TStatus = "active" | "inactive";

export type TEvent = {
  _id: string;
  category?: string;
  icon?: string;
  thumbnail?: string;
  name: string;
  slug: string;
  description?: string;
  sequence: number;
  is_featured?: boolean;
  status: TStatus;
  layout?: "default" | "standard" | "featured" | "minimal";
};

export type TEventUpdatePayload = {
  category?: string;
  icon?: string;
  name?: string;
  slug?: string;
  sequence?: number;
  status?: TStatus;
};

export type TEventResponse = Response<TEvent>;
export type TEventsResponse = Response<TEvent[]>;
