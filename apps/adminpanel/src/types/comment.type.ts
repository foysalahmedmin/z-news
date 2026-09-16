// comment.type.ts

import type { Response } from "./response.type";

export type TCommentStatus = "pending" | "approved" | "rejected";

export type TComment = {
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
  name: string;
  email: string;
  content: string;
  status?: TCommentStatus;
  is_edited?: boolean;
  edited_at?: Date;
  is_pinned?: boolean;
  flagged_count?: number;
  is_deleted?: boolean;
  created_at: string;
  updated_at?: string;
};

export type TCreateCommentPayload = {
  news: string;
  comment?: string;
  name: string;
  email: string;
  content: string;
};

export type TUpdateSelfCommentPayload = {
  name: string;
  email: string;
  content?: string;
};

export type TUpdateCommentPayload = {
  content?: string;
  status?: TCommentStatus;
};

export type TBulkUpdateCommentPayload = {
  ids: string[];
  status?: TCommentStatus;
};

export type TCommentResponse = Response<TComment>;
export type TCommentsResponse = Response<TComment[]>;
