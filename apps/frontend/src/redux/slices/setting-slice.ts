import type { TSettingState } from "@/types/state.type";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { getCookie, setCookie } from "cookies-next";

const COOKIE_KEY = "setting";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const defaultSetting: TSettingState = {
  theme: "system",
  direction: "ltr",
  language: "en",
  sidebar: "expanded",
  header: "expanded",
  layout: "vertical",
};

// apps/adminpanel's original getInitialSetting() called localStorage.getItem()
// directly at module top-level (to compute `initialState` eagerly), which
// crashes under Next.js SSR since `localStorage`/cookie access isn't
// available on the server. Guarding with `typeof window !== "undefined"`
// keeps `initialState` a safe static default during SSR, and only reads the
// persisted cookie in the browser — the smallest diff from the original
// that's still SSR-safe. Also switched from localStorage to the "setting"
// cookie (via cookies-next), matching @/hooks/states/useUser's convention,
// since apps/frontend uses cookie-based auth/preferences.
const getInitialSetting = (): TSettingState => {
  if (typeof window === "undefined") {
    return defaultSetting;
  }

  try {
    const setting = getCookie(COOKIE_KEY);
    return setting ? JSON.parse(setting as string) : defaultSetting;
  } catch (error) {
    console.error("Error parsing setting from cookie", error);
    return defaultSetting;
  }
};

const initialState: TSettingState = getInitialSetting();

export const settingSlice = createSlice({
  name: "setting",
  initialState,
  reducers: {
    setSetting: (state, action: PayloadAction<TSettingState>) => {
      if (action.payload) {
        const setting = { ...state, ...action.payload };
        setCookie(COOKIE_KEY, JSON.stringify(setting), {
          path: "/",
          maxAge: COOKIE_MAX_AGE,
        });
        return setting;
      }
      return state;
    },
    updateTheme: (state, action: PayloadAction<TSettingState["theme"]>) => {
      state.theme = action.payload;
      setCookie(COOKIE_KEY, JSON.stringify(state), {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    },
    updateDirection: (
      state,
      action: PayloadAction<TSettingState["direction"]>,
    ) => {
      state.direction = action.payload;
      setCookie(COOKIE_KEY, JSON.stringify(state), {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    },
    updateLanguage: (
      state,
      action: PayloadAction<TSettingState["language"]>,
    ) => {
      state.language = action.payload;
      setCookie(COOKIE_KEY, JSON.stringify(state), {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    },
    updateSidebar: (state, action: PayloadAction<TSettingState["sidebar"]>) => {
      state.sidebar = action.payload;
      setCookie(COOKIE_KEY, JSON.stringify(state), {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    },
    updateHeader: (state, action: PayloadAction<TSettingState["header"]>) => {
      state.header = action.payload;
      setCookie(COOKIE_KEY, JSON.stringify(state), {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    },
    updateLayout: (state, action: PayloadAction<TSettingState["layout"]>) => {
      state.layout = action.payload;
      setCookie(COOKIE_KEY, JSON.stringify(state), {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    },
    resetSetting: () => {
      setCookie(COOKIE_KEY, JSON.stringify(defaultSetting), {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
      return defaultSetting;
    },
  },
});

export const {
  setSetting,
  updateTheme,
  updateDirection,
  updateLanguage,
  updateSidebar,
  updateHeader,
  updateLayout,
  resetSetting,
} = settingSlice.actions;

export default settingSlice.reducer;
