"use client";

import { useFormContext } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import RichTextEditor from "@/components/ui/RichTextEditor";
import type { NewsFormData } from "../schema";

// Ported from apps/adminpanel's
// news-articles-mutation-page/ContentEditor/index.tsx. Wraps the
// already-ported @/components/ui/RichTextEditor (BlockNote-based).
const ContentEditor = () => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<NewsFormData>();

  const contentValue = watch("content");

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Content *</CardTitle>
      </CardHeader>
      <CardContent>
        <RichTextEditor
          value={contentValue}
          onChange={(html) => {
            setValue("content", html);
          }}
          error={errors.content?.message}
          uploadFileCategory="news-content"
        />
      </CardContent>
    </Card>
  );
};

export default ContentEditor;
