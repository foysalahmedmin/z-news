import { USER_COOKIE_KEY as COOKIE_KEY, getUserCookieOptions } from "@/lib/api";
import { signOut } from "@/services/auth.service";
import type { TUserState } from "@/types/state.type";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { useEffect, useState } from "react";

const useUser = () => {
  const [user, setUserState] = useState<TUserState | null>({
    isAuthenticated: false,
  });

  useEffect(() => {
    const cookie = getCookie(COOKIE_KEY);
    if (cookie) {
      try {
        const user = JSON.parse(cookie as string);
        setUserState({ ...user, isAuthenticated: true });
      } catch {
        setUserState({ isAuthenticated: false });
      }
    }
  }, []);

  const setUser = (user: TUserState) => {
    setCookie(COOKIE_KEY, JSON.stringify(user), getUserCookieOptions());
    setUserState(user);
  };

  const clearUser = () => {
    // Revokes the refresh token and clears its httpOnly cookie server-side.
    signOut().catch(() => {});
    deleteCookie(COOKIE_KEY);
    setUserState(null);
  };

  return {
    isLoading: false,
    user,
    setUser,
    clearUser,
  };
};

export default useUser;
