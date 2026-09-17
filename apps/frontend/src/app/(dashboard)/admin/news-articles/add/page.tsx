"use client";

import NewsArticleForm from "@/components/partials/admin/NewsArticleForm";
import PageHeader from "@/components/partials/admin/PageHeader";

// Ported from apps/adminpanel's src/pages/(common)/NewsArticlesAddPage/index.tsx.
// The 9-subsection form + create mutation live in the shared
// NewsArticleForm component (see ../../../../components/partials/admin/NewsArticleForm),
// which Edit reuses via the `mode` prop. Role gating
// (["super-admin", "admin", "author"], no editor) is enforced by the
// backend/menu builder, not re-implemented client-side here -- this route
// is otherwise only reachable behind apps/frontend's /admin/* middleware.
const NewsArticleAddPage = () => {
  return (
    <main className="space-y-6">
      <PageHeader
        name="Add News Article"
        breadcrumbs={[
          { index: 0, name: "News Articles", path: "/admin/news-articles" },
          { index: 1, name: "Add News Article" },
        ]}
      />

      <NewsArticleForm mode="add" />
    </main>
  );
};

export default NewsArticleAddPage;
