import type { TStatistic } from "@/components/partials/admin/StatisticCard";
import { StatisticCard } from "@/components/partials/admin/StatisticCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { TMyContentPerformance } from "@/types/dashboard.type";
import { Eye } from "lucide-react";
import Link from "next/link";
import TrendAreaChart from "../TrendAreaChart";

// Presentational "My Content Performance" section for the Editorial-tier
// dashboard, shown only to author/contributor viewers (the parent
// EditorialTierDashboard renders this only when the /api/dashboard/editorial
// response includes `my_content`). Reuses TrendAreaChart and StatisticCard
// as-is, matching the Admin tier's composition style.
type MyContentPerformanceSectionProps = {
  data: TMyContentPerformance;
};

const MyContentPerformanceSection = ({
  data,
}: MyContentPerformanceSectionProps) => {
  const statusStatistics: TStatistic[] = [
    {
      title: "Draft",
      value: data.by_status.draft,
      subtitle: "Not yet submitted",
      description: "Articles you're still working on.",
      icon: "file-edit",
    },
    {
      title: "Pending",
      value: data.by_status.pending,
      subtitle: "Awaiting review",
      description: "Submitted articles awaiting moderation.",
      icon: "clock",
    },
    {
      title: "Scheduled",
      value: data.by_status.scheduled,
      subtitle: "Queued to publish",
      description: "Approved articles scheduled to publish.",
      icon: "calendar-clock",
    },
    {
      title: "Published",
      value: data.by_status.published,
      subtitle: "Live",
      description: "Articles currently live on the site.",
      icon: "check-circle",
    },
    {
      title: "Archived",
      value: data.by_status.archived,
      subtitle: "No longer active",
      description: "Articles you've archived.",
      icon: "archive",
    },
  ];

  const engagementStatistics: TStatistic[] = [
    {
      title: "Total Views",
      value: data.total_views,
      subtitle: "Across your articles",
      description: "All-time view count on your articles.",
      icon: "eye",
    },
    {
      title: "Total Comments",
      value: data.total_comments,
      subtitle: "Across your articles",
      description: "All-time comments on your articles.",
      icon: "message-square-quote",
    },
    {
      title: "Total Reactions",
      value: data.total_reactions,
      subtitle: "Across your articles",
      description: "All-time reactions on your articles.",
      icon: "smile",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statusStatistics.map((item) => (
          <StatisticCard key={item.title} item={item} />
        ))}
      </div>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        {engagementStatistics.map((item) => (
          <StatisticCard key={item.title} item={item} />
        ))}
      </div>

      <TrendAreaChart
        title="My Article Views"
        description="Views on your articles, last 30 days"
        data={data.view_trend}
      />

      <Card>
        <CardHeader>
          <CardTitle>Top Articles</CardTitle>
        </CardHeader>
        <CardContent>
          {data.top_articles.length === 0 ? (
            <div className="text-muted-foreground flex h-[120px] items-center justify-center text-sm">
              No articles yet
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {data.top_articles.map((article) => (
                <li
                  key={article._id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <Link
                    href={`/news/${article.slug}`}
                    className="min-w-0 truncate text-sm font-medium hover:underline"
                  >
                    {article.title}
                  </Link>
                  <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
                    <Eye className="size-3.5" />
                    {article.view_count.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default MyContentPerformanceSection;
