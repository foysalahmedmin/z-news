import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";

import { Card } from "@/components/ui/Card";
import { FormControl } from "@/components/ui/FormControl";
import { cn } from "@/lib/utils";
import type { NewsFormData } from "@/pages/(common)/NewsArticlesAddPage";
import { fetchCategoriesTree } from "@/services/category.service";
import { fetchEvents } from "@/services/event.service";
import type { TCategory } from "@/types/category.type";
import AdditionalCategoriesInput from "../AdditionalCategoriesInput";
import TagsInput from "../TagsInput";

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
      <Card.Header className="border-b">
        <Card.Title>Categories, Events & Tags</Card.Title>
      </Card.Header>
      <Card.Content className="space-y-4">
        <div>
          <FormControl.Label htmlFor="category">Category *</FormControl.Label>
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
          <FormControl.Label htmlFor="event">Event</FormControl.Label>
          <FormControl
            as="select"
            id="event"
            value={watch("event")}
            onChange={(e) => setValue("event", e.target.value)}
          >
            <option value="">Select a event</option>
            {eventData?.data?.map((event) => (
              <option value={event._id}>{event.name}</option>
            ))}
          </FormControl>
        </div>

        <TagsInput name="tags" label="Tags" placeholder="Add tag" />

        <div>
          <FormControl.Label htmlFor="layout">Layout</FormControl.Label>
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
      </Card.Content>
    </Card>
  );
};

export default CategoriesAndTags;
