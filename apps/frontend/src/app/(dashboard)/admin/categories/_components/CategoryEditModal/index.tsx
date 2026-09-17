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
import { updateCategory } from "@/services/admin-category.service";
import type {
  TCategory,
  TCategoryUpdatePayload,
} from "@/types/admin-category.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

// Ported from apps/adminpanel's `components/modals/CategoryEditModal`.
// Compound `Modal.X` / `FormControl.X` dot-notation swapped for the flat
// named exports used in apps/frontend's UI kit, and the CRUD service
// swapped from `category.service` (public, read-only in apps/frontend) to
// `admin-category.service` (authenticated admin CRUD).
type CategoryEditModalProps = {
  default: Partial<TCategory>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  className?: string;
  mutationKey?: string[];
};

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
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
  } = useForm<TCategoryUpdatePayload>({
    defaultValues: {
      icon: category.icon || "",
      name: category?.name || "",
      slug: category?.slug || "",
      sequence: category?.sequence || 0,
      status: category?.status || "active",
      description: category?.description || "",
      is_featured: category?.is_featured || false,
      layout: category?.layout || "default",
    },
  });

  React.useEffect(() => {
    reset({
      icon: category.icon || "",
      name: category.name || "",
      slug: category.slug || "",
      sequence: category.sequence || 0,
      status: category.status || "active",
      description: category.description || "",
      is_featured: category.is_featured || false,
      layout: category.layout || "default",
    });
  }, [category, reset]);

  const mutation = useMutation({
    mutationFn: (data: TCategoryUpdatePayload) =>
      updateCategory(category._id!, data),
    onSuccess: (data) => {
      toast.success(data?.message || "Category updated successfully!");
      queryClient.invalidateQueries({ queryKey: key || [] });
      setIsOpen(false);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update category");
      console.error("Update Category Error:", error);
    },
  });

  const onSubmit = (data: TCategoryUpdatePayload) => {
    const updatedFields = Object.entries(data).reduce<
      Partial<TCategoryUpdatePayload>
    >((acc, [key, value]) => {
      const fieldKey = key as keyof TCategoryUpdatePayload;

      // Compare with current category value
      if (value !== category[fieldKey as keyof TCategory]) {
        (acc as any)[fieldKey] = value;
      }

      return acc;
    }, {});

    if (Object.keys(updatedFields).length === 0) {
      toast.info("No changes detected");
      return;
    }

    mutation.mutate(updatedFields);
  };

  const nameValue = watch("name");
  React.useEffect(() => {
    const slugValue = nameValue
      ?.toLowerCase()
      .toString()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[?#&=/\\]/g, "");

    setValue("slug", slugValue || category?.slug || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameValue, setValue]);

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <ModalBackdrop>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit Category</ModalTitle>
            <ModalCloseTrigger />
          </ModalHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className="grid gap-4">
              <div>
                <FormControlLabel>Icon (Optional)</FormControlLabel>
                <FormControl
                  type="text"
                  placeholder="e.g. Home, Settings"
                  {...register("icon")}
                />
                <FormControlHelper>
                  Enter a Lucide icon name (optional).
                </FormControlHelper>
              </div>

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

              <div>
                <FormControlLabel>Description (Optional)</FormControlLabel>
                <FormControl
                  as={"textarea"}
                  className="h-auto min-h-20 py-2"
                  placeholder="Category description"
                  {...register("description")}
                />
              </div>

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
                Update
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </ModalBackdrop>
    </Modal>
  );
};

export default CategoryEditModal;
