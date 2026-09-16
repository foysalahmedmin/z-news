import type { Response } from "./response.type";
import type { TUser } from "./user.type";

export type TStatus = "active" | "inactive" | "archived";
export type TPriority = "low" | "medium" | "high" | "urgent";
export type TChannel = "web" | "push" | "email";
export type TType =
  | "news-request"
  | "news-request-approval"
  | "news-headline-request"
  | "news-headline-request-approval"
  | "news-break-request"
  | "news-break-request-approval"
  | "reaction"
  | "comment"
  | "reply";

export type TNotification = {
  _id: string;
  title: string;
  message: string;
  type: TType;
  priority?: TPriority;
  channels: TChannel[];
  sender: TUser;
  status?: TStatus;
  expires_at?: Date;
  created_at: string;
};

export type TNotificationResponse = Response<TNotification>;
export type TNotificationsResponse = Response<TNotification[]>;
