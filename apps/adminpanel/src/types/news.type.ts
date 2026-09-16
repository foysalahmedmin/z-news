import type { Response } from "./response.type";

export type TStatus =
  | "draft"
  | "pending"
  | "scheduled"
  | "published"
  | "archived";

export type TContentType =
  | "article"
  | "video"
  | "podcast"
  | "live-blog"
  | "photo-essay";

export type TSensitivityLevel = "public" | "sensitive" | "restricted";

export type TFile = {
  _id: string;

  name: string;
  originalname: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  provider: "local" | "gcs";
  caption?: string;
  metadata: {
    path?: string;
    bucket?: string;
    extension?: string;
    file_type?: string;
  };
  author?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
};

export type TNews = {
  _id: string;
  title: string;
  sub_title?: string;
  slug: string;
  description?: string;
  content: string;
  thumbnail?: TFile;
  video?: TFile;
  youtube?: string;
  tags?: string[];
  event?: {
    _id: string;
    name: string;
    slug: string;
  };
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  categories?: {
    _id: string;
    name: string;
    slug: string;
  }[];
  author: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  writer?: string;
  layout?: "default" | "standard" | "featured" | "minimal";
  status?: TStatus;
  is_featured: boolean;
  published_at?: Date;
  expired_at?: Date;
  is_edited?: boolean;
  edited_at?: Date;
  created_at?: string;
  updated_at?: string;

  // SEO Enhancement
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  structured_data?: Record<string, any>;

  // Content Classification
  content_type?: TContentType;
  reading_time?: number;
  word_count?: number;

  // Editorial Metadata
  sensitivity_level?: TSensitivityLevel;
  fact_checked?: boolean;
  fact_checker?: {
    _id: string;
    name: string;
    email: string;
  };
  sources?: { name: string; url?: string; credibility?: number }[];

  // Engagement Optimization
  push_notification_sent?: boolean;
  newsletter_included?: boolean;
  social_media_posts?: { platform: string; post_id: string; posted_at: Date }[];

  // Geographic Targeting
  geo_targeting?: {
    countries?: string[];
    regions?: string[];
    cities?: string[];
  };

  // Multimedia
  gallery?: TFile[];
  audio?: TFile;
  podcast_episode?: string;
  infographics?: TFile[];

  // Related Content
  related_articles?: string[] | TNews[];
  series?: string;

  // Performance Metrics
  avg_time_on_page?: number;
  bounce_rate?: number;
  scroll_depth?: number;
  share_count?: number;

  news_headline?: {
    _id: string;
    status: TStatus;
    published_at?: Date;
    expired_at?: Date;
  };
  news_break?: {
    _id: string;
    status: TStatus;
    published_at?: Date;
    expired_at?: Date;
  };
  is_news_headline?: boolean;
  is_news_break?: boolean;
  views?: number;
  likes?: number;
  dislikes?: number;
  comments?: number;
};

export type TArticleVersion = {
  _id: string;
  news: string;
  version_number: number;
  content_snapshot: string;
  metadata_snapshot: Record<string, any>;
  changed_by: {
    _id: string;
    name: string;
    email: string;
  };
  change_summary?: string;
  created_at: string;
};

export type TCreateNewsPayload = {
  title: string;
  sub_title?: string;
  slug: string;
  description?: string;
  content: string; // html string
  thumbnail?: string | null; // File ObjectId
  video?: string | null; // File ObjectId
  youtube?: string;
  tags?: string[];
  event?: string;
  category?: string;
  categories?: string[];
  writer?: string;
  layout?: string;
  status?: TStatus;
  is_featured?: boolean;
  published_at?: Date;
  expired_at?: Date;
  is_news_headline?: boolean;
  is_news_break?: boolean;
  headline_status?: TStatus;
  headline_published_at?: Date;
  headline_expired_at?: Date;
  break_status?: TStatus;
  break_published_at?: Date;
  break_expired_at?: Date;
};

export type TUpdateNewsPayload = {
  title?: string;
  sub_title?: string;
  slug?: string;
  description?: string;
  content?: string;
  thumbnail?: string | null; // File ObjectId
  video?: string | null; // File ObjectId
  youtube?: string;
  tags?: string[];
  event?: string;
  category?: string;
  categories?: string[];
  writer?: string;
  layout?: string;
  status?: TStatus;
  is_featured?: boolean;
  published_at?: string | Date;
  expired_at?: string | Date;
};

export type TBulkUpdatePayload = {
  ids: string[];
  status?: TStatus;
};

export type TNewsFileResponse = Response<{
  type: "image" | "video" | "audio" | "file";
  filename: string;
  path: string;
  url: string;
}>;
export type TNewsResponse = Response<TNews>;
export type TBulkNewsResponse = Response<TNews[]>;
