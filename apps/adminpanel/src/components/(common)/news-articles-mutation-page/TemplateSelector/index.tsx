import { useQuery } from "@tanstack/react-query";
import { Layout } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Card } from "@/components/ui/Card";
import { FormControl } from "@/components/ui/FormControl";
import { fetchTemplates } from "@/services/template.service";

const TemplateSelector = () => {
  const { setValue, watch } = useFormContext();
  const currentContent = watch("content");

  const { data: templatesData } = useQuery({
    queryKey: ["templates", { is_active: true }],
    queryFn: () => fetchTemplates({ is_active: true }),
  });

  const templates = templatesData?.data || [];

  const handleApplyTemplate = (id: string) => {
    if (!id) return;
    const template = templates.find((t) => t._id === id);
    if (template) {
      const confirmMsg =
        currentContent?.length > 10
          ? `Apply template "${template.name}"? This may overwrite or shift your current content structure.`
          : `Apply template "${template.name}"?`;

      if (window.confirm(confirmMsg)) {
        if (template.structure) {
          // If template.structure is a string (HTML), set it directly
          // If it's an object (BlockNote JSON), the editor should handle it
          setValue(
            "content",
            typeof template.structure === "string"
              ? template.structure
              : JSON.stringify(template.structure),
          );
        }
      }
    }
  };

  if (templates.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <Card.Content className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <Layout className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Editorial Templates</h4>
            <p className="text-muted-foreground text-xs font-normal">
              Apply pre-defined article structure
            </p>
          </div>
        </div>
        <div className="max-w-[250px] flex-1">
          <FormControl
            as="select"
            onChange={(e: any) => handleApplyTemplate(e.target.value)}
            className="h-9 text-xs"
          >
            <option value="">Select a template...</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </FormControl>
        </div>
      </Card.Content>
    </Card>
  );
};

export default TemplateSelector;
