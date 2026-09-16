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
  original_name: string;
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
  status: TStatus;
  is_featured?: boolean;
  published_at?: Date;
  expired_at?: Date;
  is_edited?: boolean;
  edited_at?: Date;
  layout?: string;

  // SEO Enhancement
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  structured_data?: Record<string, any>;

  // Content Classification
  content_type: TContentType;
  reading_time?: number;
  word_count?: number;

  // Editorial Metadata
  sensitivity_level: TSensitivityLevel;
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

  views?: number;
  likes?: number;
  dislikes?: number;
  comments?: number;
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
};

export type TNewsResponse = Response<TNews>;
export type TBulkNewsResponse = Response<TNews[]>;
