import { useFormContext } from "react-hook-form";

import { Card } from "@/components/ui/Card";
import { FormControl } from "@/components/ui/FormControl";
import type { NewsFormData } from "@/pages/(common)/NewsArticlesAddPage";
import ImageUpload from "../ImageUpload";
import TagsInput from "../TagsInput";

const SEOSection = () => {
  const { watch, setValue } = useFormContext<NewsFormData>();

  return (
    <Card>
      <Card.Header className="border-b">
        <Card.Title>SEO Settings</Card.Title>
      </Card.Header>
      <Card.Content className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4 self-stretch">
            <div>
              <FormControl.Label htmlFor="seo-title">
                SEO Title
              </FormControl.Label>
              <FormControl
                id="seo-title"
                placeholder="SEO Title"
                value={watch("seo.title" as any)}
                onChange={(e) => setValue("seo.title" as any, e.target.value)}
              />
            </div>

            <div>
              <FormControl.Label htmlFor="seo-description">
                SEO Description
              </FormControl.Label>
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
      </Card.Content>
    </Card>
  );
};

export default SEOSection;
