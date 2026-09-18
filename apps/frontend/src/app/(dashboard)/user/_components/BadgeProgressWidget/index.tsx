import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { TBadgeProgressItem } from "@/types/dashboard.type";
import { Check } from "lucide-react";

// Presentational widget for the Reader dashboard's badge/reputation
// progress (GET /api/badge/progress, wired via the consolidated
// fetchReaderDashboard() response). `badge.icon` is a free-text/emoji
// field on the badge module, so it's rendered directly as text rather
// than resolved through the lucide `Icon` component. No shared `Progress`
// bar component exists under `@/components/ui/` yet, so this uses a plain
// width-percentage `<div>` bar, matching the styling language used by the
// rest of the dashboard partials (bg-muted track, bg-primary fill).
type BadgeProgressWidgetProps = {
  data: TBadgeProgressItem[];
};

const BadgeProgressWidget = ({ data }: BadgeProgressWidgetProps) => {
  const sorted = [...data].sort((a, b) => {
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    return b.percentage - a.percentage;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges & Reputation</CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="text-muted-foreground flex h-[120px] items-center justify-center text-sm">
            No badges available yet
          </div>
        ) : (
          <ul className="divide-border divide-y">
            {sorted.map((item) => (
              <li key={item.badge._id} className="flex items-center gap-3 py-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-lg",
                    item.earned ? "bg-primary/10" : "bg-muted grayscale",
                  )}
                  aria-hidden
                >
                  {item.badge.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "truncate text-sm font-medium",
                        !item.earned && "text-muted-foreground",
                      )}
                    >
                      {item.badge.name}
                    </span>
                    {item.earned ? (
                      <span className="text-primary flex shrink-0 items-center gap-1 text-xs font-medium">
                        <Check className="size-3.5" />
                        Earned
                      </span>
                    ) : (
                      <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                        {item.current}/{item.threshold}
                      </span>
                    )}
                  </div>
                  <div
                    className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full"
                    role="progressbar"
                    aria-valuenow={Math.round(item.percentage)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.badge.name} progress`}
                  >
                    <div
                      className={cn(
                        "h-full rounded-full",
                        item.earned ? "bg-primary" : "bg-primary/50",
                      )}
                      style={{
                        width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default BadgeProgressWidget;
