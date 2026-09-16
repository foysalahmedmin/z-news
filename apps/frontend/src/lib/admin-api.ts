import { ENV } from "@/config";
import { refreshToken } from "@/services/auth.service";
import type { TUserState } from "@/types/state.type";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

const COOKIE_KEY = "user";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

let isRefreshing = false;

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

const redirectToSignIn = () => {
  deleteCookie(COOKIE_KEY);
  if (typeof window !== "undefined") {
    window.location.href = "/auth/sign-in";
  }
};

// Admin dashboard API client. Public/server-rendered pages continue to use
// the plain @/lib/api Fetch client — this one is specifically for
// client-side admin dashboard requests that need the cookie-based auth
// token attached + automatic refresh-token handling.
const adminApi: AxiosInstance = axios.create({
  baseURL: ENV.api_url,
});

adminApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const cookie = getCookie(COOKIE_KEY);
  let user: TUserState | null = null;

  try {
    user = cookie ? (JSON.parse(cookie as string) as TUserState) : null;
  } catch (error) {
    console.error("Error parsing user cookie", error);
  }

  if (user?.token) {
    config.headers.Authorization = `${user.token}`;
  }

  return config;
});

adminApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError): Promise<AxiosResponse | never> => {
    if (error.response?.status === 403) {
      redirectToSignIn();
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (originalRequest.url === "/api/auth/refresh-token") {
      redirectToSignIn();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = token;
              resolve(adminApi(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshToken();

        if (!data?.token) {
          throw new Error("No new token returned");
        }

        const cookie = getCookie(COOKIE_KEY);
        const existingUser = cookie
          ? (JSON.parse(cookie as string) as TUserState)
          : {};

        setCookie(
          COOKIE_KEY,
          JSON.stringify({ ...existingUser, ...data, isAuthenticated: true }),
          { path: "/", maxAge: COOKIE_MAX_AGE },
        );

        adminApi.defaults.headers.common.Authorization = `${data.token}`;
        processQueue(null, `${data.token}`);

        return adminApi(originalRequest);
      } catch (error: unknown) {
        processQueue(error, null);
        redirectToSignIn();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default adminApi;
