"use client";

import { ArrowLeft, Eye } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import NewsArticleForm from "@/components/partials/admin/NewsArticleForm";
import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";

// Ported from apps/adminpanel's src/pages/(common)/NewsArticlesEditPage/index.tsx.
// react-router's useNavigate/useParams -> next/navigation's
// useRouter/useParams. The 9-subsection form + fetch/update mutation live in
// the shared NewsArticleForm component (see
// ../../../../../components/partials/admin/NewsArticleForm), which Add
// reuses via the `mode` prop; this page only supplies what differs
// (breadcrumb title, Back/View buttons, the `newsId`).
const NewsArticleEditPage = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  return (
    <main className="space-y-6">
      <PageHeader
        name="Update News Article"
        breadcrumbs={[
          { index: 0, name: "News Articles", path: "/admin/news-articles" },
          { index: 1, name: "Update News Article" },
        ]}
        slot={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => router.push(`/admin/news-articles/${id}`)}>
              <Eye className="h-4 w-4" />
              View
            </Button>
          </div>
        }
      />

      <NewsArticleForm mode="edit" newsId={id} />
    </main>
  );
};

export default NewsArticleEditPage;
