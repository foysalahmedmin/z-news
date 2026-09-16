import { useFormContext } from "react-hook-form";

import { Card } from "@/components/ui/Card";
import RichTextEditor from "@/components/ui/RichTextEditor";
import type { NewsFormData } from "@/pages/(common)/NewsArticlesEditPage";

const ContentEditor = () => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<NewsFormData>();

  const contentValue = watch("content");

  return (
    <Card>
      <Card.Header className="border-b">
        <Card.Title>Content *</Card.Title>
      </Card.Header>
      <Card.Content>
        <RichTextEditor
          value={contentValue}
          onChange={(html) => {
            setValue("content", html);
          }}
          error={errors.content?.message}
          uploadFileCategory="news-content"
        />
      </Card.Content>
    </Card>
  );
};

export default ContentEditor;

