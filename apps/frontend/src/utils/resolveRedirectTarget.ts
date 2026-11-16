// Only follow `?redirect=` when it resolves to this origin. Prefix checks
// miss payloads like `/\evil.com` (browsers read "\" as "/"), so let the URL
// parser decide and return just the path part.
export const resolveRedirectTarget = (redirect: string | null): string => {
  if (!redirect || typeof window === "undefined") return "/";
  try {
    const url = new URL(redirect, window.location.origin);
    if (url.origin !== window.location.origin) return "/";
    return url.pathname + url.search + url.hash;
  } catch {
    return "/";
  }
};
