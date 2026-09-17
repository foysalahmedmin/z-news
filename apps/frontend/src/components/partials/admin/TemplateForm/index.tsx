"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

import Loader from "@/components/partials/admin/Loader";
import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  FormControl,
  FormControlError,
  FormControlLabel,
} from "@/components/ui/FormControl";
import { Switch } from "@/components/ui/Switch";
import { fetchCategories } from "@/services/admin-category.service";
import {
  createTemplate,
  fetchTemplate,
  updateTemplate,
} from "@/services/template.service";
import type { ErrorResponse } from "@/types/response.type";

// `Template.structure` / `Template.default_fields` are Mongoose `Mixed`
// fields with no fixed shape (see apps/backend's template.model.ts), and
// `TTemplate` in template.service.ts leaves them typed as `any`. Rather than
// build a schema-less form for arbitrary JSON, they're edited here as raw
// JSON text (via a `<textarea>`) and validated with a zod `.refine()` that
// checks `JSON.parse` succeeds; the parsed value is what's actually sent to
// the API on submit.
const jsonStringRefinement = (value: string | undefined) => {
  if (!value) return true;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  structure: z
    .string()
    .min(1, "Structure is required")
    .refine(jsonStringRefinement, "Structure must be valid JSON"),
  default_fields: z
    .string()
    .optional()
    .refine(jsonStringRefinement, "Default fields must be valid JSON"),
  is_active: z.boolean(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

type TemplateFormProps = {
  mode: "add" | "edit";
  /** Required when `mode === "edit"`. */
  templateId?: string;
};

const DEFAULT_STRUCTURE = "{\n  \n}";

const TemplateForm = ({ mode, templateId }: TemplateFormProps) => {
  const isEdit = mode === "edit";

  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch existing template data (edit mode only)
  const { data: templateData, isLoading } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => fetchTemplate(templateId!),
    enabled: isEdit && !!templateId,
  });

  // Populate the category dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => fetchCategories(),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      structure: DEFAULT_STRUCTURE,
      default_fields: "",
      is_active: true,
    },
  });

  // Reset form with fetched data (edit mode only)
  useEffect(() => {
    if (!isEdit || !templateData) return;

    const { data } = templateData;
    reset({
      name: data?.name || "",
      description: data?.description || "",
      category: data?.category?._id || "",
      structure: data?.structure
        ? JSON.stringify(data.structure, null, 2)
        : DEFAULT_STRUCTURE,
      default_fields: data?.default_fields
        ? JSON.stringify(data.default_fields, null, 2)
        : "",
      is_active: data?.is_active ?? true,
    });
  }, [isEdit, templateData, reset]);

  // TanStack Query mutation (create)
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createTemplate(payload),
    onSuccess: () => {
      toast.success("Template created successfully");
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      router.push("/admin/content-templates");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(
        error.response?.data?.message || "Failed to create template",
      );
    },
  });

  // TanStack Query mutation (update)
  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      updateTemplate(templateId!, payload),
    onSuccess: () => {
      toast.success("Template updated successfully");
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["template", templateId] });
      router.push("/admin/content-templates");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(
        error.response?.data?.message || "Failed to update template",
      );
    },
  });

  const onSubmit = (data: TemplateFormData) => {
    const payload: Record<string, unknown> = {
      name: data.name,
      description: data.description || undefined,
      category: data.category || undefined,
      structure: JSON.parse(data.structure),
      default_fields: data.default_fields
        ? JSON.parse(data.default_fields)
        : undefined,
      is_active: data.is_active,
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isEdit && isLoading) {
    return <Loader />;
  }

  const isPending = isEdit
    ? updateMutation.isPending
    : createMutation.isPending;
  const categories = categoriesData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader name={isEdit ? "Edit Template" : "Add Template"} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FormControlLabel htmlFor="name">Name *</FormControlLabel>
                <FormControl
                  id="name"
                  placeholder="Enter template name"
                  {...register("name")}
                />
                {errors.name && (
                  <FormControlError>{errors.name.message}</FormControlError>
                )}
              </div>

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
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </FormControl>
                {errors.category && (
                  <FormControlError>
                    {errors.category.message}
                  </FormControlError>
                )}
              </div>
            </div>

            <div>
              <FormControlLabel htmlFor="description">
                Description
              </FormControlLabel>
              <FormControl
                as="textarea"
                id="description"
                className="h-20 py-2"
                placeholder="Enter description"
                {...register("description")}
              />
              {errors.description && (
                <FormControlError>
                  {errors.description.message}
                </FormControlError>
              )}
            </div>

            <div>
              <FormControlLabel htmlFor="structure">
                Structure (JSON) *
              </FormControlLabel>
              <FormControl
                as="textarea"
                id="structure"
                className="h-40 py-2 font-mono text-xs"
                placeholder='{"sections": []}'
                {...register("structure")}
              />
              {errors.structure && (
                <FormControlError>{errors.structure.message}</FormControlError>
              )}
            </div>

            <div>
              <FormControlLabel htmlFor="default_fields">
                Default Fields (JSON)
              </FormControlLabel>
              <FormControl
                as="textarea"
                id="default_fields"
                className="h-32 py-2 font-mono text-xs"
                placeholder='{"title": ""}'
                {...register("default_fields")}
              />
              {errors.default_fields && (
                <FormControlError>
                  {errors.default_fields.message}
                </FormControlError>
              )}
            </div>

            <div>
              <Switch
                id="is_active"
                label="Active"
                checked={watch("is_active")}
                onChange={(checked) => setValue("is_active", checked)}
              />
            </div>
          </CardContent>
        </Card>

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
                : "Update Template"
              : isPending
                ? "Creating..."
                : "Create Template"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TemplateForm;
