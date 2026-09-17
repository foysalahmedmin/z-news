"use client";

import type React from "react";
import { useFormContext } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FormControl, FormControlLabel } from "@/components/ui/FormControl";
import { cn } from "@/lib/utils";
import type { NewsFormData } from "../schema";
import FileFieldSelector from "./FileFieldSelector";

// Ported from apps/adminpanel's
// news-articles-mutation-page/ArticleDetails/index.tsx. Compound
// `Card.Header`/`Card.Title`/`Card.Content`/`FormControl.Label` -> flat
// imports.
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
      <CardHeader className="border-b">
        <CardTitle>Article Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4 self-stretch">
            <div>
              <FormControlLabel htmlFor="sub_title">
                Sub Head
              </FormControlLabel>
              <FormControl
                id="sub_title"
                placeholder="Enter head title"
                value={watch("sub_title")}
                onChange={(e) => setValue("sub_title", e.target.value)}
              />
            </div>

            <div>
              <FormControlLabel htmlFor="title">Title *</FormControlLabel>
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
              <FormControlLabel htmlFor="slug">Slug *</FormControlLabel>
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
              <FormControlLabel htmlFor="description">
                Description
              </FormControlLabel>
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
              <FormControlLabel htmlFor="writer">Writer</FormControlLabel>
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
              <FormControlLabel htmlFor="youtube">
                Youtube Video URL
              </FormControlLabel>
              <FormControl
                id="youtube"
                placeholder="Enter youtube video URL"
                value={watch("youtube")}
                onChange={(e) => setValue("youtube", e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleDetails;
