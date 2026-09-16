import { Button } from "@/components/ui/Button";
import { FormControl } from "@/components/ui/FormControl";
import { Modal } from "@/components/ui/Modal";
import { fetchCategoriesTree } from "@/services/category.service";
import { updateEvent } from "@/services/event.service";
import type { TCategory } from "@/types/category.type";
import type { TEvent, TEventUpdatePayload } from "@/types/event.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

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
  }, [nameValue, setValue]);

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      fetchCategoriesTree({ sort: "sequence", limit: 25, status: "active" }),
  });

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <Modal.Backdrop>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Edit Event</Modal.Title>
            <Modal.Close />
          </Modal.Header>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Body className="grid gap-4">
              <div>
                <FormControl.Label>Icon (Optional)</FormControl.Label>
                <FormControl
                  type="text"
                  placeholder="e.g. Home, Settings"
                  {...register("icon")}
                />
                <FormControl.Helper>
                  Enter a Lucide icon name (optional).
                </FormControl.Helper>
              </div>

              <div>
                <FormControl.Label>Name</FormControl.Label>
                <FormControl
                  type="text"
                  placeholder="Event name"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <FormControl.Error>{errors.name.message}</FormControl.Error>
                )}
              </div>

              <div>
                <FormControl.Label>Slug</FormControl.Label>
                <FormControl
                  type="text"
                  placeholder="event-slug"
                  {...register("slug", { required: "Slug is required" })}
                />
                {errors.slug && (
                  <FormControl.Error>{errors.slug.message}</FormControl.Error>
                )}
              </div>

              <div>
                <FormControl.Label>Description (Optional)</FormControl.Label>
                <FormControl
                  as={"textarea"}
                  className="h-auto min-h-20 py-2"
                  placeholder="Event description"
                  {...register("description")}
                />
              </div>

              <div>
                <FormControl.Label>Status</FormControl.Label>
                <FormControl
                  as="select"
                  className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
                  {...register("status", { required: "Status is required" })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </FormControl>
                {errors.status && (
                  <FormControl.Error>{errors.status.message}</FormControl.Error>
                )}
              </div>

              {/* Category */}
              <div>
                <FormControl.Label htmlFor="category">
                  Category
                </FormControl.Label>
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
                <FormControl.Label>Layout</FormControl.Label>
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
                  <FormControl.Error>{errors.layout.message}</FormControl.Error>
                )}
              </div>

              {/* Published At */}
              <div>
                <FormControl.Label>Published At *</FormControl.Label>
                <FormControl
                  type="datetime-local"
                  {...register("published_at", {
                    required: "Published date is required",
                  })}
                />
                {errors.published_at && (
                  <FormControl.Error>
                    {errors.published_at.message}
                  </FormControl.Error>
                )}
              </div>

              {/* Expire At */}
              <div>
                <FormControl.Label>Expire At (Optional)</FormControl.Label>
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
                  <FormControl.Error>
                    {errors.expire_at.message}
                  </FormControl.Error>
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
            </Modal.Body>

            <Modal.Footer>
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
            </Modal.Footer>
          </form>
        </Modal.Content>
      </Modal.Backdrop>
    </Modal>
  );
};

export default EventEditModal;
