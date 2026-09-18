import type { Response } from "./response.type";

// Mirrors apps/backend/src/modules/poll/poll.type.ts + poll.model.ts virtuals.
// Note: the model's toJSON override strips `voters` from each option before
// it ever reaches the client, so TPollOption only ever has {text, votes}.

export type TPollOption = {
  text: string;
  votes: number;
};

export type TPollResult = {
  text: string;
  votes: number;
  percentage: number | string;
};

export type TPollStatus = "inactive" | "scheduled" | "ended" | "active";

export type TPollCreatedBy = {
  _id: string;
  name?: string;
  email?: string;
};

export type TPollCategory = {
  _id: string;
  name?: string;
};

export type TPollNews = {
  _id: string;
  title?: string;
  slug?: string;
};

export type TPoll = {
  _id: string;
  news?: TPollNews | string | null;
  created_by: TPollCreatedBy | string;
  title: string;
  description?: string;
  options: TPollOption[];

  // Poll Settings
  allow_multiple_votes: boolean;
  max_votes: number;
  allow_anonymous: boolean;
  show_results_before_vote: boolean;
  randomize_options: boolean;

  // Timing
  start_date?: string;
  end_date?: string;
  is_active: boolean;

  // Tracking
  total_votes: number;
  unique_voters: number;

  // Metadata
  tags: string[];
  category?: TPollCategory | string | null;
  is_featured: boolean;

  // Virtuals
  status: TPollStatus;
  results: TPollResult[];

  // Only present on GET /:pollId, and only when the requester is
  // authenticated (see PollService.getPollById on the backend).
  has_voted?: boolean;

  created_at?: string;
  updated_at?: string;
};

export type TPollResults = {
  title: string;
  total_votes: number;
  unique_voters: number;
  results: TPollResult[];
  status: TPollStatus;
};

export type TCreatePollPayload = {
  news?: string;
  title: string;
  description?: string;
  options: { text: string }[];
  allow_multiple_votes?: boolean;
  max_votes?: number;
  allow_anonymous?: boolean;
  show_results_before_vote?: boolean;
  randomize_options?: boolean;
  start_date?: string;
  end_date?: string;
  tags?: string[];
  category?: string;
  is_featured?: boolean;
};

// Matches PollValidation.updatePollSchema exactly -- notably `options` and
// `start_date` are NOT accepted on update (only on create), so they're
// intentionally left out here rather than merely "discouraged".
export type TUpdatePollPayload = {
  title?: string;
  description?: string;
  allow_multiple_votes?: boolean;
  max_votes?: number;
  allow_anonymous?: boolean;
  show_results_before_vote?: boolean;
  randomize_options?: boolean;
  end_date?: string;
  is_active?: boolean;
  tags?: string[];
  category?: string;
  is_featured?: boolean;
};

export type TVotePollPayload = {
  option_indices: number[];
  // Required for anonymous votes -- the vote endpoint does NOT derive guest
  // identity from the `guest_token` cookie/req.guest server-side (unlike
  // reaction/view/comment), it only reads `guest_id` from the request body.
  guest_id?: string;
};

export type TPollResponse = Response<TPoll>;
export type TPollsResponse = Response<TPoll[]>;
export type TPollResultsResponse = Response<TPollResults>;
