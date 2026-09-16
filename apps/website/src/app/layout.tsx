import AnimationApplier from "@/components/appliers/AnimationApplier";
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
    <html lang="bn">
      <body
        className={`${noto.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        {/* Appliers */}
        <AnimationApplier />
      </body>
    </html>
  );
}
