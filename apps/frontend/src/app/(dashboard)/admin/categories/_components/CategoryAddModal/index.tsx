"use client";

import { Button } from "@/components/ui/Button";
import {
  FormControl,
  FormControlError,
  FormControlHelper,
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
import { createCategory } from "@/services/admin-category.service";
import type {
  TCategory,
  TCategoryCreatePayload,
} from "@/types/admin-category.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

// Ported from apps/adminpanel's `components/modals/CategoryAddModal`.
// Compound `Modal.X` / `FormControl.X` dot-notation swapped for the flat
// named exports used in apps/frontend's UI kit, and the CRUD service
// swapped from `category.service` (public, read-only in apps/frontend) to
// `admin-category.service` (authenticated admin CRUD).
type CategoryAddModalProps = {
  default?: Partial<TCategory>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  className?: string;
  mutationKey?: string[];
};

const CategoryAddModal: React.FC<CategoryAddModalProps> = ({
  isOpen,
  setIsOpen,
  default: category,
  mutationKey: key = ["categories"],
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TCategoryCreatePayload>({
    defaultValues: {
      icon: category?.icon || "blocks",
      name: category?.name || "",
      slug: category?.slug || "",
      sequence: category?.sequence || 0,
      status: category?.status || "active",
      description: category?.description || "",
      is_featured: category?.is_featured || false,
      layout: category?.layout || "default",
    },
  });

  const mutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      toast.success(data?.message || "Category created successfully!");
      queryClient.invalidateQueries({ queryKey: key || [] });
      reset();
      setIsOpen(false);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to create category");
      console.error("Create Category Error:", error);
    },
  });

  const onSubmit = (data: TCategoryCreatePayload) => {
    mutation.mutate({
      ...(category?.category ? { category: category.category } : {}),
      ...data,
    });
  };

  // Auto-generate slug from name
  const nameValue = watch("name");
  React.useEffect(() => {
    const slugValue = nameValue
      ?.toLowerCase()
      .toString()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[?#&=/\\]/g, "");
    setValue("slug", slugValue);
  }, [nameValue, setValue]);

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <ModalBackdrop>
        <ModalContent>
          <ModalHeader>
            {/* Source checked truthiness of the whole `default` object
                (`category ? "Add Subcategory" : "Add Category"`), which is
                always a non-empty object at both call sites (list page
                passes `{ sequence }`, details page passes `{ category,
                sequence }`) — so the title read "Add Subcategory" even from
                the top-level list page. Checks `category?.category` (the
                parent id) instead, which is what the title is meant to
                reflect. */}
            <ModalTitle>
              {category?.category ? "Add Subcategory" : "Add Category"}
            </ModalTitle>
            <ModalCloseTrigger />
          </ModalHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className="grid gap-4">
              {/* Icon (Optional) */}
              <div>
                <FormControlLabel>Icon (Optional)</FormControlLabel>
                <FormControl
                  type="text"
                  placeholder="e.g. blocks, home"
                  {...register("icon")}
                />
                <FormControlHelper>
                  Enter a Lucide icon name (optional).
                </FormControlHelper>
              </div>

              {/* Name */}
              <div>
                <FormControlLabel>Name</FormControlLabel>
                <FormControl
                  type="text"
                  placeholder="Category name"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <FormControlError>{errors.name.message}</FormControlError>
                )}
              </div>

              {/* Slug */}
              <div>
                <FormControlLabel>Slug</FormControlLabel>
                <FormControl
                  type="text"
                  placeholder="category-slug"
                  {...register("slug", { required: "Slug is required" })}
                />
                {errors.slug && (
                  <FormControlError>{errors.slug.message}</FormControlError>
                )}
              </div>

              {/* Description (Optional) */}
              <div>
                <FormControlLabel>Description (Optional)</FormControlLabel>
                <FormControl
                  as={"textarea"}
                  className="h-auto min-h-20 py-2"
                  placeholder="Category description"
                  {...register("description")}
                />
              </div>

              {/* Sequence */}
              <div>
                <FormControlLabel>Sequence</FormControlLabel>
                <FormControl
                  type="number"
                  placeholder="0"
                  {...register("sequence", {
                    required: "Sequence is required",
                    valueAsNumber: true,
                  })}
                />
                {errors.sequence && (
                  <FormControlError>{errors.sequence.message}</FormControlError>
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </FormControl>
                {errors.status && (
                  <FormControlError>{errors.status.message}</FormControlError>
                )}
              </div>

              {/* Layout */}
              <div>
                <FormControlLabel>Layout</FormControlLabel>
                <FormControl
                  as="select"
                  className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
                  {...register("layout", { required: "Layout is required" })}
                >
                  <option value="">Select a layout</option>
                  {["default", "standard", "featured", "minimal"].map(
                    (layout) => (
                      <option
                        className="capitalize"
                        key={layout}
                        value={layout}
                      >
                        {layout}
                      </option>
                    ),
                  )}
                </FormControl>
                {errors.layout && (
                  <FormControlError>{errors.layout.message}</FormControlError>
                )}
              </div>

              {/* Featured */}
              <div>
                <label className="inline-flex items-center gap-2">
                  <input
                    className="accent-accent size-5"
                    type="checkbox"
                    id="is_featured"
                    {...register("is_featured")}
                  />
                  <span className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Featured
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
                Save
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </ModalBackdrop>
    </Modal>
  );
};

export default CategoryAddModal;
