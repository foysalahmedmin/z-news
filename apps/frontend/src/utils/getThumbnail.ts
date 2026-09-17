import { URLS } from "@/config";
import { parseYouTubeUrl } from "./youtubeUrlUtils";

// Ported from apps/adminpanel's src/utils/getThumbnail.ts. The fallback
// placeholder path was adjusted from "/images/thumbnail.png" to
// "/thumbnail.png" to match apps/frontend's actual public/ asset location
// (see apps/frontend/public/thumbnail.png), which is also the fallback
// already used by (primary)/news/[slug]/page.tsx.
export const getThumbnail = (thumbnail?: string, youtube?: string): string => {
  const { thumbnails } = youtube ? parseYouTubeUrl(youtube || "") : {};

  if (thumbnail) {
    if (thumbnail.startsWith("http")) return thumbnail;
    return URLS.news.thumbnail + "/" + thumbnail;
  }

  return thumbnails?.default || "/thumbnail.png";
};
