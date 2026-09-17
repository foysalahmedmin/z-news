import { z } from "zod";

// Ported verbatim from apps/adminpanel's NewsArticlesAddPage/index.tsx and
// NewsArticlesEditPage/index.tsx (both pages defined the exact same schema).
// Shared here so the Add/Edit forms and every subsection reference a single
// source of truth for `NewsFormData`.
export const newsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  sub_title: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().max(3000).optional(),
  content: z.string().min(1, "Content is required"),
  thumbnail: z.string().nullable().optional(),
  video: z.string().nullable().optional(),
  youtube: z.string().optional(),
  tags: z.array(z.string()).optional(),
  event: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  categories: z.array(z.string()).optional(),
  writer: z.string().optional(),
  layout: z.enum(["default", "standard", "featured", "minimal"]).optional(),
  status: z
    .enum(["draft", "pending", "scheduled", "published", "archived"])
    .optional(),
  is_featured: z.boolean(),
  published_at: z.date().optional(),
  expired_at: z.date().optional(),

  // strategic fields
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  canonical_url: z.string().url().optional().or(z.literal("")),
  content_type: z
    .enum(["article", "video", "podcast", "live-blog", "photo-essay"])
    .optional(),
  sensitivity_level: z.enum(["public", "sensitive", "restricted"]).optional(),
  fact_checked: z.boolean().optional(),
  related_articles: z.array(z.string()).optional(),
  series: z.string().optional(),
  // Headline and Break fields (for separate collections)
  is_news_headline: z.coerce.boolean().optional(),
  is_news_break: z.coerce.boolean().optional(),
  headline_status: z
    .enum(["draft", "pending", "published", "archived"])
    .optional(),
  headline_published_at: z.date().optional(),
  headline_expired_at: z.date().optional(),
  break_status: z
    .enum(["draft", "pending", "published", "archived"])
    .optional(),
  break_published_at: z.date().optional(),
  break_expired_at: z.date().optional(),
});

export type NewsFormData = z.infer<typeof newsSchema>;
