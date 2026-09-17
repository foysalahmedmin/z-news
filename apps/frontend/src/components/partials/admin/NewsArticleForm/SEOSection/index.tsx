"use client";

import { useFormContext } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FormControl, FormControlLabel } from "@/components/ui/FormControl";
import type { NewsFormData } from "../schema";
import ImageUpload from "../ImageUpload";
import TagsInput from "../TagsInput";

// Ported from apps/adminpanel's
// news-articles-mutation-page/SEOSection/index.tsx. Not wired into the main
// NewsArticleForm -- the source's Add/Edit pages never imported this
// component either -- kept here for parity with the 9 ported subsections.
const SEOSection = () => {
  const { watch, setValue } = useFormContext<NewsFormData>();

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>SEO Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4 self-stretch">
            <div>
              <FormControlLabel htmlFor="seo-title">
                SEO Title
              </FormControlLabel>
              <FormControl
                id="seo-title"
                placeholder="SEO Title"
                value={watch("seo.title" as any)}
                onChange={(e) => setValue("seo.title" as any, e.target.value)}
              />
            </div>

            <div>
              <FormControlLabel htmlFor="seo-description">
                SEO Description
              </FormControlLabel>
              <FormControl
                className="h-20 py-2"
                placeholder="SEO Description"
                as="textarea"
                id="seo-description"
                value={watch("seo.description" as any)}
                onChange={(e) =>
                  setValue("seo.description" as any, e.target.value)
                }
              />
            </div>

            <TagsInput
              name="seo.keywords"
              label="SEO Keywords"
              placeholder="Add keyword"
            />
          </div>
          <div className="flex flex-col self-stretch">
            <ImageUpload
              className="flex-1"
              name="seo.image"
              label="SEO Image"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SEOSection;
