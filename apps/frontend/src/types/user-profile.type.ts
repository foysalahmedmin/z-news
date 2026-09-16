import type { TUser } from "./user.type";

export type TBadge = {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  points: number;
};

export type TUserBadge = {
  badge_id: TBadge;
  earned_at: string;
};

export type TNotificationPreferences = {
  email_notifications: boolean;
  push_notifications: boolean;
  comment_replies: boolean;
  article_updates: boolean;
  newsletter: boolean;
};

export type TUserProfile = {
  _id: string;
  user: TUser;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };

  // Reputation
  reputation_score: number;
  badges: TUserBadge[];

  // Activity Stats
  total_comments: number;
  total_reactions: number;
  articles_read: number;
  reading_streak: number;
  last_read_at?: string;

  // Preferences
  notification_preferences?: TNotificationPreferences;
  email_frequency?: "instant" | "daily" | "weekly" | "never";

  // Following
  following_authors: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  }[];
  following_categories: { _id: string; name: string; slug: string }[];
  following_topics: string[];

  // Flags
  is_verified_reader: boolean;
  is_premium: boolean;

  // Virtual
  follower_count?: number;

  created_at?: string;
  updated_at?: string;
};
