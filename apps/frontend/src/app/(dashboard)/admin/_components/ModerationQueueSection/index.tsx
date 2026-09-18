import type { TStatistic } from "@/components/partials/admin/StatisticCard";
import { StatisticCard } from "@/components/partials/admin/StatisticCard";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn, formatTimeAgo } from "@/lib/utils";
import type { TModerationQueue } from "@/types/dashboard.type";
import Link from "next/link";

// Presentational "Moderation Queue" section for the Editorial-tier
// dashboard, shown only to editor/admin viewers (the parent
// EditorialTierDashboard renders this only when the /api/dashboard/editorial
// response includes `moderation_queue`). Status badge colors mirror the
// existing status-column styling in NewsArticlesDataTableSection for
// consistency with the rest of /admin/news-articles.
type ModerationQueueSectionProps = {
  data: TModerationQueue;
};

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  scheduled: "bg-purple-100 text-purple-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-red-100 text-red-800",
};

const ModerationQueueSection = ({ data }: ModerationQueueSectionProps) => {
  const statistics: TStatistic[] = [
    {
      title: "Pending Articles",
      value: data.pending_news_count,
      subtitle: "Awaiting review",
      description: "Articles submitted and awaiting moderation.",
      icon: "clock",
    },
    {
      title: "Flagged Comments",
      value: data.flagged_comments_count,
      subtitle: "Needs attention",
      description: "Comments flagged by users for moderation.",
      icon: "flag",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        {statistics.map((item) => (
          <StatisticCard key={item.title} item={item} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {data.queue.length === 0 ? (
            <div className="text-muted-foreground flex h-[150px] items-center justify-center text-sm">
              Nothing awaiting review
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {data.queue.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <Link
                    href={`/admin/news-articles/edit/${item._id}`}
                    className="min-w-0 truncate text-sm font-medium hover:underline"
                  >
                    {item.title}
                  </Link>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        statusStyles[item.status] || "bg-gray-100 text-gray-800",
                      )}
                    >
                      {item.status}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {formatTimeAgo(item.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default ModerationQueueSection;
