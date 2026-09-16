import type { TNotificationRecipient } from "./notification-recipient";
import type { TBreadcrumbs, TProcessedMenu } from "./route-menu.type";
import type { TUser } from "./user.type";

export type TUserState = {
  token?: string;
  info?: TUser;
  isAuthenticated?: boolean;
};

export type TPreferenceState = {
  theme?: "light" | "dark" | "system" | "semi-dark";
  direction?: "ltr" | "rtl";
  language?: "en" | "bn";
  sidebar?: "expanded" | "compact";
  header?: "expanded" | "compact";
  layout?: "vertical" | "horizontal";
};

// Alias kept for parity with apps/adminpanel's state.type.ts (its setting-slice
// and menu-slice import this name). Same shape as TPreferenceState above,
// which apps/frontend's usePreference hook already relies on.
export type TSettingState = TPreferenceState;

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
