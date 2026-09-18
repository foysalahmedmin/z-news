import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { TUpcomingEvent } from "@/types/dashboard.type";
import { Calendar } from "lucide-react";
import Link from "next/link";

// Presentational list widget for the Admin dashboard's upcoming events.
// `/event/${slug}` is the existing public event route
// (apps/frontend/src/app/(primary)/event/[slug]/page.tsx), so that's what
// each row links out to.
type UpcomingEventsWidgetProps = {
  data: TUpcomingEvent[];
};

const formatEventDate = (dateInput: string) => {
  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const UpcomingEventsWidget = ({ data }: UpcomingEventsWidgetProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
            No upcoming events
          </div>
        ) : (
          <ul className="divide-border divide-y">
            {data.map((event) => (
              <li key={event._id} className="flex items-center gap-3 py-3">
                <Calendar className="text-muted-foreground size-4 shrink-0" />
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <Link
                    href={`/event/${event.slug}`}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {event.name}
                  </Link>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatEventDate(event.published_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsWidget;
