import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { TUserState } from "@/types/state.type";

const COOKIE_KEY = "user";
const ADMIN_ROLES = [
  "super-admin",
  "admin",
  "editor",
  "author",
  "contributor",
];

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_KEY)?.value;
  let user: TUserState | null = null;

  if (cookie) {
    try {
      user = JSON.parse(cookie) as TUserState;
    } catch {
      user = null;
    }
  }

  const isAuthenticated = Boolean(user?.info && user?.token);
  const role = user?.info?.role;

  if (!isAuthenticated) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (!role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
