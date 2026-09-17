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
import { fetchCategoriesTree } from "@/services/admin-category.service";
import { updateEvent } from "@/services/admin-event.service";
import type { TCategory } from "@/types/admin-category.type";
import type { TEvent, TEventUpdatePayload } from "@/types/admin-event.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

// Ported from apps/adminpanel's `components/modals/EventEditModal`. Compound
// `Modal.X` / `FormControl.X` dot-notation swapped for the flat named
// exports used in apps/frontend's UI kit, and the CRUD service swapped from
// `event.service` (public, read-only in apps/frontend) to
// `admin-event.service` (authenticated admin CRUD).
type EventEditModalProps = {
  default: Partial<TEvent>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  className?: string;
  mutationKey?: string[];
};

const renderCategoryOptions = (
  category?: TCategory,
  prefix = "",
): React.ReactNode => {
  if (!category) return null;
  return (
    <>
      <option key={category._id} value={category._id}>
        {prefix + category.name}
      </option>
      {category.children?.map((child) =>
        renderCategoryOptions(child, prefix + "-- "),
      )}
    </>
  );
};

const EventEditModal: React.FC<EventEditModalProps> = ({
  isOpen,
  setIsOpen,
  default: event,
  mutationKey: key = ["events"],
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TEventUpdatePayload>({
    defaultValues: {
      icon: event.icon || "",
      name: event?.name || "",
      slug: event?.slug || "",
      status: event?.status || "active",
      description: event?.description || "",
      is_featured: event?.is_featured || false,
      layout: event?.layout || "default",
      published_at: (event?.published_at
        ? new Date(event?.published_at)
        : new Date()
      )
        .toISOString()
        .slice(0, 16),
      ...(event?.expire_at && {
        expire_at: new Date(event?.expire_at).toISOString().slice(0, 16),
      }),
      ...(event?.category?._id && { category: event?.category?._id }),
    },
  });

  React.useEffect(() => {
    reset({
      icon: event.icon || "",
      name: event.name || "",
      slug: event.slug || "",
      status: event.status || "active",
      description: event.description || "",
      is_featured: event.is_featured || false,
      layout: event.layout || "default",
      published_at: (event?.published_at
        ? new Date(event?.published_at)
        : new Date()
      )
        .toISOString()
        .slice(0, 16),
      ...(event?.expire_at && {
        expire_at: new Date(event?.expire_at).toISOString().slice(0, 16),
      }),
      ...(event?.category?._id && { category: event?.category?._id }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, reset]);

  const mutation = useMutation({
    mutationFn: (data: TEventUpdatePayload) => updateEvent(event._id!, data),
    onSuccess: (data) => {
      toast.success(data?.message || "Event updated successfully!");
      queryClient.invalidateQueries({ queryKey: key || [] });
      setIsOpen(false);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update event");
      console.error("Update Event Error:", error);
    },
  });

  const onSubmit = (data: TEventUpdatePayload) => {
    const updatedFields = Object.entries(data).reduce<
      Partial<TEventUpdatePayload>
    >((acc, [key, value]) => {
      const fieldKey = key as keyof TEventUpdatePayload;

      // Compare with current event value
      if (value !== event[fieldKey as keyof TEvent]) {
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

    setValue("slug", slugValue || event?.slug || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameValue, setValue]);

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      fetchCategoriesTree({ sort: "sequence", limit: 25, status: "active" }),
  });

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <ModalBackdrop>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit Event</ModalTitle>
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
                  placeholder="Event name"
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
                  placeholder="event-slug"
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
                  placeholder="Event description"
                  {...register("description")}
                />
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

              {/* Category */}
              <div>
                <FormControlLabel htmlFor="category">
                  Category
                </FormControlLabel>
                <FormControl
                  as="select"
                  id="category"
                  {...register("category")}
                >
                  <option value="">Select a category</option>
                  {data?.data?.map((category) =>
                    renderCategoryOptions(category),
                  )}
                </FormControl>
              </div>

              {/* Add Layout field */}
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

              {/* Expire At */}
              <div>
                <FormControlLabel>Expire At (Optional)</FormControlLabel>
                <FormControl
                  type="datetime-local"
                  min={watch("published_at")}
                  {...register("expire_at", {
                    validate: (value) => {
                      if (!value) return true;
                      return (
                        new Date(value) >
                          new Date(watch("published_at") || "") ||
                        "Expire date must be after published date"
                      );
                    },
                  })}
                />
                {errors.expire_at && (
                  <FormControlError>
                    {errors.expire_at.message}
                  </FormControlError>
                )}
              </div>

              {/* Add Featured field */}
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

export default EventEditModal;
