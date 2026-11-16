import {
  USER_COOKIE_KEY as COOKIE_KEY,
  clearAccessToken,
  getAccessToken,
  getUserCookieOptions,
  refreshAccessToken,
  setAccessToken,
} from "@/lib/api";
import { signOut } from "@/services/auth.service";
import type { TUserState } from "@/types/state.type";
import type { TUser } from "@/types/user.type";
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
        const parsed = JSON.parse(cookie as string);
        setUserState({ ...parsed, isAuthenticated: true });
        if (!getAccessToken()) {
          refreshAccessToken().catch(() => {});
        }
      } catch {
        setUserState({ isAuthenticated: false });
      }
    }
  }, []);

  const setUser = (userData: TUserState) => {
    if (userData.token) {
      setAccessToken(userData.token);
    }
    const { token, ...safeUser } = userData;
    const info = (safeUser.info || {
      _id: safeUser._id,
      name: safeUser.name,
      role: safeUser.role,
      image: safeUser.image,
      email: safeUser.email,
    }) as Partial<TUser>;
    const cookieData: TUserState = {
      _id: info._id || safeUser._id,
      name: info.name || safeUser.name,
      role: info.role || safeUser.role,
      image: info.image || safeUser.image,
      email: info.email || safeUser.email,
      info,
      isAuthenticated: true,
    };
    setCookie(COOKIE_KEY, JSON.stringify(cookieData), getUserCookieOptions());
    setUserState(cookieData);
  };

  const clearUser = () => {
    clearAccessToken();
    deleteCookie(COOKIE_KEY);
    setUserState(null);
    // Revokes the refresh token and clears its httpOnly cookie server-side.
    signOut().catch(() => {});
  };

  return {
    isLoading: false,
    user,
    setUser,
    clearUser,
  };
};

export default useUser;
