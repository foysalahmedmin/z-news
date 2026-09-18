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
import { createNewsBreak } from "@/services/admin-news-break.service";
import type { TNewsBreak } from "@/types/admin-news-break.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

// Ported from apps/frontend's `admin/events/_components/EventAddModal`.
// The backend's `status` enum is `draft|pending|published|archived` (see
// `apps/backend/src/modules/news-break/news-break.model.ts`) — note this is
// narrower than the frontend's shared `TStatus` type (which also has
// "scheduled", used by other modules); only the 4 real backend values are
// offered here, since sending "scheduled" would 400.
type TNewsBreakStatus = "draft" | "pending" | "published" | "archived";

type TNewsBreakFormValues = {
  news: string;
  status: TNewsBreakStatus;
  published_at: string;
  expired_at?: string;
};

type NewsBreakAddModalProps = {
  default?: Partial<TNewsBreak>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  className?: string;
  mutationKey?: string[];
};

const NewsBreakAddModal: React.FC<NewsBreakAddModalProps> = ({
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
      news: newsBreak?.news || "",
      status: (newsBreak?.status as TNewsBreakStatus) || "draft",
      published_at: (newsBreak?.published_at
        ? new Date(newsBreak?.published_at)
        : new Date()
      )
        .toISOString()
        .slice(0, 16),
      ...(newsBreak?.expired_at && {
        expired_at: new Date(newsBreak?.expired_at).toISOString().slice(0, 16),
      }),
    },
  });

  const mutation = useMutation({
    mutationFn: createNewsBreak,
    onSuccess: (data) => {
      toast.success(data?.message || "News Break created successfully!");
      queryClient.invalidateQueries({ queryKey: key || [] });
      reset();
      setIsOpen(false);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(
        error.response?.data?.message || "Failed to create news break",
      );
      console.error("Create News Break Error:", error);
    },
  });

  const onSubmit = (data: TNewsBreakFormValues) => {
    mutation.mutate({
      ...data,
    });
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
            <ModalTitle>Add News Break</ModalTitle>
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
                Save
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </ModalBackdrop>
    </Modal>
  );
};

export default NewsBreakAddModal;
