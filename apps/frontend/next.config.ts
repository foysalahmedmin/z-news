import type { NextConfig } from "next";
import { ENV } from "./src/config/env";

// Uploads are served from the API host (URLS.user / URLS.news.* in src/config/urls).
const apiUrl = new URL(ENV.api_url);

const nextConfig: NextConfig = {
  // output: "export",
  images: {
    // unoptimized: true,
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
      {
        protocol: "https",
        hostname: "admin.z-news.com",
      },
      // The backend's GCS storage provider returns storage.googleapis.com URLs.
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      // Google sign-in avatars.
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};

export default nextConfig;
