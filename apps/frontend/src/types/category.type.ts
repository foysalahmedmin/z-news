import type { Response } from "./response.type";

export type TStatus = "active" | "inactive";

export type TCategory = {
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
  children?: TCategory[];
};

export type TCategoryUpdatePayload = {
  category?: string;
  icon?: string;
  name?: string;
  slug?: string;
  sequence?: number;
  status?: TStatus;
};

export type TCategoryResponse = Response<TCategory>;
export type TCategoriesResponse = Response<TCategory[]>;
