import type { TUser } from "./user.type";

export type TUserState = {
  token?: string;
  _id?: string;
  name?: string;
  role?: string;
  image?: string;
  email?: string;
  info?: Partial<TUser>;
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
