import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit } from "lucide-react";

import NewsArticleHistorySection from "@/components/(common)/news-articles-details-page/NewsArticleHistorySection";
import NewsArticleInfoSection from "@/components/(common)/news-articles-details-page/NewsArticleInfoSection";
import NewsArticleMediaSection from "@/components/(common)/news-articles-details-page/NewsArticleMediaSection";
import NewsArticleOverviewSection from "@/components/(common)/news-articles-details-page/NewsArticleOverviewSection";
import NewsArticleWorkflowSection from "@/components/(common)/news-articles-details-page/NewsArticleWorkflowSection";
import Loader from "@/components/partials/Loader";
import PageHeader from "@/components/sections/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { fetchNews } from "@/services/news.service";
import { useNavigate, useParams } from "react-router";

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const NewsArticleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
        <Button className="mt-4" onClick={() => navigate(-1)}>
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
          { name: "News Articles", path: "/news-articles" },
          { name: "News Articles Details" },
        ]}
        slot={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => navigate(`/news-articles/edit/${news._id}`)}>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        }
      />

      <Card>
        <Card.Content className="py-6">
          <NewsArticleInfoSection news={news} />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header className="border-b">
          <Card.Title>Content</Card.Title>
        </Card.Header>
        <Card.Content className="py-6">
          <div className="prose prose-lg max-w-none">
            <div
              className="mx-auto whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Tabs value={"overview"}>
          <Card.Header className="pb-0">
            <Tabs.List className="justify-start">
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="media">Media</Tabs.Trigger>
              <Tabs.Trigger value="workflow">Workflow</Tabs.Trigger>
              <Tabs.Trigger value="history">History</Tabs.Trigger>
            </Tabs.List>
          </Card.Header>
          <Card.Content>
            <Tabs.Content>
              <Tabs.Item value="overview">
                <NewsArticleOverviewSection news={news || {}} />
              </Tabs.Item>
              <Tabs.Item value="media">
                <NewsArticleMediaSection news={news || {}} />
              </Tabs.Item>
              <Tabs.Item value="workflow">
                <NewsArticleWorkflowSection news={news as any} />
              </Tabs.Item>
              <Tabs.Item value="history">
                <NewsArticleHistorySection news={news as any} />
              </Tabs.Item>
            </Tabs.Content>
          </Card.Content>
        </Tabs>
      </Card>
    </div>
  );
};

export default NewsArticleDetailsPage;
