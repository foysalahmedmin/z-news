import { TNews } from "@/types/news.type";
import { parseYouTubeUrl } from "@/utils/youtubeUrlUtils";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Edit2,
  ExternalLink,
  List,
  Tag,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Print from "../NewsActionSection/print";
import Reaction from "../NewsActionSection/reaction";
import Share from "../NewsActionSection/share";
import View from "../NewsActionSection/view";
import RecentNewsSection from "../RecentNewsSection";
import SuggestionNews from "../SuggestionNewsSection";
import FollowAuthorButton from "./FollowAuthorButton";
import VideoThumbnailPlayer from "./VideoThumbnailPlayer";

type TNewsSectionProps = {
  news?: Partial<TNews>;
};

const NewsDetailsSection: React.FC<TNewsSectionProps> = ({ news }) => {
  if (!news) return null;

  const { thumbnails, url } = news?.youtube
    ? parseYouTubeUrl(news?.youtube || "")
    : {};

  const thumbnail =
    news?.thumbnail?.url || thumbnails?.default || "/thumbnail.png";

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Extract headings for Table of Contents
  const extractHeadings = (html: string) => {
    if (typeof window === "undefined") return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const headings = Array.from(doc.querySelectorAll("h2, h3")).map((h) => ({
      text: h.textContent,
      id: h.id || h.textContent?.toLowerCase().replace(/\s+/g, "-"),
      level: h.tagName.toLowerCase(),
    }));
    return headings;
  };

  const headings = news?.content ? extractHeadings(news.content) : [];
  return (
    <div className="container grid grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="hidden space-y-6 xl:col-span-3 xl:block 2xl:col-span-3">
        <div className="space-y-6">
          <div>
            <Link
              className="text-lg underline hover:text-blue-900"
              href={`/category/${news?.category?.slug}`}
            >
              {news?.category?.name}
            </Link>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center text-sm">
            {/* Author */}
            {news?.author?.name && (
              <div className="border-muted-foreground flex flex-wrap items-center gap-2 border-l px-2">
                <Edit2 size={16} />
                <span className="font-medium">{news?.author?.name}</span>
                {news?.author?._id && (
                  <FollowAuthorButton
                    authorId={news.author._id}
                    authorName={news.author.name}
                    compact
                  />
                )}
              </div>
            )}

            {/* Writer */}
            {news?.writer && (
              <div className="border-muted-foreground flex items-center gap-2 border-l px-2">
                <Edit2 size={16} />
                <span className="font-medium">{news?.writer}</span>
              </div>
            )}

            {/* Published Date */}
            <div className="border-muted-foreground flex items-center gap-2 border-l px-2">
              <Calendar size={16} />
              <span>প্রকাশিত:</span>
              <time
                dateTime={
                  news?.published_at &&
                  new Date(news?.published_at).toISOString()
                }
              >
                {formatDate(news?.published_at)}
              </time>
            </div>

            {/* Last Updated */}
            {news?.is_edited && news?.edited_at && (
              <div className="border-muted-foreground flex items-center gap-2 border-l px-2">
                <Clock size={16} />
                <span>আপডেট:</span>
                <time
                  dateTime={
                    news?.edited_at && new Date(news?.edited_at).toISOString()
                  }
                >
                  {formatDate(news?.edited_at)}
                </time>
              </div>
            )}

            {/* Reading Time */}
            {news?.reading_time && news?.reading_time > 0 && (
              <div className="border-muted-foreground flex items-center gap-2 border-l px-2 text-blue-600">
                <BookOpen size={16} />
                <span>পড়া যাবে: {news.reading_time} মিনিট</span>
              </div>
            )}

            {/* Fact Check Badge */}
            {news?.fact_checked && (
              <div className="border-muted-foreground flex items-center gap-2 border-l px-2 text-green-600">
                <CheckCircle size={16} />
                <span className="font-bold">তথ্য যাচাইকৃত</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between border-y py-2">
          <div className="flex items-center gap-4">
            <Reaction news={news!} />
            <Print news={news!} />
            <Share news={news!} />
          </div>

          {/* View Count */}
          <div className="flex items-center gap-4">
            <View news={news!} />
          </div>
        </div>
        {/* Event */}
        {news?.event && (
          <div className="bg-muted mt-4 rounded-lg p-3">
            <div className="text-muted-foreground flex items-center gap-2 text-sm font-semibold uppercase">
              <Trophy size={16} />
              <span>ইভেন্ট:</span>
            </div>
            <Link
              href={`/event/${news.event.slug}`}
              className="mt-1 text-lg font-bold hover:underline"
            >
              {news.event.name}
            </Link>
          </div>
        )}
        <div>
          <SuggestionNews news={news} />
        </div>
      </div>
      <article
        id={`news-${news?._id}`}
        className="container mx-auto max-w-4xl space-y-6 xl:col-span-6"
      >
        {/* Breadcrumb */}
        <div className="space-y-4 md:space-y-6">
          <div className="space-y-4">
            {/* Sub Title */}
            {news?.sub_title && (
              <p className="text-lg text-red-700">{news?.sub_title}</p>
            )}

            {/* Title */}
            <h1 className="text-2xl leading-tight font-bold md:text-4xl">
              {news?.title}
            </h1>

            {/* Description */}
            {news?.description && (
              <p className="text-foreground leading-relaxed">
                {news?.description}
              </p>
            )}
          </div>

          {/* Meta Information */}
          <div className="text-muted-foreground flex flex-wrap items-center text-sm xl:hidden">
            {/* Author */}
            {news?.author?.name && (
              <div className="border-muted-foreground flex flex-wrap items-center gap-2 border-l px-2">
                <Edit2 size={16} />
                <span className="font-medium">{news?.author?.name}</span>
                {news?.author?._id && (
                  <FollowAuthorButton
                    authorId={news.author._id}
                    authorName={news.author.name}
                    compact
                  />
                )}
              </div>
            )}

            {/* Writer */}
            {news?.writer && (
              <div className="border-muted-foreground flex items-center gap-2 border-l px-2">
                <Edit2 size={16} />
                <span className="font-medium">{news?.writer}</span>
              </div>
            )}

            {/* Published Date */}
            <div className="border-muted-foreground flex items-center gap-2 border-l px-2">
              <Calendar size={16} />
              <span>প্রকাশিত:</span>
              <time
                dateTime={
                  news?.published_at &&
                  new Date(news?.published_at).toISOString()
                }
              >
                {formatDate(news?.published_at)}
              </time>
            </div>

            {/* Last Updated */}
            {news?.is_edited && news?.edited_at && (
              <div className="border-muted-foreground flex items-center gap-2 border-l px-2">
                <Clock size={16} />
                <span>আপডেট:</span>
                <time
                  dateTime={
                    news?.edited_at && new Date(news?.edited_at).toISOString()
                  }
                >
                  {formatDate(news?.edited_at)}
                </time>
              </div>
            )}

            {/* Category */}
            <div className="border-muted-foreground flex items-center gap-2 border-l px-2">
              <Tag size={16} />
              <Link
                href={`/category/${news?.category?.slug}`}
                className="underline-effect hover:underline-effect-active font-medium hover:text-blue-900"
              >
                {news?.category?.name}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-y py-2 xl:hidden">
          <div className="flex items-center gap-4">
            <Reaction news={news!} />
            <Print news={news!} />
            <Share news={news!} />
          </div>

          {/* View Count */}
          <div className="flex items-center gap-4">
            <View news={news!} />
          </div>
        </div>

        <div className="space-y-6 md:space-y-10">
          {/* Thumbnail / Video */}
          <div>
            <div>
              {news?.youtube ? (
                <VideoThumbnailPlayer
                  url={url!}
                  thumbnail={thumbnail}
                  alt="News Video"
                  width={800}
                  height={450}
                />
              ) : news?.video?.url ? (
                <VideoThumbnailPlayer
                  url={news.video.url}
                  thumbnail={thumbnail}
                  alt="News Video"
                  width={800}
                  height={450}
                  isDirectVideo={true}
                />
              ) : (
                <div className="relative">
                  <Image
                    src={thumbnail}
                    alt={news?.title || "Thumbnail"}
                    width={800}
                    height={450}
                    className="aspect-video h-auto w-full rounded-md object-cover shadow"
                    priority
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg news-content max-w-none">
            {/* Table of Contents - Inline for Mobile/Compact */}
            {headings.length > 0 && (
              <div className="bg-muted my-6 rounded-lg p-4 xl:hidden">
                <div className="mb-2 flex items-center gap-2 font-bold">
                  <List size={20} />
                  সূচিপত্র
                </div>
                <ul className="space-y-1 text-sm">
                  {headings.map((h, i) => (
                    <li key={i} className={h.level === "h3" ? "ml-4" : ""}>
                      <a href={`#${h.id}`} className="hover:underline">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              dangerouslySetInnerHTML={{ __html: news?.content || "" }}
              className="text-foreground leading-relaxed whitespace-pre-line"
            />
          </div>

          {/* Sources Section */}
          {news?.sources && news?.sources.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <ExternalLink size={20} />
                সূত্রসমূহ
              </h3>
              <ul className="space-y-2">
                {news.sources.map((source, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{source.name}</span>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {source.url}
                      </a>
                    )}
                    {source.credibility && (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] text-green-800">
                        নির্ভরযোগ্যতা: {source.credibility}%
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {news?.tags && news?.tags.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {news?.tags.map((tag, index) => (
                  <div
                    key={index}
                    // href={`/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                    className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm transition-colors"
                  >
                    #{tag}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
      <div className="hidden xl:col-span-3 xl:block 2xl:col-span-3">
        <RecentNewsSection />
      </div>
    </div>
  );
};

export default NewsDetailsSection;
