import type { Response } from "./response.type";

export type TBookmark = {
  _id: string;
  user: string;
  news: string;
  reading_list?: string;
  notes?: string;
  is_read: boolean;
  read_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type TBookmarkResponse = Response<TBookmark>;
export type TBookmarksResponse = Response<TBookmark[]>;
