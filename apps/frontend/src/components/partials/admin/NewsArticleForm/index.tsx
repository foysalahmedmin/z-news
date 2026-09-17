"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Loader from "@/components/partials/admin/Loader";
import { Button } from "@/components/ui/Button";
import useUser from "@/hooks/states/useUser";
import {
  createNewsBreak,
  deleteNewsBreak,
  updateNewsBreak,
} from "@/services/admin-news-break.service";
import {
  createNewsHeadline,
  deleteNewsHeadline,
  updateNewsHeadline,
} from "@/services/admin-news-headline.service";
import {
  createNews,
  fetchNews,
  updateNews,
  updateSelfNews,
} from "@/services/admin-news.service";
import type {
  TCreateNewsPayload,
  TStatus,
  TUpdateNewsPayload,
} from "@/types/admin-news.type";

import ArticleDetails from "./ArticleDetails";
import CategoriesAndTags from "./CategoriesAndTags";
import ContentEditor from "./ContentEditor";
import PublishSettings from "./PublishSettings";
import { newsSchema, type NewsFormData } from "./schema";
import TemplateSelector from "./TemplateSelector";

// Ported from apps/adminpanel's NewsArticlesAddPage/index.tsx and
// NewsArticlesEditPage/index.tsx. Both source pages defined the exact same
// zod schema and rendered the same 5 subsections (TemplateSelector is
// Add-only) inside their own `<form>` -- the only real differences were the
// mutation (create vs. update+headline/break sync), the default values, and
// the submit copy. That's consolidated here as a single `mode` prop so
// apps/frontend's add/page.tsx and edit/[id]/page.tsx can both render this
// one component instead of duplicating ~250 lines of form wiring.
type NewsHeadlineBreakFields = {
  is_news_headline?: boolean;
  is_news_break?: boolean;
  headline_status?: TStatus;
  headline_published_at?: Date;
  headline_expired_at?: Date;
  break_status?: TStatus;
  break_published_at?: Date;
  break_expired_at?: Date;
};

type NewsArticleFormProps = {
  mode: "add" | "edit";
  /** Required when `mode === "edit"`. */
  newsId?: string;
};

const NewsArticleForm = ({ mode, newsId }: NewsArticleFormProps) => {
  const isEdit = mode === "edit";

  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch existing news data (edit mode only)
  const { data: newsData, isLoading } = useQuery({
    queryKey: ["news", newsId],
    queryFn: () => fetchNews(newsId!),
    enabled: isEdit && !!newsId,
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
      status: isEdit ? "draft" : "published",
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

  // Reset form with fetched data (edit mode only)
  useEffect(() => {
    if (!isEdit || !newsData) return;

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
      related_articles: data?.related_articles?.map((r) =>
        typeof r === "string" ? r : r._id,
      ),
      // Headline and Break data
      is_news_headline: !!data?.news_headline,
      is_news_break: !!data?.news_break,
      headline_status: data?.news_headline?.status as
        | NewsFormData["headline_status"]
        | undefined,
      headline_published_at: data?.news_headline?.published_at
        ? new Date(data?.news_headline.published_at)
        : undefined,
      headline_expired_at: data?.news_headline?.expired_at
        ? new Date(data?.news_headline.expired_at)
        : undefined,
      break_status: data?.news_break?.status as
        | NewsFormData["break_status"]
        | undefined,
      break_published_at: data?.news_break?.published_at
        ? new Date(data?.news_break.published_at)
        : undefined,
      break_expired_at: data?.news_break?.expired_at
        ? new Date(data?.news_break.expired_at)
        : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, newsData]);

  // TanStack Query mutation (create)
  const createNewsMutation = useMutation({
    mutationFn: async (data: TCreateNewsPayload & NewsHeadlineBreakFields) => {
      // Create news first
      const newsResponse = await createNews(data);
      const createdId = newsResponse?.data?._id;

      if (!createdId) {
        throw new Error("Failed to create news");
      }

      // Handle headline creation
      if (data.is_news_headline) {
        try {
          await createNewsHeadline({
            news: createdId,
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
            news: createdId,
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
      router.push(
        news?.data?._id
          ? `/admin/news-articles/${news?.data?._id}`
          : `/admin/news-articles`,
      );
    },
    onError: () => {
      toast.error("Failed to create news article");
    },
  });

  // TanStack Query mutation (update)
  const updateNewsMutation = useMutation({
    mutationFn: async (data: TUpdateNewsPayload & NewsHeadlineBreakFields) => {
      // Update news first
      const role = user?.info?.role;
      const newsResponse =
        role && ["super-admin", "admin"].includes(role)
          ? await updateNews(newsId!, data)
          : await updateSelfNews(newsId!, data);

      const existingHeadline = newsData?.data?.news_headline;
      const existingBreak = newsData?.data?.news_break;

      // Handle headline update/create/delete
      if (data.is_news_headline) {
        const headlinePayload = {
          status: data.headline_status || "draft",
          published_at: data.headline_published_at,
          expired_at: data.headline_expired_at,
        };

        if (existingHeadline?._id) {
          try {
            await updateNewsHeadline(existingHeadline._id, headlinePayload);
          } catch {
            toast.error("News updated but failed to update headline");
          }
        } else {
          try {
            await createNewsHeadline({
              news: newsId!,
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
          status: data.break_status || "draft",
          published_at: data.break_published_at,
          expired_at: data.break_expired_at,
        };

        if (existingBreak?._id) {
          try {
            await updateNewsBreak(existingBreak._id, breakPayload);
          } catch {
            toast.error("News updated but failed to update break");
          }
        } else {
          try {
            await createNewsBreak({
              news: newsId!,
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
      queryClient.invalidateQueries({ queryKey: ["news", newsId] });
      router.push(`/admin/news-articles/${newsId}`);
    },
    onError: () => {
      toast.error("Failed to update news article");
    },
  });

  const onSubmit = (data: NewsFormData) => {
    // Extract headline/break data before creating the payload
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

    const headlineBreakFields: NewsHeadlineBreakFields = {
      is_news_headline,
      is_news_break,
      headline_status,
      headline_published_at,
      headline_expired_at,
      break_status,
      break_published_at,
      break_expired_at,
    };

    if (isEdit) {
      updateNewsMutation.mutate({ ...newsPayload, ...headlineBreakFields });
    } else {
      createNewsMutation.mutate({ ...newsPayload, ...headlineBreakFields });
    }
  };

  if (isEdit && isLoading) {
    return <Loader />;
  }

  const isPending = isEdit
    ? updateNewsMutation.isPending
    : createNewsMutation.isPending;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6">
          {!isEdit && <TemplateSelector />}
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
            size="lg"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            isLoading={isPending}
            disabled={isPending}
          >
            {isEdit
              ? isPending
                ? "Updating..."
                : "Update Article"
              : isPending
                ? "Creating..."
                : "Create Article"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default NewsArticleForm;
