import type { Response } from "./response.type";

// Mirrors apps/backend/src/modules/badge/badge.type.ts (TBadge) and
// badge.enum.ts (BadgeCategory / BadgeRarity / BadgeCriteriaType).
export type TBadgeCategory =
  | "reader"
  | "engagement"
  | "loyalty"
  | "contribution"
  | "achievement";

export type TBadgeRarity = "common" | "rare" | "epic" | "legendary";

export type TBadgeCriteriaType =
  | "articles_read"
  | "comments_posted"
  | "reading_streak"
  | "reputation_score"
  | "years_member"
  | "custom";

export type TBadgeCriteria = {
  type: TBadgeCriteriaType;
  threshold: number;
  description: string;
};

export type TBadge = {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: TBadgeCategory;
  criteria: TBadgeCriteria;
  rarity: TBadgeRarity;
  points: number;
  is_active: boolean;
  earned_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type TBadgeCreatePayload = {
  name: string;
  description: string;
  icon: string;
  category: TBadgeCategory;
  criteria: TBadgeCriteria;
  rarity?: TBadgeRarity;
  points?: number;
  is_active?: boolean;
};

export type TBadgeUpdatePayload = Partial<TBadgeCreatePayload>;

export type TBadgeAwardResponse = Response<TBadge[]>;
export type TBadgeResponse = Response<TBadge>;
export type TBadgesResponse = Response<TBadge[]>;
