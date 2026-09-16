import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Authentication - Z-News",
  description: "Sign in or create an account on Z-News",
};

// Minimal auth section layout: no public-site Header/Footer and no admin
// dashboard chrome. The Suspense boundary is required because the sign-in
// page reads a `redirect` search param via useSearchParams().
const AuthLayout = ({ children }: { children: ReactNode }) => {
  return <Suspense fallback={null}>{children}</Suspense>;
};

export default AuthLayout;
