"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import PageHeader from "@/components/partials/admin/PageHeader";
import Loader from "@/components/partials/admin/Loader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Tabs,
  TabsContent,
  TabsItem,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import { fetchNews } from "@/services/admin-news.service";
import NewsArticleHistorySection from "./_components/NewsArticleHistorySection";
import NewsArticleInfoSection from "./_components/NewsArticleInfoSection";
import NewsArticleMediaSection from "./_components/NewsArticleMediaSection";
import NewsArticleOverviewSection from "./_components/NewsArticleOverviewSection";
import NewsArticleWorkflowSection from "./_components/NewsArticleWorkflowSection";

// Ported from apps/adminpanel's
// src/pages/(common)/NewsArticlesDetailsPage/index.tsx.
// react-router's `useParams`/`useNavigate` -> next/navigation's
// `useParams`/`useRouter`; `navigate(-1)` -> `router.back()`.
function formatDate(dateString: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(String(dateString)));
}

const NewsArticleDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const {
    data: newsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["news", id],
    queryFn: () => fetchNews(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (error || !newsData?.data) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <div className="text-lg text-red-600">Error loading news article</div>
        <Button className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const news = newsData.data;

  return (
    <div className="space-y-6">
      <PageHeader
        name={news.title}
        breadcrumbs={[
          { index: 0, name: "News Articles", path: "/admin/news-articles" },
          { index: 1, name: "News Articles Details" },
        ]}
        slot={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() =>
                router.push(`/admin/news-articles/edit/${news._id}`)
              }
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="py-6">
          <NewsArticleInfoSection news={news} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="prose prose-lg max-w-none">
            <div
              className="mx-auto whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <Tabs value={"overview"}>
          <CardHeader className="pb-0">
            <TabsList className="justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent>
              <TabsItem value="overview">
                <NewsArticleOverviewSection news={news || {}} />
              </TabsItem>
              <TabsItem value="media">
                <NewsArticleMediaSection news={news || {}} />
              </TabsItem>
              <TabsItem value="workflow">
                <NewsArticleWorkflowSection news={news} />
              </TabsItem>
              <TabsItem value="history">
                <NewsArticleHistorySection news={news} />
              </TabsItem>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default NewsArticleDetailsPage;
