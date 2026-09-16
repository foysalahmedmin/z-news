import type { TNotification } from "./notification";
import type { Response } from "./response.type";

export type TNotificationAction = {
  title: string;
  type: string;
  url: string;
};

export type TNotificationMetadata = {
  url?: string;
  image?: string;
  source?: string;
  reference?: string;
  actions: TNotificationAction[];
};

export type TNotificationRecipient = {
  _id: string;
  notification: TNotification;
  metadata?: TNotificationMetadata;
  is_read: boolean;
  read_at?: Date | null;
  created_at: string;
};

export type TNotificationRecipientsResponse = Response<TNotificationRecipient>;
export type TNotificationRecipientResponse = Response<TNotificationRecipient[]>;
