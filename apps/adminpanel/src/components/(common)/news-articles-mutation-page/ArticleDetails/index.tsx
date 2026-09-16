import { useFormContext } from "react-hook-form";

import { Card } from "@/components/ui/Card";
import { FormControl } from "@/components/ui/FormControl";
import { cn } from "@/lib/utils";
import type { NewsFormData } from "@/pages/(common)/NewsArticlesAddPage";
import FileFieldSelector from "./FileFieldSelector";

const ArticleDetails = () => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<NewsFormData>();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue("title", title);
    setValue("slug", generateSlug(title));
  };

  const generateSlug = (title: string): string => {
    if (!title) return "";
    const base = `${title
      .trim()
      .toLowerCase()
      .replace(/[?#&=/\\%]/g, "")}-${Date.now().toString(36)}`;
    return base
      .toString()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[?#&=/\\%]/g, "");
  };

  return (
    <Card>
      <Card.Header className="border-b">
        <Card.Title>Article Details</Card.Title>
      </Card.Header>
      <Card.Content className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4 self-stretch">
            <div>
              <FormControl.Label htmlFor="sub_title">
                Sub Head
              </FormControl.Label>
              <FormControl
                id="sub_title"
                placeholder="Enter head title"
                value={watch("sub_title")}
                onChange={(e) => setValue("sub_title", e.target.value)}
              />
            </div>

            <div>
              <FormControl.Label htmlFor="title">Title *</FormControl.Label>
              <FormControl
                id="title"
                placeholder="Enter title"
                value={watch("title")}
                onChange={handleTitleChange}
                className={cn(errors.title && "border-destructive")}
              />
              {errors.title && (
                <p className="text-destructive mt-1 text-sm">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <FormControl.Label htmlFor="slug">Slug *</FormControl.Label>
              <FormControl
                id="slug"
                placeholder="Enter slug"
                value={watch("slug")}
                onChange={(e) => setValue("slug", e.target.value)}
                className={cn(errors.slug && "border-destructive")}
              />
              {errors.slug && (
                <p className="text-destructive mt-1 text-sm">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div>
              <FormControl.Label htmlFor="description">
                Description
              </FormControl.Label>
              <FormControl
                as="textarea"
                className="h-20 py-2"
                placeholder="Enter description"
                id="description"
                value={watch("description")}
                onChange={(e) => setValue("description", e.target.value)}
              />
            </div>

            <div className="!mb-0">
              <FormControl.Label htmlFor="writer">Writer</FormControl.Label>
              <FormControl
                placeholder="Enter writer"
                id="writer"
                value={watch("writer")}
                onChange={(e) => setValue("writer", e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col space-y-4 self-stretch">
            <div className="h-full flex-1">
              <FileFieldSelector
                value={watch("thumbnail")}
                onChange={(value) =>
                  setValue("thumbnail", value as string | null)
                }
                label="Thumbnail"
                type="image"
                className="h-full"
              />
            </div>
            <div className="h-full flex-1">
              <FileFieldSelector
                value={watch("video")}
                onChange={(value) => setValue("video", value as string | null)}
                label="Video"
                type="video"
                className="h-full"
              />
            </div>
            <div>
              <FormControl.Label htmlFor="youtube">
                Youtube Video URL
              </FormControl.Label>
              <FormControl
                id="youtube"
                placeholder="Enter youtube video URL"
                value={watch("youtube")}
                onChange={(e) => setValue("youtube", e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default ArticleDetails;
