import type { TNews } from "@/types/news.type";
import { Eye, Image, Play, Youtube } from "lucide-react";
import React from "react";

// Media Section
export type TNewsArticleMediaSectionProps = {
  news?: TNews;
};

const NewsArticleMediaSection: React.FC<TNewsArticleMediaSectionProps> = ({
  news,
}) => {
  const getYouTubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="space-y-6">
      <div className="text-muted-foreground text-sm">
        All media files and content associated with this article
      </div>

      {/* Thumbnail */}
      <div>
        <h3 className="text-foreground mb-3 flex items-center text-lg font-semibold">
          <Image className="mr-2 h-5 w-5" />
          Thumbnail Image
        </h3>
        <div className="bg-muted rounded-lg p-4">
          {news?.thumbnail?.url ? (
            <div className="space-y-3">
              <img
                src={news.thumbnail.url}
                alt={news.title}
                className="mx-auto h-auto w-full max-w-xl rounded-lg object-cover shadow-md"
              />
              <div className="text-muted-foreground text-center text-xs">
                Primary thumbnail image for the article
              </div>
            </div>
          ) : (
            <div className="border-border flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
              <div className="text-center">
                <Image className="text-muted-foreground mx-auto h-8 w-8" />
                <p className="text-muted-foreground mt-2 text-sm">
                  No thumbnail image
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video */}
      <div>
        <h3 className="text-foreground mb-3 flex items-center text-lg font-semibold">
          <Play className="mr-2 h-5 w-5" />
          Video Content
        </h3>
        <div className="bg-muted rounded-lg p-4">
          {news?.video?.url ? (
            <div className="space-y-3">
              <video
                controls
                className="mx-auto w-full max-w-2xl rounded-lg shadow-md"
                poster={news?.thumbnail?.url}
              >
                <source src={news.video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="text-muted-foreground text-center text-xs">
                Direct video file attached to the article
              </div>
            </div>
          ) : (
            <div className="border-border flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
              <div className="text-center">
                <Play className="text-muted-foreground mx-auto h-8 w-8" />
                <p className="text-muted-foreground mt-2 text-sm">
                  No video content
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* YouTube Video */}
      <div>
        <h3 className="text-foreground mb-3 flex items-center text-lg font-semibold">
          <Youtube className="mr-2 h-5 w-5" />
          YouTube Video
        </h3>
        <div className="bg-muted rounded-lg p-4">
          {news?.youtube ? (
            <div className="space-y-3">
              {(() => {
                const videoId = getYouTubeVideoId(news.youtube);
                return videoId ? (
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <iframe
                      className="absolute top-0 left-0 h-full w-full rounded-lg shadow-md"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
                    <p className="text-destructive text-sm">
                      Invalid YouTube URL: {news.youtube}
                    </p>
                  </div>
                );
              })()}
              <div className="text-muted-foreground text-xs">
                YouTube video embedded in the article
                <br />
                <a
                  href={news.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View on YouTube
                </a>
              </div>
            </div>
          ) : (
            <div className="border-border flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
              <div className="text-center">
                <Youtube className="text-muted-foreground mx-auto h-8 w-8" />
                <p className="text-muted-foreground mt-2 text-sm">
                  No YouTube video
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Summary */}
      <div>
        <h3 className="text-foreground mb-3 flex items-center text-lg font-semibold">
          <Eye className="mr-2 h-5 w-5" />
          Media Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-primary text-2xl font-bold">
              {news?.thumbnail ? 1 : 0}
            </div>
            <div className="text-muted-foreground text-sm">Thumbnail</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {news?.video ? 1 : 0}
            </div>
            <div className="text-muted-foreground text-sm">Videos</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-destructive text-2xl font-bold">
              {news?.youtube ? 1 : 0}
            </div>
            <div className="text-muted-foreground text-sm">YouTube</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsArticleMediaSection;
