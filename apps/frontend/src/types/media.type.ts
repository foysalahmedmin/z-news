import type { Response } from "./response.type";

// Mirrors apps/backend/src/modules/media/media.type.ts + media.enum.ts.
// Media is a curated/tagged POINTER to an already-uploaded File (see
// media.model.ts) — it never uploads a file itself, it references one by id.

export type TMediaType = "image" | "video" | "audio" | "document";

export type TMediaStatus = "active" | "inactive" | "archived";

// The shape MediaService.getMedia/getBulkMedia populate `file` with
// (`_id url name filename mimetype size` — see media.service.ts on the
// backend). Create/update responses return the raw (unpopulated) id instead,
// since MediaService.createMedia/updateMedia call `.toObject()` without
// populating — hence the `| string` union below.
export type TMediaFileRef = {
  _id: string;
  url: string;
  name: string;
  filename: string;
  mimetype: string;
  size: number;
};

// The shape `uploaded_by` is populated with (`_id name email image`).
export type TMediaUploadedBy = {
  _id: string;
  name: string;
  email: string;
  image?: string;
};

export type TMedia = {
  _id: string;
  title: string;
  description?: string;
  alt_text?: string;
  file: TMediaFileRef | string;
  type: TMediaType;
  url: string;
  thumbnail_url?: string;
  status: TMediaStatus;
  tags: string[];
  uploaded_by: TMediaUploadedBy | string;
  created_at: string;
  updated_at: string;
};

// POST /api/media body (media.validator.ts's createMediaValidationSchema).
// `uploaded_by` is derived server-side from the authenticated user, never
// sent by the client. `status` is NOT part of createMediaValidationSchema
// (new Media always defaults to "active" server-side — see media.model.ts)
// — it's declared here only so the admin add form can offer the same
// Status control as the edit form without a TS excess-property error; zod
// silently strips it from the request body, so sending it is a harmless
// no-op.
export type TMediaCreatePayload = {
  title: string;
  description?: string;
  alt_text?: string;
  file: string;
  type: TMediaType;
  url: string;
  thumbnail_url?: string;
  tags?: string[];
  status?: TMediaStatus;
};

// PATCH /api/media/:id body (media.validator.ts's updateMediaValidationSchema).
// Note `file`, `type` and `url` are intentionally NOT updatable — once a
// Media record is created, it stays pinned to its source File.
export type TMediaUpdatePayload = {
  title?: string;
  description?: string;
  alt_text?: string;
  thumbnail_url?: string;
  status?: TMediaStatus;
  tags?: string[];
};

export type TMediaResponse = Response<TMedia>;
export type TMediaListResponse = Response<TMedia[]>;
