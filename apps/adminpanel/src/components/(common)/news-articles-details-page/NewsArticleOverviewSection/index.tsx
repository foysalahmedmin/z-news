import type { TNews } from "@/types/news.type";
import {
  Calendar,
  CalendarCheck,
  CalendarPlus,
  CalendarSync,
  Edit2,
  FileText,
  Tag,
  User,
} from "lucide-react";
import React from "react";

export type TNewsArticleOverviewSectionProps = {
  news?: TNews;
};

// Enhanced Overview Section
const NewsArticleOverviewSection: React.FC<
  TNewsArticleOverviewSectionProps
> = ({ news }) => {
  return (
    <div className="space-y-6">
      {/* Description */}
      {news?.description && (
        <div>
          <h3 className="text-foreground mb-3 flex items-center text-lg font-semibold">
            <FileText className="mr-2 h-5 w-5" />
            Description
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {news.description}
          </p>
        </div>
      )}

      {/* Article Details */}
      <div>
        <h3 className="text-foreground mb-4 text-lg font-semibold">
          Article Details
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="bg-muted rounded-lg p-4">
            <div className="text-muted-foreground mb-1 flex items-center text-sm">
              <Tag className="mr-1 h-4 w-4" />
              Article ID
            </div>
            <div className="text-foreground font-mono text-sm">{news?._id}</div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="text-muted-foreground mb-1 flex items-center text-sm">
              <Tag className="mr-1 h-4 w-4" />
              Article Slug
            </div>
            <div className="text-foreground font-mono text-sm">
              {news?.slug}
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="text-muted-foreground mb-1 flex items-center text-sm">
              <User className="mr-1 h-4 w-4" />
              Category
            </div>
            <div className="flex items-center gap-2">
              <div className="text-foreground text-sm">
                {news?.category?.name || "None"}
              </div>
              {news?.categories?.length && (
                <div className="text-muted-foreground border-foreground inline-block border-s ps-2 text-sm">
                  {news.categories.map((category) => category.name).join(", ")}
                </div>
              )}
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="text-muted-foreground mb-1 flex items-center text-sm">
              <Calendar className="mr-1 h-4 w-4" />
              Event
            </div>
            <div className="text-foreground text-sm">
              {news?.event?.name || "None"}
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="text-muted-foreground mb-1 flex items-center text-sm">
              <FileText className="mr-1 h-4 w-4" />
              Layout Type
            </div>
            <div className="text-foreground text-sm capitalize">
              {news?.layout || "default"}
            </div>
          </div>

          {news?.published_at && (
            <div className="bg-muted rounded-lg p-4">
              <div className="text-muted-foreground mb-1 flex items-center text-sm">
                <CalendarCheck className="mr-1 h-4 w-4" />
                Published Date
              </div>
              <div className="text-foreground text-sm">
                {new Date(news.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          )}

          {/* {news?.expired_at && (
            <div className="bg-muted rounded-lg p-4">
              <div className="text-muted-foreground mb-1 flex items-center text-sm">
                <CalendarX className="mr-1 h-4 w-4" />
                Expiry Date
              </div>
              <div className="text-foreground text-sm">
                {new Date(news.expired_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          )} */}

          {news?.created_at && (
            <div className="bg-muted rounded-lg p-4">
              <div className="text-muted-foreground mb-1 flex items-center text-sm">
                <CalendarPlus className="mr-1 h-4 w-4" />
                Created Date
              </div>
              <div className="text-foreground text-sm">
                {new Date(news.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          )}

          {news?.updated_at && (
            <div className="bg-muted rounded-lg p-4">
              <div className="text-muted-foreground mb-1 flex items-center text-sm">
                <CalendarSync className="mr-1 h-4 w-4" />
                Updated Date
              </div>
              <div className="text-foreground text-sm">
                {new Date(news.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          )}

          {news?.edited_at && (
            <div className="bg-muted rounded-lg p-4">
              <div className="text-muted-foreground mb-1 flex items-center text-sm">
                <Edit2 className="mr-1 h-4 w-4" />
                Edited Date
              </div>
              <div className="text-foreground text-sm">
                {new Date(news.edited_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Article Flags */}
      <div>
        <h3 className="text-foreground mb-4 text-lg font-semibold">
          Article Status
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="bg-muted rounded-lg p-4">
            <div className="text-muted-foreground mb-2 text-sm">
              Special Flags
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Featured Article</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    news?.is_featured
                      ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {news?.is_featured ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">News Headline</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    news?.is_news_headline
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {news?.is_news_headline ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Breaking News</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    news?.is_news_break
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {news?.is_news_break ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {news?.tags && news.tags.length > 0 && (
            <div className="bg-muted rounded-lg p-4">
              <div className="text-muted-foreground mb-2 flex items-center text-sm">
                <Tag className="mr-1 h-4 w-4" />
                Tags
              </div>
              <div className="flex flex-wrap gap-1">
                {news.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit History */}
      {(news?.is_edited || news?.edited_at) && (
        <div>
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            Edit History
          </h3>
          <div className="bg-muted rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Article Edited</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    news?.is_edited
                      ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {news?.is_edited ? "Yes" : "No"}
                </span>
              </div>
              {news?.edited_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Edited</span>
                  <span className="text-muted-foreground text-sm">
                    {new Date(news.edited_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsArticleOverviewSection;
