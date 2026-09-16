import { Response } from "./response.type";

export type TStatus = "pending" | "approved" | "rejected" | "flagged";

export type TComment = {
  _id: string;
  news: string;
  parent_comment?: string | TComment; // For threading support
  reply_to_user?: {
    _id: string;
    name: string;
  };
  thread_level: number;
  user?: {
    _id: string;
    name?: string;
    email?: string;
    image?: string;
  };
  guest?: string;
  name: string;
  email: string;
  content: string;
  status?: TStatus;
  is_pinned?: boolean;
  is_edited?: boolean;
  edited_at?: Date;
  is_deleted?: boolean;
  created_at: string;
  updated_at: string;
  replies?: TComment[];
  reply_count?: number;
  reaction_counts?: {
    like: number;
    dislike: number;
    insightful: number;
    funny: number;
    disagree: number;
    total: number;
  };
};

export type TCommentResponse = Response<TComment>;
export type TCommentsResponse = Response<TComment[]>;
