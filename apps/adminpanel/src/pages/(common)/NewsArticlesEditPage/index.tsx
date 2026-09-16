import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { z } from "zod";

import ArticleDetails from "@/components/(common)/news-articles-mutation-page/ArticleDetails";
import CategoriesAndTags from "@/components/(common)/news-articles-mutation-page/CategoriesAndTags";
import ContentEditor from "@/components/(common)/news-articles-mutation-page/ContentEditor";
import PublishSettings from "@/components/(common)/news-articles-mutation-page/PublishSettings";
import Loader from "@/components/partials/Loader";
import PageHeader from "@/components/sections/PageHeader";
import { Button } from "@/components/ui/Button";
import useUser from "@/hooks/states/useUser";
import {
  createNewsBreak,
  deleteNewsBreak,
  updateNewsBreak,
} from "@/services/news-break.service";
import {
  createNewsHeadline,
  deleteNewsHeadline,
  updateNewsHeadline,
} from "@/services/news-headline.service";
import { fetchNews, updateNews, updateSelfNews } from "@/services/news.service";
import type { TStatus, TUpdateNewsPayload } from "@/types/news.type";
import { ArrowLeft, Eye } from "lucide-react";
import { useEffect } from "react";
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

const NewsArticlesUpdatePage = () => {
  const { id } = useParams();
  const { user } = useUser();
  const { info } = user || {};

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!info?._id) {
    navigate("/auth/signin");
  }

  // Fetch existing news data
  const { data: newsData, isLoading } = useQuery({
    queryKey: ["news", id],
    queryFn: () => fetchNews(id!),
    enabled: !!id,
  });

  const methods = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: "",
      sub_title: "",
      slug: "",
      description: "",
      content: "",
      category: "",
      status: "draft",
      layout: "default",
      is_featured: false,
      published_at: new Date(),
      tags: [],
      thumbnail: null,
      video: null,
      is_news_headline: false,
      is_news_break: false,
    },
  });

  // Reset form with fetched data
  useEffect(() => {
    if (newsData) {
      const { data } = newsData;
      methods.reset({
        title: data?.title,
        sub_title: data?.sub_title,
        slug: data?.slug,
        description: data?.description,
        content: data?.content,
        thumbnail: data?.thumbnail?._id || null,
        video: data?.video?._id || null,
        youtube: data?.youtube,
        tags: data?.tags,
        event: data?.event?._id,
        category: data?.category?._id,
        categories: data?.categories?.map((category) => category._id),
        writer: data?.writer,
        layout: data?.layout,
        status: data?.status,
        is_featured: data?.is_featured,
        published_at: data?.published_at
          ? new Date(data?.published_at)
          : undefined,
        expired_at: data?.expired_at ? new Date(data?.expired_at) : undefined,

        // strategic fields
        meta_title: data?.meta_title || "",
        meta_description: data?.meta_description || "",
        canonical_url: data?.canonical_url || "",
        content_type: data?.content_type || "article",
        sensitivity_level: data?.sensitivity_level || "public",
        fact_checked: !!data?.fact_checked,
        series: data?.series,
        related_articles: data?.related_articles?.map((r: any) =>
          typeof r === "string" ? r : r._id,
        ),
        // Headline and Break data will be populated separately
        is_news_headline: !!data?.news_headline,
        is_news_break: !!data?.news_break,
        headline_status: data?.news_headline?.status as TStatus | undefined,
        headline_published_at: data?.news_headline?.published_at
          ? new Date(data?.news_headline.published_at)
          : undefined,
        headline_expired_at: data?.news_headline?.expired_at
          ? new Date(data?.news_headline.expired_at)
          : undefined,
        break_status: data?.news_break?.status as TStatus | undefined,
        break_published_at: data?.news_break?.published_at
          ? new Date(data?.news_break.published_at)
          : undefined,
        break_expired_at: data?.news_break?.expired_at
          ? new Date(data?.news_break.expired_at)
          : undefined,
      });
    }
  }, [newsData, methods]);

  // TanStack Query mutation for update
  const updateNewsMutation = useMutation({
    mutationFn: async (
      data: TUpdateNewsPayload & {
        is_news_headline?: boolean;
        is_news_break?: boolean;
        headline_status?: string;
        headline_published_at?: Date;
        headline_expired_at?: Date;
        break_status?: string;
        break_published_at?: Date;
        break_expired_at?: Date;
      },
    ) => {
      // Update news first
      const newsResponse = ["super-admin", "admin"].includes(info?.role || "")
        ? await updateNews(id!, data)
        : await updateSelfNews(id!, data);

      const existingHeadline = newsData?.data?.news_headline;
      const existingBreak = newsData?.data?.news_break;

      // Handle headline update/create/delete
      if (data.is_news_headline) {
        const headlinePayload = {
          status: (data.headline_status as TStatus) || "draft",
          published_at: data.headline_published_at,
          expired_at: data.headline_expired_at,
        };

        if (existingHeadline?._id) {
          // Update existing headline
          try {
            await updateNewsHeadline(existingHeadline._id, headlinePayload);
          } catch {
            toast.error("News updated but failed to update headline");
          }
        } else {
          // Create new headline
          try {
            await createNewsHeadline({
              news: id!,
              ...headlinePayload,
            });
          } catch {
            toast.error("News updated but failed to create headline");
          }
        }
      } else if (existingHeadline?._id) {
        // Delete headline if checkbox is unchecked
        try {
          await deleteNewsHeadline(existingHeadline._id);
        } catch {
          toast.error("News updated but failed to delete headline");
        }
      }

      // Handle break update/create/delete
      if (data.is_news_break) {
        const breakPayload = {
          status: (data.break_status as TStatus) || "draft",
          published_at: data.break_published_at,
          expired_at: data.break_expired_at,
        };

        if (existingBreak?._id) {
          // Update existing break
          try {
            await updateNewsBreak(existingBreak._id, breakPayload);
          } catch {
            toast.error("News updated but failed to update break");
          }
        } else {
          // Create new break
          try {
            await createNewsBreak({
              news: id!,
              ...breakPayload,
            });
          } catch {
            toast.error("News updated but failed to create break");
          }
        }
      } else if (existingBreak?._id) {
        // Delete break if checkbox is unchecked
        try {
          await deleteNewsBreak(existingBreak._id);
        } catch {
          toast.error("News updated but failed to delete break");
        }
      }

      return newsResponse;
    },
    onSuccess: () => {
      toast.success("News article updated successfully");
      queryClient.invalidateQueries({ queryKey: ["news", id] });
      navigate(`/news-articles/${id}`);
    },
    onError: () => {
      toast.error("Failed to update news article");
    },
  });

  const onSubmit = async (data: NewsFormData) => {
    try {
      // Extract headline/break data
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

      const payload: TUpdateNewsPayload & {
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

      updateNewsMutation.mutate(payload);
    } catch {
      toast.error("Failed to update news article");
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const news = newsData?.data;

  return (
    <main className="space-y-6">
      <PageHeader
        name="Update News Article"
        breadcrumbs={[
          { name: "News Articles", path: "/news-articles" },
          { name: "Update News Article" },
        ]}
        slot={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => navigate(`/news-articles/${news?._id}`)}>
              <Eye className="h-4 w-4" />
              View
            </Button>
          </div>
        }
      />

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6">
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
              isLoading={updateNewsMutation.isPending}
              disabled={updateNewsMutation.isPending}
            >
              {updateNewsMutation.isPending ? "Updating..." : "Update Article"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </main>
  );
};

export default NewsArticlesUpdatePage;
