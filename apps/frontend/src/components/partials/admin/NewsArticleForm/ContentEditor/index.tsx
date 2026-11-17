"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import dynamic from "next/dynamic";
import { useRef } from "react";
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
  const isUserInteractedRef = useRef(false);

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Content *</CardTitle>
      </CardHeader>
      <CardContent
        onKeyDownCapture={() => {
          isUserInteractedRef.current = true;
        }}
        onInputCapture={() => {
          isUserInteractedRef.current = true;
        }}
        onPasteCapture={() => {
          isUserInteractedRef.current = true;
        }}
        onDropCapture={() => {
          isUserInteractedRef.current = true;
        }}
        onPointerDownCapture={() => {
          isUserInteractedRef.current = true;
        }}
      >
        <RichTextEditor
          value={contentValue}
          onChange={(html) => {
            // shouldDirty: drives the unsaved-changes guard in the form.
            // On load, BlockNote may re-emit normalized HTML without real user input;
            // only mark dirty when user has interacted with the editor.
            setValue("content", html, {
              shouldDirty: isUserInteractedRef.current,
            });
          }}
          error={errors.content?.message}
          uploadFileCategory="news-content"
        />
      </CardContent>
    </Card>
  );
};

export default ContentEditor;
