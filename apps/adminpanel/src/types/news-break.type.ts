import type { Response } from "./response.type";

export type TStatus =
  | "draft"
  | "pending"
  | "scheduled"
  | "published"
  | "archived";

export type TNewsBreak = {
  _id: string;
  news: string;
  status: TStatus;
  published_at?: Date;
  expired_at?: Date;
};

export type TNewsBreakResponse = Response<TNewsBreak>;
export type TNewsBreaksResponse = Response<TNewsBreak[]>;
