/**
 * Determines whether a menu path should be treated as "active" for the
 * given pathname. This replaces react-router's `NavLink` active-matching
 * (used by apps/adminpanel) now that we're on Next.js App Router, which has
 * no built-in equivalent.
 *
 * Exact match is always active. Prefix match (`pathname` starting with
 * `path + "/"`) is also active so nested routes (e.g. an edit page under a
 * list page) highlight their parent menu item — except for the dashboard
 * root ("/admin") itself, which would otherwise match every admin route.
 */
export function isPathActive(
  pathname: string | null | undefined,
  path?: string,
): boolean {
  if (!pathname || !path) return false;
  if (pathname === path) return true;
  if (path === "/admin") return false;
  return pathname.startsWith(`${path}/`);
}
