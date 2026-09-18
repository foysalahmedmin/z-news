import type { Response } from "./response.type";

export type TStatus =
  | "draft"
  | "pending"
  | "scheduled"
  | "published"
  | "archived";

// The news-headline backend only ever accepts/produces these 4 statuses
// (see apps/backend's news-headline.enum.ts / .validator.ts) — "scheduled"
// exists on `TStatus` above only for shape-parity with News's own TStatus,
// but is rejected with a 400 by this module's validators, so it must never
// be offered as a selectable option in News Headline forms.
export type TNewsHeadlineStatus = Exclude<TStatus, "scheduled">;

export const NEWS_HEADLINE_STATUS_OPTIONS: TNewsHeadlineStatus[] = [
  "draft",
  "pending",
  "published",
  "archived",
];

export type TNewsHeadline = {
  _id: string;
  // The list/detail endpoints populate `news` with `{_id, title, slug}`
  // (see apps/backend's news-headline.repository.ts `.populate([{ path:
  // 'news', select: '_id title slug' }])`); it's only a bare ObjectId
  // string in create/update payloads.
  news:
    | string
    | {
        _id: string;
        title: string;
        slug?: string;
      };
  status: TStatus;
  published_at?: Date;
  expired_at?: Date;
};

export type TNewsHeadlineResponse = Response<TNewsHeadline>;
export type TNewsHeadlinesResponse = Response<TNewsHeadline[]>;
