"use client";

import { Button } from "@/components/ui/Button";
import {
  FormControl,
  FormControlError,
  FormControlLabel,
} from "@/components/ui/FormControl";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseTrigger,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { fetchBulkNews } from "@/services/admin-news.service";
import { updateNewsHeadline } from "@/services/admin-news-headline.service";
import {
  NEWS_HEADLINE_STATUS_OPTIONS,
  type TNewsHeadline,
  type TNewsHeadlineStatus,
  type TStatus,
} from "@/types/admin-news-headline.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

// Ported from this app's own Events page's `EventEditModal`
// (apps/frontend's `(dashboard)/admin/events/_components/EventEditModal`),
// including its "diff before submit, toast if nothing changed" behavior.
type TNewsHeadlineFormValues = {
  news: string;
  status: TNewsHeadlineStatus;
  published_at?: string;
  expired_at?: string;
};

type NewsHeadlineEditModalProps = {
  default: Partial<TNewsHeadline>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  className?: string;
  mutationKey?: string[];
};

const NewsHeadlineEditModal: React.FC<NewsHeadlineEditModalProps> = ({
  isOpen,
  setIsOpen,
  default: newsHeadline,
  mutationKey: key = ["news-headlines"],
}) => {
  const queryClient = useQueryClient();

  const [newsSearchInput, setNewsSearchInput] = React.useState("");
  const [newsSearch, setNewsSearch] = React.useState("");

  React.useEffect(() => {
    const timeout = setTimeout(() => setNewsSearch(newsSearchInput), 400);
    return () => clearTimeout(timeout);
  }, [newsSearchInput]);

  const newsValue = newsHeadline?.news;
  const currentNewsOption =
    newsValue && typeof newsValue !== "string" ? newsValue : null;
  const currentNewsId =
    typeof newsValue === "string" ? newsValue : newsValue?._id || "";

  const buildDefaultValues = React.useCallback(
    (): TNewsHeadlineFormValues => ({
      news: currentNewsId,
      status: (newsHeadline?.status as TNewsHeadlineStatus) || "draft",
      ...(newsHeadline?.published_at && {
        published_at: new Date(newsHeadline.published_at)
          .toISOString()
          .slice(0, 16),
      }),
      ...(newsHeadline?.expired_at && {
        expired_at: new Date(newsHeadline.expired_at)
          .toISOString()
          .slice(0, 16),
      }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [newsHeadline],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TNewsHeadlineFormValues>({
    defaultValues: buildDefaultValues(),
  });

  React.useEffect(() => {
    reset(buildDefaultValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newsHeadline, reset]);

  const mutation = useMutation({
    mutationFn: (data: {
      news?: string;
      status?: TStatus;
      published_at?: string;
      expired_at?: string;
    }) => updateNewsHeadline(newsHeadline._id!, data),
    onSuccess: (data) => {
      toast.success(data?.message || "News Headline updated successfully!");
      queryClient.invalidateQueries({ queryKey: key || [] });
      setIsOpen(false);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(
        error.response?.data?.message || "Failed to update news headline",
      );
      console.error("Update News Headline Error:", error);
    },
  });

  const onSubmit = (data: TNewsHeadlineFormValues) => {
    const updatedFields: {
      news?: string;
      status?: TStatus;
      published_at?: string;
      expired_at?: string;
    } = {};

    if (data.news && data.news !== currentNewsId) {
      updatedFields.news = data.news;
    }
    if (data.status !== newsHeadline?.status) {
      updatedFields.status = data.status;
    }
    if (data.published_at) {
      updatedFields.published_at = data.published_at;
    }
    if (data.expired_at) {
      updatedFields.expired_at = data.expired_at;
    }

    if (Object.keys(updatedFields).length === 0) {
      toast.info("No changes detected");
      return;
    }

    mutation.mutate(updatedFields);
  };

  const { data: newsData, isLoading: isNewsLoading } = useQuery({
    queryKey: ["news-options", newsSearch],
    queryFn: () =>
      fetchBulkNews({
        limit: 20,
        sort: "-created_at",
        ...(newsSearch && { search: newsSearch }),
      }),
    enabled: isOpen,
  });

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <ModalBackdrop>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit News Headline</ModalTitle>
            <ModalCloseTrigger />
          </ModalHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className="grid gap-4">
              {/* News */}
              <div>
                <FormControlLabel htmlFor="news">
                  News Article
                </FormControlLabel>
                <FormControl
                  type="search"
                  placeholder="Search news articles..."
                  value={newsSearchInput}
                  onChange={(e) => setNewsSearchInput(e.target.value)}
                  className="mb-2"
                />
                <FormControl
                  as="select"
                  id="news"
                  {...register("news", {
                    required: "News article is required",
                  })}
                >
                  <option value="">
                    {isNewsLoading ? "Loading..." : "Select a news article"}
                  </option>
                  {currentNewsOption &&
                    !newsData?.data?.some(
                      (news) => news._id === currentNewsOption._id,
                    ) && (
                      <option value={currentNewsOption._id}>
                        {currentNewsOption.title}
                      </option>
                    )}
                  {newsData?.data?.map((news) => (
                    <option key={news._id} value={news._id}>
                      {news.title}
                    </option>
                  ))}
                </FormControl>
                {errors.news && (
                  <FormControlError>{errors.news.message}</FormControlError>
                )}
              </div>

              {/* Status */}
              <div>
                <FormControlLabel>Status</FormControlLabel>
                <FormControl
                  as="select"
                  className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
                  {...register("status", { required: "Status is required" })}
                >
                  {NEWS_HEADLINE_STATUS_OPTIONS.map((status) => (
                    <option
                      className="capitalize"
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </FormControl>
                {errors.status && (
                  <FormControlError>{errors.status.message}</FormControlError>
                )}
              </div>

              {/* Published At */}
              <div>
                <FormControlLabel>Published At (Optional)</FormControlLabel>
                <FormControl
                  type="datetime-local"
                  {...register("published_at", {
                    validate: (value) => {
                      if (!value && watch("status") === "published") {
                        return "Published date is required when status is published";
                      }
                      return true;
                    },
                  })}
                />
                {errors.published_at && (
                  <FormControlError>
                    {errors.published_at.message}
                  </FormControlError>
                )}
              </div>

              {/* Expired At */}
              <div>
                <FormControlLabel>Expired At (Optional)</FormControlLabel>
                <FormControl
                  type="datetime-local"
                  min={watch("published_at")}
                  {...register("expired_at", {
                    validate: (value) => {
                      if (!value) return true;
                      const publishedAt = watch("published_at");
                      if (!publishedAt) return true;
                      return (
                        new Date(value) >= new Date(publishedAt) ||
                        "Expired date cannot be before published date"
                      );
                    },
                  })}
                />
                {errors.expired_at && (
                  <FormControlError>
                    {errors.expired_at.message}
                  </FormControlError>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </ModalBackdrop>
    </Modal>
  );
};

export default NewsHeadlineEditModal;
