import type { TNotificationRecipient } from "./notification-recipient";
import type { TBreadcrumbs, TProcessedMenu } from "./route-menu.type";
import type { TUser } from "./user.type";

export type TUserState = {
  token?: string;
  info?: TUser;
  is_authenticated?: boolean;
};

export type TSettingState = {
  theme?: "light" | "dark" | "system" | "semi-dark";
  direction?: "ltr" | "rtl";
  language?: "en" | "bn";
  sidebar?: "expanded" | "compact";
  header?: "expanded" | "compact";
  layout?: "vertical" | "horizontal";
};

export type TMenuState = {
  menus: TProcessedMenu[];
  indexesMap: Record<string, number[]>;
  breadcrumbsMap: Record<string, TBreadcrumbs[]>;
  activeIndexes?: number[];
  openIndexes?: number[];
  activeBreadcrumbs?: TBreadcrumbs[];
};

export type NotificationsState = {
  notifications: TNotificationRecipient[];
  unread: number;
  total: number;
  isConnected: boolean;
};
