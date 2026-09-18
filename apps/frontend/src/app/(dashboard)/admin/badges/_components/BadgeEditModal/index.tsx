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
import { updateBadge } from "@/services/admin-badge.service";
import type { TBadge, TBadgeUpdatePayload } from "@/types/admin-badge.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

// Modeled on the categories admin's
// `admin/categories/_components/CategoryEditModal/index.tsx`. Unlike
// TCategoryUpdatePayload (all flat primitive fields), TBadgeUpdatePayload
// carries a nested `criteria` object — a shallow `value !== previous`
// per-field diff (as CategoryEditModal does) can't detect a real change
// inside that object, so this submits the full edited payload on every
// save instead of a computed partial. The backend's PATCH accepts a full
// or partial body either way (badge.validator.ts#updateBadgeSchema).
type BadgeEditModalProps = {
  default: Partial<TBadge>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  className?: string;
  mutationKey?: string[];
};

const CATEGORY_OPTIONS = [
  "reader",
  "engagement",
  "loyalty",
  "contribution",
  "achievement",
] as const;

const CRITERIA_TYPE_OPTIONS = [
  "articles_read",
  "comments_posted",
  "reading_streak",
  "reputation_score",
  "years_member",
  "custom",
] as const;

const RARITY_OPTIONS = ["common", "rare", "epic", "legendary"] as const;

const BadgeEditModal: React.FC<BadgeEditModalProps> = ({
  isOpen,
  setIsOpen,
  default: badge,
  mutationKey: key = ["badges"],
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TBadgeUpdatePayload>({
    defaultValues: {
      name: badge?.name || "",
      description: badge?.description || "",
      icon: badge?.icon || "",
      category: badge?.category || "reader",
      criteria: {
        type: badge?.criteria?.type || "articles_read",
        threshold: badge?.criteria?.threshold ?? 0,
        description: badge?.criteria?.description || "",
      },
      rarity: badge?.rarity || "common",
      points: badge?.points ?? 0,
      is_active: badge?.is_active ?? true,
    },
  });

  React.useEffect(() => {
    reset({
      name: badge?.name || "",
      description: badge?.description || "",
      icon: badge?.icon || "",
      category: badge?.category || "reader",
      criteria: {
        type: badge?.criteria?.type || "articles_read",
        threshold: badge?.criteria?.threshold ?? 0,
        description: badge?.criteria?.description || "",
      },
      rarity: badge?.rarity || "common",
      points: badge?.points ?? 0,
      is_active: badge?.is_active ?? true,
    });
  }, [badge, reset]);

  const mutation = useMutation({
    mutationFn: (data: TBadgeUpdatePayload) =>
      updateBadge(badge._id as string, data),
    onSuccess: (data) => {
      toast.success(data?.message || "Badge updated successfully!");
      queryClient.invalidateQueries({ queryKey: key || [] });
      setIsOpen(false);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update badge");
      console.error("Update Badge Error:", error);
    },
  });

  const onSubmit = (data: TBadgeUpdatePayload) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <ModalBackdrop>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit Badge</ModalTitle>
            <ModalCloseTrigger />
          </ModalHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className="grid gap-4">
              {/* Name */}
              <div>
                <FormControlLabel>Name</FormControlLabel>
                <FormControl
                  type="text"
                  placeholder="e.g. Top Commenter"
                  {...register("name", {
                    required: "Name is required",
                    maxLength: {
                      value: 100,
                      message: "Name cannot exceed 100 characters",
                    },
                  })}
                />
                {errors.name && (
                  <FormControlError>{errors.name.message}</FormControlError>
                )}
              </div>

              {/* Description */}
              <div>
                <FormControlLabel>Description</FormControlLabel>
                <FormControl
                  as={"textarea"}
                  className="h-auto min-h-20 py-2"
                  placeholder="Badge description"
                  {...register("description", {
                    required: "Description is required",
                    maxLength: {
                      value: 500,
                      message: "Description cannot exceed 500 characters",
                    },
                  })}
                />
                {errors.description && (
                  <FormControlError>
                    {errors.description.message}
                  </FormControlError>
                )}
              </div>

              {/* Icon */}
              <div>
                <FormControlLabel>Icon</FormControlLabel>
                <FormControl
                  type="text"
                  placeholder="e.g. 🏆"
                  {...register("icon", { required: "Icon is required" })}
                />
                {errors.icon && (
                  <FormControlError>{errors.icon.message}</FormControlError>
                )}
              </div>

              {/* Category */}
              <div>
                <FormControlLabel>Category</FormControlLabel>
                <FormControl
                  as="select"
                  className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
                  {...register("category", {
                    required: "Category is required",
                  })}
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option className="capitalize" key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </FormControl>
                {errors.category && (
                  <FormControlError>{errors.category.message}</FormControlError>
                )}
              </div>

              {/* Criteria Type */}
              <div>
                <FormControlLabel>Criteria Type</FormControlLabel>
                <FormControl
                  as="select"
                  className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
                  {...register("criteria.type", {
                    required: "Criteria type is required",
                  })}
                >
                  {CRITERIA_TYPE_OPTIONS.map((type) => (
                    <option className="capitalize" key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </FormControl>
                {errors.criteria?.type && (
                  <FormControlError>
                    {errors.criteria.type.message}
                  </FormControlError>
                )}
              </div>

              {/* Criteria Threshold */}
              <div>
                <FormControlLabel>Criteria Threshold</FormControlLabel>
                <FormControl
                  type="number"
                  placeholder="0"
                  {...register("criteria.threshold", {
                    required: "Threshold is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Threshold cannot be negative" },
                  })}
                />
                {errors.criteria?.threshold && (
                  <FormControlError>
                    {errors.criteria.threshold.message}
                  </FormControlError>
                )}
              </div>

              {/* Criteria Description */}
              <div>
                <FormControlLabel>Criteria Description</FormControlLabel>
                <FormControl
                  type="text"
                  placeholder="e.g. Read 10 articles"
                  {...register("criteria.description", {
                    required: "Criteria description is required",
                  })}
                />
                {errors.criteria?.description && (
                  <FormControlError>
                    {errors.criteria.description.message}
                  </FormControlError>
                )}
              </div>

              {/* Rarity */}
              <div>
                <FormControlLabel>Rarity</FormControlLabel>
                <FormControl
                  as="select"
                  className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
                  {...register("rarity")}
                >
                  {RARITY_OPTIONS.map((rarity) => (
                    <option className="capitalize" key={rarity} value={rarity}>
                      {rarity}
                    </option>
                  ))}
                </FormControl>
              </div>

              {/* Points */}
              <div>
                <FormControlLabel>Points</FormControlLabel>
                <FormControl
                  type="number"
                  placeholder="0"
                  {...register("points", {
                    valueAsNumber: true,
                    min: { value: 0, message: "Points cannot be negative" },
                  })}
                />
                {errors.points && (
                  <FormControlError>{errors.points.message}</FormControlError>
                )}
              </div>

              {/* Active */}
              <div>
                <label className="inline-flex items-center gap-2">
                  <input
                    className="accent-accent size-5"
                    type="checkbox"
                    id="is_active"
                    {...register("is_active")}
                  />
                  <span className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Active
                  </span>
                </label>
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

export default BadgeEditModal;
