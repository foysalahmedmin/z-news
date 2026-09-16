import type { Response } from "./response.type";

export type TReactionType =
  | "like"
  | "dislike"
  | "insightful"
  | "funny"
  | "disagree";
export type TReactionStatus = "pending" | "approved" | "rejected";

export type TReaction = {
  _id: string;
  news: {
    _id: string;
    slug: string;
    title: string;
    thumbnail?: string;
  };
  // user?: {
  //   _id: string;
  //   name: string;
  //   email: string;
  //   image?: string;
  // };
  type: TReactionType;
  status?: TReactionStatus;
  created_at: string;
  updated_at?: string;
};

export type TCreateReactionPayload = {
  news: string;
  type: TReactionType;
};

export type TUpdateSelfReactionPayload = {
  type: TReactionType;
};

export type TUpdateReactionPayload = {
  type?: TReactionType;
  status?: TReactionStatus;
};

export type TBulkUpdateReactionPayload = {
  ids: string[];
  status?: TReactionStatus;
};

export type TReactionResponse = Response<TReaction>;
export type TReactionsResponse = Response<TReaction[]>;
