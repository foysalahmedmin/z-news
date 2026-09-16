import type { TUserState } from "@/types/state.type";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

const COOKIE_KEY = "user";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// apps/adminpanel's original getInitialUser() called localStorage.getItem()
// directly at module top-level (to compute `initialState` eagerly), which
// crashes under Next.js SSR since `localStorage`/cookie access isn't
// available on the server. Guarding with `typeof window !== "undefined"`
// keeps `initialState` a safe static default during SSR, and only reads the
// persisted cookie in the browser — the smallest diff from the original
// that's still SSR-safe. Also switched from localStorage to the "user"
// cookie (via cookies-next), matching @/hooks/states/useUser's convention,
// since apps/frontend uses cookie-based auth.
const getInitialUser = (): TUserState => {
  if (typeof window === "undefined") {
    return { isAuthenticated: false };
  }

  try {
    const cookie = getCookie(COOKIE_KEY);
    return cookie
      ? (JSON.parse(cookie as string) as TUserState)
      : { isAuthenticated: false };
  } catch (error) {
    console.error("Error parsing user from cookie", error);
    return { isAuthenticated: false };
  }
};

const initialState: TUserState = getInitialUser();

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<TUserState>) => {
      const user = action.payload;
      if (user?.token) {
        const updated = { ...user, isAuthenticated: true };
        setCookie(COOKIE_KEY, JSON.stringify(updated), {
          path: "/",
          maxAge: COOKIE_MAX_AGE,
        });
        return updated;
      }
      return state;
    },
    clearUser: () => {
      deleteCookie(COOKIE_KEY);
      return { isAuthenticated: false };
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
