export const ENV = {
  app_url:
    (import.meta.env.VITE_APP_URL as string) ||
    "https://z-news-server.vercel.app",
  api_url:
    (import.meta.env.VITE_API_URL as string) ||
    "https://z-news-server.vercel.app",
  environment: import.meta.env.MODE as "development" | "production",
  google_client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
};
