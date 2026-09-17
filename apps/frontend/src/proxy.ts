import { items } from "@/data/admin-menu-items";
import type { TItem } from "@/types/route-menu.type";
import type { TUserState } from "@/types/state.type";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_KEY = "user";

type TRoutePattern = { segments: string[]; roles?: readonly string[] };

// Builds a flat list of { segments, roles } from admin-menu-items.ts's tree,
// e.g. `files` -> `edit/:id` becomes segments ["files", "edit", ":id"]. A
// child's own `roles` overrides its parent's (matches how the source app's
// per-route AuthWrapper roles worked); a child with no `roles` inherits the
// nearest ancestor's. This lets middleware enforce the same per-route role
// restrictions the sidebar/menu already encodes, instead of one blanket
// "any admin-ish role can reach any /admin/* route" check.
function buildRoutePatterns(
  nodes: readonly TItem[],
  parentSegments: string[] = [],
  inheritedRoles?: readonly string[],
): TRoutePattern[] {
  const patterns: TRoutePattern[] = [];

  for (const node of nodes) {
    const roles = node.roles?.length ? node.roles : inheritedRoles;
    const segments = node.index
      ? parentSegments
      : node.path !== undefined
        ? [...parentSegments, ...node.path.split("/").filter(Boolean)]
        : parentSegments;

    if (node.path !== undefined || node.index) {
      patterns.push({ segments, roles });
    }

    if (node.children?.length) {
      patterns.push(...buildRoutePatterns(node.children, segments, roles));
    }
  }

  return patterns;
}

const ROUTE_PATTERNS = buildRoutePatterns(items);

function matchesPattern(pathSegments: string[], pattern: string[]): boolean {
  if (pathSegments.length !== pattern.length) return false;
  return pattern.every(
    (seg, i) => seg.startsWith(":") || seg === pathSegments[i],
  );
}

// Longest (most specific) match wins, e.g. files/edit/:id over files.
function getRequiredRoles(pathname: string): readonly string[] | undefined {
  const segments = pathname
    .replace(/^\/admin\/?/, "")
    .split("/")
    .filter(Boolean);

  let best: TRoutePattern | undefined;
  for (const pattern of ROUTE_PATTERNS) {
    if (
      matchesPattern(segments, pattern.segments) &&
      (!best || pattern.segments.length > best.segments.length)
    ) {
      best = pattern;
    }
  }
  return best?.roles;
}

export function proxy(request: NextRequest) {
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

  // /user/* is a personal-account area for any signed-in role; it only
  // needs the auth check above, not the /admin-specific role gating below.
  if (request.nextUrl.pathname.startsWith("/user")) {
    return NextResponse.next();
  }

  const requiredRoles = getRequiredRoles(request.nextUrl.pathname);
  if (requiredRoles?.length && (!role || !requiredRoles.includes(role))) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
