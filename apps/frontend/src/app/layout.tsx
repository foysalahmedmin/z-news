import AnimationApplier from "@/components/appliers/AnimationApplier";
import AppProviders from "@/providers/AppProviders";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_Bengali } from "next/font/google";
import React from "react";
import "./globals.css";

const noto = Noto_Serif_Bengali({
  variable: "--font-noto-serif-bengali",
  subsets: ["bengali", "latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Z-News",
  description: "Z-News",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" dir="ltr">
      <head>
        {/* Reads usePreference.tsx's "preference" cookie (not localStorage —
            cookies are readable from both server and client) and applies
            theme/direction/language to <html> before first paint, so there's
            no flash of the wrong theme while React hydrates. Deliberately a
            client-only script rather than reading the cookie in this layout
            server-side: next/headers' cookies() would force this whole site
            into fully dynamic rendering (no more static/ISR pages), just to
            avoid a flash this synchronous head script already fully
            prevents on its own — scripts here always run before the browser
            paints, regardless of what the server rendered. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var match = document.cookie.match(/(?:^|; )preference=([^;]*)/);
                  var raw = match ? decodeURIComponent(match[1]) : null;
                  var s = raw ? JSON.parse(raw) : null;
                  var root = document.documentElement;

                  var theme = (s && s.theme) || "light";
                  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
                  var mode = theme === "dark" ? "dark" : theme === "light" ? "light" : (prefersDark ? "dark" : "light");
                  root.classList.remove("light", "dark");
                  root.classList.add(mode);

                  var dir = (s && s.direction) || "ltr";
                  root.setAttribute("dir", dir);

                  var lang = (s && s.language) || "bn";
                  root.setAttribute("lang", lang);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${noto.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>

        {/* Appliers */}
        <AnimationApplier />
      </body>
    </html>
  );
}
