"use client";

import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { useFormContext } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FormControl, FormControlLabel } from "@/components/ui/FormControl";
import { cn } from "@/lib/utils";
import { fetchCategoriesTree } from "@/services/admin-category.service";
import { fetchEvents } from "@/services/admin-event.service";
import type { TCategory } from "@/types/admin-category.type";
import type { NewsFormData } from "../schema";
import AdditionalCategoriesInput from "../AdditionalCategoriesInput";
import TagsInput from "../TagsInput";

// Ported from apps/adminpanel's
// news-articles-mutation-page/CategoriesAndTags/index.tsx.
// `category.service`/`event.service` (public in this app) ->
// `admin-category.service`/`admin-event.service` (authenticated admin CRUD).
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

const CategoriesAndTags = () => {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<NewsFormData>();
  const layout = watch("layout");

  const { data: eventData } = useQuery({
    queryKey: ["events"],
    queryFn: () =>
      fetchEvents({ sort: "-published_at", limit: 25, status: "active" }),
  });

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      fetchCategoriesTree({ sort: "sequence", limit: 25, status: "active" }),
  });

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Categories, Events & Tags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <FormControlLabel htmlFor="category">Category *</FormControlLabel>
          <FormControl
            as="select"
            id="category"
            value={watch("category")}
            onChange={(e) => setValue("category", e.target.value)}
            className={cn(errors.category && "border-destructive")}
          >
            <option value="">Select a category</option>
            {data?.data?.map((category) => renderCategoryOptions(category))}
          </FormControl>
          {errors.category && (
            <p className="text-destructive mt-1 text-sm">
              {errors.category.message}
            </p>
          )}
        </div>

        <AdditionalCategoriesInput />

        <div>
          <FormControlLabel htmlFor="event">Event</FormControlLabel>
          <FormControl
            as="select"
            id="event"
            value={watch("event")}
            onChange={(e) => setValue("event", e.target.value)}
          >
            <option value="">Select a event</option>
            {eventData?.data?.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name}
              </option>
            ))}
          </FormControl>
        </div>

        <TagsInput name="tags" label="Tags" placeholder="Add tag" />

        <div>
          <FormControlLabel htmlFor="layout">Layout</FormControlLabel>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
            {["default", "standard", "featured", "minimal"].map(
              (layoutOption) => (
                <div
                  key={layoutOption}
                  className={cn(
                    "cursor-pointer rounded-md border p-2 text-center",
                    layout === layoutOption
                      ? "border-primary bg-primary/10"
                      : "border-muted",
                  )}
                  onClick={() =>
                    setValue(
                      "layout",
                      layoutOption as
                        | "default"
                        | "standard"
                        | "featured"
                        | "minimal",
                    )
                  }
                >
                  <div className="font-medium capitalize">{layoutOption}</div>
                </div>
              ),
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesAndTags;
