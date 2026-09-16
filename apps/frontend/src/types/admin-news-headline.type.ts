import type { Response } from "./response.type";

export type TStatus =
  | "draft"
  | "pending"
  | "scheduled"
  | "published"
  | "archived";

export type TNewsHeadline = {
  _id: string;
  news: string;
  status: TStatus;
  published_at?: Date;
  expired_at?: Date;
};

export type TNewsHeadlineResponse = Response<TNewsHeadline>;
export type TNewsHeadlinesResponse = Response<TNewsHeadline[]>;
