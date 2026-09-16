import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import ArticleDetails from "@/components/(common)/news-articles-mutation-page/ArticleDetails";
import CategoriesAndTags from "@/components/(common)/news-articles-mutation-page/CategoriesAndTags";
import ContentEditor from "@/components/(common)/news-articles-mutation-page/ContentEditor";
import PublishSettings from "@/components/(common)/news-articles-mutation-page/PublishSettings";
import TemplateSelector from "@/components/(common)/news-articles-mutation-page/TemplateSelector";
import PageHeader from "@/components/sections/PageHeader";
import { Button } from "@/components/ui/Button";
import useUser from "@/hooks/states/useUser";
import { createNewsBreak } from "@/services/news-break.service";
import { createNewsHeadline } from "@/services/news-headline.service";
import { createNews } from "@/services/news.service";
import type { TCreateNewsPayload } from "@/types/news.type";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

// Updated schema matching backend validation
const newsSchema = z.object({
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

const NewsArticlesAddPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user.info?._id) {
    navigate("/auth/signin");
  }

  const methods = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: "",
      sub_title: "",
      slug: "",
      description: "",
      content: "",
      category: "",
      status: "published",
      layout: "default",
      is_featured: false,
      published_at: new Date(),
      tags: [],
      thumbnail: null,
      video: null,
      is_news_headline: false,
      is_news_break: false,
      content_type: "article",
      sensitivity_level: "public",
      fact_checked: false,
      meta_title: "",
      meta_description: "",
      canonical_url: "",
    },
  });

  // TanStack Query mutation
  const createNewsMutation = useMutation({
    mutationFn: async (data: TCreateNewsPayload) => {
      // Create news first
      const newsResponse = await createNews(data);
      const newsId = newsResponse?.data?._id;

      if (!newsId) {
        throw new Error("Failed to create news");
      }

      // Handle headline creation
      if (data.is_news_headline) {
        try {
          await createNewsHeadline({
            news: newsId,
            status: data.headline_status || "draft",
            published_at: data.headline_published_at,
            expired_at: data.headline_expired_at,
          });
        } catch {
          toast.error("News created but failed to create headline");
        }
      }

      // Handle break creation
      if (data.is_news_break) {
        try {
          await createNewsBreak({
            news: newsId,
            status: data.break_status || "draft",
            published_at: data.break_published_at,
            expired_at: data.break_expired_at,
          });
        } catch {
          toast.error("News created but failed to create break");
        }
      }

      return newsResponse;
    },
    onSuccess: (news) => {
      toast.success("News article created successfully");
      navigate(
        news?.data?._id
          ? `/news-articles/${news?.data?._id}`
          : `/news-articles`,
      );
    },
    onError: () => {
      toast.error("Failed to create news article");
    },
  });

  const onSubmit = async (data: NewsFormData) => {
    try {
      // Extract headline/break data before creating payload
      const {
        is_news_headline,
        is_news_break,
        headline_status,
        headline_published_at,
        headline_expired_at,
        break_status,
        break_published_at,
        break_expired_at,
        ...newsPayload
      } = data;

      const payload: TCreateNewsPayload & {
        is_news_headline?: boolean;
        is_news_break?: boolean;
        headline_status?: string;
        headline_published_at?: Date;
        headline_expired_at?: Date;
        break_status?: string;
        break_published_at?: Date;
        break_expired_at?: Date;
      } = {
        ...newsPayload,
        is_news_headline,
        is_news_break,
        headline_status,
        headline_published_at,
        headline_expired_at,
        break_status,
        break_published_at,
        break_expired_at,
      };

      createNewsMutation.mutate(payload);
    } catch {
      toast.error("Failed to create news article");
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        name="Add News Article"
        breadcrumbs={[
          { name: "News Articles", path: "/news-articles" },
          { name: "Add News Article" },
        ]}
      />

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6">
            <TemplateSelector />
            <ArticleDetails />
            <ContentEditor />
            <CategoriesAndTags />
            <PublishSettings />
          </div>

          <hr />

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              size={"lg"}
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size={"lg"}
              isLoading={createNewsMutation.isPending}
              disabled={createNewsMutation.isPending}
            >
              {createNewsMutation.isPending ? "Creating..." : "Create Article"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </main>
  );
};

export default NewsArticlesAddPage;
