import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatTimeAgo } from "@/lib/utils";
import type { TRecentActivityItem } from "@/types/dashboard.type";
import { MessageSquare, Newspaper, UserPlus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

// Presentational activity feed for the Admin dashboard. Each row's icon and
// text are driven by item.type:
// - news_published: `title` is the article title, `link` (when present)
//   points at it.
// - comment_posted: `title` is a backend-truncated content excerpt, `actor`
//   is the commenter.
// - user_signup: `title` doubles as the new user's display name (`actor` is
//   only ever set for comments).
// Reuses the existing Intl.RelativeTimeFormat-based formatTimeAgo() helper
// from @/lib/utils (already used by NotificationsView/CommentsView) instead
// of adding a new one.
type RecentActivityFeedProps = {
  data: TRecentActivityItem[];
};

const getActivityIcon = (type: TRecentActivityItem["type"]) => {
  switch (type) {
    case "news_published":
      return Newspaper;
    case "comment_posted":
      return MessageSquare;
    case "user_signup":
      return UserPlus;
    default:
      return Newspaper;
  }
};

const getActivityText = (item: TRecentActivityItem): ReactNode => {
  switch (item.type) {
    case "news_published":
      return (
        <>
          New article published: <span className="font-medium">{item.title}</span>
        </>
      );
    case "comment_posted":
      return (
        <>
          <span className="font-medium">{item.actor}</span> commented: &quot;
          {item.title}&quot;
        </>
      );
    case "user_signup":
      return (
        <>
          <span className="font-medium">{item.title}</span> joined
        </>
      );
    default:
      return item.title;
  }
};

const RecentActivityFeed = ({ data }: RecentActivityFeedProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
            No recent activity
          </div>
        ) : (
          <ul className="divide-border divide-y">
            {data.map((item, index) => {
              const ActivityIcon = getActivityIcon(item.type);
              const text = getActivityText(item);

              return (
                <li key={`${item.type}-${index}`} className="flex items-start gap-3 py-3">
                  <ActivityIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      {item.link ? (
                        <Link href={item.link} className="hover:underline">
                          {text}
                        </Link>
                      ) : (
                        text
                      )}
                    </p>
                    <span className="text-muted-foreground text-xs">
                      {formatTimeAgo(item.date)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
