import type { Response } from "./response.type";

export type TStatus = "draft" | "pending" | "published" | "archived";

export type TNewsBreak = {
  _id: string;
  sequence: number;
  news: {
    _id: string;
    title: string;
    slug: string;
  };
  status: TStatus;
  published_at?: Date;
  expired_at?: Date;
};

export type TNewsBreakResponse = Response<TNewsBreak>;
export type TBulkNewsBreakResponse = Response<TNewsBreak[]>;

