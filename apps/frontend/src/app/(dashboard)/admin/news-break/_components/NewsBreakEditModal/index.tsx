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
import { updateNewsBreak } from "@/services/admin-news-break.service";
import type { TNewsBreak } from "@/types/admin-news-break.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

// Ported from apps/frontend's `admin/events/_components/EventEditModal`. See
// NewsBreakAddModal for why only 4 of `TStatus`'s 5 values are offered.
type TNewsBreakStatus = "draft" | "pending" | "published" | "archived";

type TNewsBreakFormValues = {
  news: string;
  status: TNewsBreakStatus;
  published_at: string;
  expired_at?: string;
};

type NewsBreakEditModalProps = {
  default: Partial<TNewsBreak>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  className?: string;
  mutationKey?: string[];
};

// `news-break.repository.ts` populates `news` with `{_id, title, slug}` on
// every read, even though `TNewsBreak.news` is typed as a plain string
// ObjectId — normalize either shape down to the raw id for the select.
const getNewsId = (news: unknown): string => {
  if (!news) return "";
  if (typeof news === "object" && news !== null && "_id" in news) {
    return String((news as { _id: string })._id);
  }
  return String(news);
};

const toDateTimeLocal = (value?: Date | string) =>
  value ? new Date(value).toISOString().slice(0, 16) : undefined;

const NewsBreakEditModal: React.FC<NewsBreakEditModalProps> = ({
  isOpen,
  setIsOpen,
  default: newsBreak,
  mutationKey: key = ["news-breaks"],
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TNewsBreakFormValues>({
    defaultValues: {
      news: getNewsId(newsBreak?.news),
      status: (newsBreak?.status as TNewsBreakStatus) || "draft",
      published_at:
        toDateTimeLocal(newsBreak?.published_at) ||
        new Date().toISOString().slice(0, 16),
      ...(newsBreak?.expired_at && {
        expired_at: toDateTimeLocal(newsBreak?.expired_at),
      }),
    },
  });

  React.useEffect(() => {
    reset({
      news: getNewsId(newsBreak?.news),
      status: (newsBreak?.status as TNewsBreakStatus) || "draft",
      published_at:
        toDateTimeLocal(newsBreak?.published_at) ||
        new Date().toISOString().slice(0, 16),
      ...(newsBreak?.expired_at && {
        expired_at: toDateTimeLocal(newsBreak?.expired_at),
      }),
    });
  }, [newsBreak, reset]);

  const mutation = useMutation({
    mutationFn: (data: Partial<TNewsBreakFormValues>) =>
      updateNewsBreak(newsBreak._id!, data),
    onSuccess: (data) => {
      toast.success(data?.message || "News Break updated successfully!");
      queryClient.invalidateQueries({ queryKey: key || [] });
      setIsOpen(false);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(
        error.response?.data?.message || "Failed to update news break",
      );
      console.error("Update News Break Error:", error);
    },
  });

  const onSubmit = (data: TNewsBreakFormValues) => {
    const currentValues: Record<string, unknown> = {
      news: getNewsId(newsBreak?.news),
      status: newsBreak?.status,
      published_at:
        toDateTimeLocal(newsBreak?.published_at) ||
        new Date().toISOString().slice(0, 16),
      expired_at: toDateTimeLocal(newsBreak?.expired_at),
    };

    const updatedFields = Object.entries(data).reduce<
      Partial<TNewsBreakFormValues>
    >((acc, [key, value]) => {
      const fieldKey = key as keyof TNewsBreakFormValues;

      if (value !== currentValues[fieldKey]) {
        (acc as Record<string, unknown>)[fieldKey] = value;
      }

      return acc;
    }, {});

    if (Object.keys(updatedFields).length === 0) {
      toast.info("No changes detected");
      return;
    }

    mutation.mutate(updatedFields);
  };

  const { data: newsOptions } = useQuery({
    queryKey: ["news-select-options"],
    queryFn: () => fetchBulkNews({ limit: 100, sort: "-created_at" }),
  });

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <ModalBackdrop>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit News Break</ModalTitle>
            <ModalCloseTrigger />
          </ModalHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className="grid gap-4">
              {/* News */}
              <div>
                <FormControlLabel htmlFor="news">News</FormControlLabel>
                <FormControl
                  as="select"
                  id="news"
                  className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
                  {...register("news", { required: "News article is required" })}
                >
                  <option value="">Select a news article</option>
                  {newsOptions?.data?.map((news) => (
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
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </FormControl>
                {errors.status && (
                  <FormControlError>{errors.status.message}</FormControlError>
                )}
              </div>

              {/* Published At */}
              <div>
                <FormControlLabel>Published At *</FormControlLabel>
                <FormControl
                  type="datetime-local"
                  {...register("published_at", {
                    required: "Published date is required",
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
                      return (
                        new Date(value) >
                          new Date(watch("published_at") || "") ||
                        "Expired date must be after published date"
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

export default NewsBreakEditModal;
