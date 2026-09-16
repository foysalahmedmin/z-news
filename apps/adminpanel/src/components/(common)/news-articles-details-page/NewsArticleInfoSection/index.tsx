import { ENV } from "@/config";
import type { TNews, TStatus } from "@/types/news.type";
import { getThumbnail } from "@/utils/getThumbnail";
import {
  Calendar,
  Earth,
  Edit2,
  Eye,
  EyeOff,
  Folder,
  Star,
  Tag,
  User,
} from "lucide-react";
import React from "react";
import { Link } from "react-router";

const getStatusColor = (status?: TStatus) => {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800 border-green-200";
    case "draft":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "pending":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status?: TStatus) => {
  switch (status) {
    case "published":
      return <Eye className="h-4 w-4" />;
    case "pending":
      return <EyeOff className="h-4 w-4" />;
    case "draft":
      return <Calendar className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

type NewsInfoSectionProps = {
  news?: Partial<TNews>;
};

const NewsArticleInfoSection: React.FC<NewsInfoSectionProps> = ({ news }) => {
  return (
    <div className="flex items-start space-x-4">
      {/* Thumbnail */}
      <Link to={ENV.app_url + "/news/" + news?.slug} className="flex-shrink-0">
        <img
          src={getThumbnail(news?.thumbnail?.url, news?.youtube)}
          alt={news?.title}
          className="size-32 rounded-md object-cover"
        />
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-2 space-x-2">
        {/* Title + Badges */}
        <div className="flex items-center space-x-2">
          <Link
            to={ENV.app_url + "/news/" + news?.slug}
            className="text-foreground text-2xl font-bold hover:underline"
          >
            {news?.title}
          </Link>
          {news?.is_featured && (
            <div className="flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-600">
              <Star className="size-4 fill-current" />
              Featured
            </div>
          )}
        </div>

        <div>
          {news?.published_at && (
            <span className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {new Date(news.published_at).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Meta Info */}
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center">
            <Tag className="mr-1 h-4 w-4" />
            {news?.slug}
          </span>
          {news?.category?.name && (
            <span className="flex items-center">
              <Folder className="mr-1 h-4 w-4" />
              {news?.category?.name}
            </span>
          )}
          {news?.author?.name && (
            <span className="flex items-center">
              <User className="mr-1 h-4 w-4" />
              {news?.author?.name}
            </span>
          )}
          {news?.writer && (
            <span className="flex items-center">
              <Edit2 className="mr-1 h-4 w-4" />
              {news?.writer}
            </span>
          )}
        </div>

        {/* Status */}
        <div
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(
            news?.status,
          )}`}
        >
          {getStatusIcon(news?.status)}
          <span className="ml-1 capitalize">{news?.status || "unknown"}</span>
        </div>
        <Link
          to={ENV.app_url + "/news/" + news?.slug}
          className={`inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800`}
        >
          <Earth className="h-4 w-4" />
          <span className="ml-1 capitalize">Preview</span>
        </Link>
      </div>
    </div>
  );
};

export default NewsArticleInfoSection;
