import { URLS } from "@/config";
import { parseYouTubeUrl } from "./youtubeUrlUtils";

export const getThumbnail = (thumbnail?: string, youtube?: string): string => {
  const { thumbnails } = youtube ? parseYouTubeUrl(youtube || "") : {};

  if (thumbnail) {
    if (thumbnail.startsWith("http")) return thumbnail;
    return URLS.news.thumbnail + "/" + thumbnail;
  }

  return thumbnails?.default || "/images/thumbnail.png";
};
