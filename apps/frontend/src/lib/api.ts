import { ENV } from "@/config";
import type { TUserState } from "@/types/state.type";
import { getCookie, setCookie } from "cookies-next/client";

// Module-level in-memory storage for the access token. Never stored in document.cookie.
let inMemoryToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const getAccessToken = (): string | null => inMemoryToken;

export const setAccessToken = (token: string | null): void => {
  inMemoryToken = token;
};

export const clearAccessToken = (): void => {
  inMemoryToken = null;
};

export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${ENV.api_url}/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        setAccessToken(null);
        return null;
      }

      const json = await response.json();
      const token = json?.data?.token;

      if (token) {
        setAccessToken(token);
        if (json?.data?.info) {
          const cookie = getCookie(USER_COOKIE_KEY);
          if (cookie) {
            try {
              const user = JSON.parse(cookie as string);
              const info = json.data.info;
              const updated = {
                ...user,
                _id: info._id,
                name: info.name,
                email: info.email,
                role: info.role,
                image: info.image,
                info,
                isAuthenticated: true,
              };
              delete (updated as Record<string, unknown>).token;
              setCookie(
                USER_COOKIE_KEY,
                JSON.stringify(updated),
                getUserCookieOptions(),
              );
            } catch {}
          }
        }
        return token;
      }

      setAccessToken(null);
      return null;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// types.ts (separate file for interfaces)
export interface FetchConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface NextFetchConfig {
  cache?: string;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

export interface RequestConfig {
  url: string;
  options: RequestInit;
}

export interface FetchResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: {
    url: string;
    method?: string;
    baseURL?: string;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    body?: any;
    timeout?: number;
  };
}

export type RequestInterceptor = (
  config: RequestConfig,
) => RequestConfig | Promise<RequestConfig>;

export type ResponseInterceptor = (
  response: Response,
) => Response | Promise<Response>;

// Fetch.ts (main class)
export class Fetch {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  public interceptors = {
    request: {
      handlers: [] as RequestInterceptor[],
      use: (interceptor: RequestInterceptor) => {
        this.interceptors.request.handlers.push(interceptor);
        return this;
      },
    },
    response: {
      handlers: [] as ResponseInterceptor[],
      use: (interceptor: ResponseInterceptor) => {
        this.interceptors.response.handlers.push(interceptor);
        return this;
      },
    },
  };

  constructor(config: FetchConfig & NextFetchConfig = {}) {
    this.baseURL = config.baseURL || "";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    };
    this.timeout = config.timeout || 10000;
  }

  create(config: FetchConfig): Fetch {
    return new Fetch(config);
  }

  private async processRequest(config: RequestConfig): Promise<RequestConfig> {
    // Merge headers
    const mergedHeaders = {
      ...this.defaultHeaders,
      ...this.convertHeaders(config.options.headers),
    };

    // FormData needs the browser-generated multipart boundary, so never send our own Content-Type.
    if (config.options.body instanceof FormData) {
      delete (mergedHeaders as Record<string, string>)["Content-Type"];
    }

    let processedConfig: RequestConfig = {
      ...config,
      options: {
        ...config.options,
        headers: mergedHeaders,
      },
    };

    // Apply request interceptors
    for (const interceptor of this.interceptors.request.handlers) {
      processedConfig = await interceptor(processedConfig);
    }

    return processedConfig;
  }

  private async processResponse<T>(
    response: Response,
    config: RequestConfig,
  ): Promise<FetchResponse<T>> {
    // Apply response interceptors
    let processedResponse = response;
    for (const interceptor of this.interceptors.response.handlers) {
      processedResponse = await interceptor(processedResponse);
    }

    if (!processedResponse.ok) {
      const error = new Error(
        `HTTP error! status: ${processedResponse.status}`,
      );
      (error as any).response = processedResponse;
      throw error;
    }

    // Process response headers
    const responseHeaders = this.convertHeaders(processedResponse.headers);

    // Parse data based on content type
    const contentType = processedResponse.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await processedResponse.json()
      : await processedResponse.text();

    return {
      data: data as T,
      status: processedResponse.status,
      statusText: processedResponse.statusText,
      headers: responseHeaders,
      config: {
        url: config.url,
        method: config.options.method,
        baseURL: this.baseURL,
        headers: this.convertHeaders(config.options.headers),
        body: config.options.body,
        timeout: this.timeout,
      },
    };
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === "AbortError") {
        throw new Error(`Request timed out after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  private convertHeaders(headers?: HeadersInit): Record<string, string> {
    if (!headers) return {};
    if (headers instanceof Headers) {
      const obj: Record<string, string> = {};
      headers.forEach((v, k) => (obj[k] = v));
      return obj;
    }
    if (Array.isArray(headers)) return Object.fromEntries(headers);
    return headers;
  }

  async request<T = any>(
    url: string,
    options: RequestInit & NextFetchConfig & { _retry?: boolean } = {},
  ): Promise<FetchResponse<T>> {
    const processedConfig = await this.processRequest({
      url,
      options,
    });

    const fullUrl = this.baseURL + processedConfig.url;
    const response = await this.fetchWithTimeout(
      fullUrl,
      processedConfig.options,
    );

    if (
      response.status === 401 &&
      typeof window !== "undefined" &&
      !options._retry &&
      !url.includes("/api/auth/refresh-token") &&
      !url.includes("/api/auth/signin") &&
      !url.includes("/api/auth/logout") &&
      getCookie(USER_COOKIE_KEY)
    ) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return this.request<T>(url, {
          ...options,
          _retry: true,
          headers: {
            ...this.convertHeaders(options.headers),
            Authorization: newToken,
          },
        });
      }
    }

    return this.processResponse<T>(response, processedConfig);
  }

  // HTTP verb methods remain the same...
  get<T = any>(url: string, options?: RequestInit): Promise<FetchResponse<T>> {
    return this.request<T>(url, { ...options, method: "GET" });
  }

  post<T = any>(
    url: string,
    data?: any,
    options?: Omit<RequestInit, "body">,
  ): Promise<FetchResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  put<T = any>(
    url: string,
    data?: any,
    options?: Omit<RequestInit, "body">,
  ): Promise<FetchResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  patch<T = any>(
    url: string,
    data?: any,
    options?: Omit<RequestInit, "body">,
  ): Promise<FetchResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  delete<T = any>(
    url: string,
    options?: RequestInit,
  ): Promise<FetchResponse<T>> {
    return this.request<T>(url, { ...options, method: "DELETE" });
  }
}

export const USER_COOKIE_KEY = "user";

// Matches the backend's refresh-token lifetime (JWT_REFRESH_SECRET_EXPIRES_IN=15d
// in apps/backend/.env.example): once the refresh token is gone the access
// token in this cookie can no longer be renewed, so keeping it longer is useless.
const USER_COOKIE_MAX_AGE = 60 * 60 * 24 * 15;

// Options for the JS-written "user" cookie (it can't be httpOnly because the
// client reads the token from it).
export const getUserCookieOptions = () => ({
  path: "/",
  maxAge: USER_COOKIE_MAX_AGE,
  sameSite: "lax" as const,
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
});

// Authorization header for the signed-in user, read from the in-memory access token.
// Client-side only: on the server renders are always anonymous.
export const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") {
    return {};
  }
  const token = getAccessToken();
  return token ? { Authorization: token } : {};
};

const api = new Fetch({ baseURL: ENV.api_url });

api.interceptors.request.use(async (config) => {
  let token = getAccessToken();

  if (
    !token &&
    typeof window !== "undefined" &&
    getCookie(USER_COOKIE_KEY) &&
    !config.url.includes("/api/auth/")
  ) {
    token = await refreshAccessToken();
  }

  const authHeaders: Record<string, string> = token
    ? { Authorization: token }
    : {};

  const internalSecretHeader: Record<string, string> =
    typeof window === "undefined" && process.env.INTERNAL_API_SECRET
      ? { "x-internal-secret": process.env.INTERNAL_API_SECRET }
      : {};

  config.options.headers = {
    ...config.options.headers,
    ...authHeaders,
    ...internalSecretHeader,
  };
  return config;
});

export default api;
