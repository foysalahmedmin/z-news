import { URLS } from "@/config";

// `user.image` is either a bare upload filename or an absolute URL (Google
// sign-in stores the lh3.googleusercontent.com avatar URL).
export const userImageUrl = (image?: string | null): string => {
  if (!image) return "";
  return /^https?:\/\//i.test(image) ? image : `${URLS.user}/${image}`;
};
