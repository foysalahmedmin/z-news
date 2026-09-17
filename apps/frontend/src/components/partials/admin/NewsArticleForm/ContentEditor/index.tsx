"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import dynamic from "next/dynamic";
import { useFormContext } from "react-hook-form";
import type { NewsFormData } from "../schema";

// BlockNote's useCreateBlockNote touches `document` during its initial
// render, which crashes Next.js's build-time static prerendering (Node has
// no DOM). ssr: false keeps this component out of every server-side render
// pass — build-time and request-time alike — matching BlockNote's own
// Next.js integration guidance.
const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), {
  ssr: false,
});

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
