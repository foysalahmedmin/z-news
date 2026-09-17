"use client";

import TemplateForm from "@/components/partials/admin/TemplateForm";
import { useParams } from "next/navigation";

export default function ContentTemplateEditPage() {
  const params = useParams<{ id: string }>();
  return <TemplateForm mode="edit" templateId={params.id} />;
}
