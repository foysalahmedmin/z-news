import type { TUserState } from "@/types/state.type";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { useEffect, useState } from "react";

const COOKIE_KEY = "user";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

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
    setCookie(COOKIE_KEY, JSON.stringify(user), {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    setUserState(user);
  };

  const clearUser = () => {
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
