import type { Response } from "./response.type";

export type TStatus = "active" | "inactive";

export type TEvent = {
  _id: string;
  category?: {
    _id: string;
    name: string;
  };
  icon?: string;
  thumbnail?: string;
  name: string;
  slug: string;
  description?: string;
  is_featured?: boolean;
  status: TStatus;
  layout?: "default" | "standard" | "featured" | "minimal";
  published_at?: string;
  expire_at?: string;
};

export type TEventCreatePayload = {
  category?: string;
  icon?: string;
  thumbnail?: string;
  name: string;
  slug: string;
  description?: string;
  is_featured?: boolean;
  status: TStatus;
  layout?: "default" | "standard" | "featured" | "minimal";
  published_at?: string;
  expire_at?: string;
};

export type TEventUpdatePayload = {
  category?: string;
  icon?: string;
  name?: string;
  slug?: string;
  description?: string;
  is_featured?: boolean;
  status?: TStatus;
  layout?: "default" | "standard" | "featured" | "minimal";
  published_at?: string;
  expire_at?: string;
};

export type TEventResponse = Response<TEvent>;
export type TEventsResponse = Response<TEvent[]>;
