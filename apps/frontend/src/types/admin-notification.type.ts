import type { TRole } from "./admin-user.type";
import type { Response } from "./response.type";

// Admin-authored broadcast notification (`Notification` model, /api/notification).
// Distinct from the per-user inbox feed (`notification-recipient`, already
// covered by the existing /admin/notifications page + admin-notification
// -recipient types/services elsewhere) — this is the source record an admin
// composes and broadcasts, not a per-user delivery record.
//
// `type` enum values mirror apps/backend/src/modules/notification's
// notification.model.ts / notification.validator.ts exactly (note: those two
// files use the "-approval" suffix, while notification.enum.ts /
// notification.type.ts elsewhere in the backend use "-response" instead —
// the model/validator pair is what's actually enforced at the DB + request
// layer, so that's what's mirrored here).
export type TNotificationType =
  | "news-request"
  | "news-request-approval"
  | "news-headline-request"
  | "news-headline-request-approval"
  | "news-break-request"
  | "news-break-request-approval"
  | "reaction"
  | "comment"
  | "reply";

export type TNotificationPriority = "low" | "medium" | "high" | "urgent";
export type TNotificationChannel = "web" | "push" | "email";
export type TNotificationStatus = "active" | "inactive" | "archived";

export type TNotificationAudience = {
  roles?: TRole[];
  user_ids?: string[];
};

export type TNotification = {
  _id: string;
  title: string;
  message: string;
  type: TNotificationType;
  priority?: TNotificationPriority;
  channels: TNotificationChannel[];
  sender: string;
  expires_at?: string;
  status?: TNotificationStatus;
  created_at?: string;
};

// `sender` is required by the backend's createNotificationValidationSchema
// (idSchema, not optional) even though it's never a form field — the
// composer page fills it in from the signed-in admin (useUser()'s
// `user.info._id`) before calling createNotification.
export type TCreateNotificationPayload = {
  title: string;
  message: string;
  type: TNotificationType;
  priority?: TNotificationPriority;
  channels: TNotificationChannel[];
  sender: string;
  expires_at?: string;
  status?: TNotificationStatus;
  audience?: TNotificationAudience;
};

export type TUpdateNotificationPayload = Partial<
  Pick<
    TCreateNotificationPayload,
    "title" | "message" | "type" | "priority" | "channels" | "expires_at" | "status"
  >
>;

export type TNotificationResponse = Response<TNotification>;
export type TNotificationsResponse = Response<TNotification[]>;
