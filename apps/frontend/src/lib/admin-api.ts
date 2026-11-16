import { ENV } from "@/config";
import {
  USER_COOKIE_KEY as COOKIE_KEY,
  clearAccessToken,
  getAccessToken,
  refreshAccessToken,
} from "@/lib/api";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import { deleteCookie, getCookie } from "cookies-next";
import { toast } from "react-toastify";

// Only reached when the session can't be renewed. A hard navigation is
// intentional (it resets all client state); NewsArticleForm guards unsaved
// edits with a beforeunload prompt, and the user comes back to this page.
const redirectToSignIn = () => {
  clearAccessToken();
  deleteCookie(COOKIE_KEY);
  if (typeof window !== "undefined") {
    const back = window.location.pathname + window.location.search;
    window.location.href = `/auth/sign-in?redirect=${encodeURIComponent(back)}`;
  }
};

// Admin dashboard API client. Public/server-rendered pages continue to use
// the plain @/lib/api Fetch client — this one is specifically for
// client-side admin dashboard requests that need the in-memory auth
// token attached + automatic refresh-token handling.
const adminApi: AxiosInstance = axios.create({
  baseURL: ENV.api_url,
});

adminApi.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  let token = getAccessToken();

  if (
    !token &&
    typeof window !== "undefined" &&
    getCookie(COOKIE_KEY) &&
    !config.url?.includes("/api/auth/")
  ) {
    token = await refreshAccessToken();
  }

  if (token) {
    config.headers.Authorization = `${token}`;
  }

  return config;
});

adminApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError): Promise<AxiosResponse | never> => {
    // 403 = signed in but the role may not do this; the session is fine.
    if (error.response?.status === 403) {
      toast.error(
        (error.response.data as { message?: string })?.message ||
          "Access denied",
      );
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/api/auth/refresh-token")) {
        redirectToSignIn();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const token = await refreshAccessToken();

        if (!token) {
          redirectToSignIn();
          return Promise.reject(error);
        }

        originalRequest.headers.Authorization = `${token}`;
        return adminApi(originalRequest);
      } catch (err: unknown) {
        redirectToSignIn();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default adminApi;
