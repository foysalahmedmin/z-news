"use client";

import Loader from "@/components/partials/admin/Loader";
import { Button } from "@/components/ui/Button";
import { fetchBulkNews } from "@/services/admin-news.service";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

// Ported from apps/adminpanel's
// `components/(common)/news-articles-page/NewsArticlesCalendarSection`.
// The original used `date-fns` (eachDayOfInterval/endOfMonth/format/
// isSameDay/startOfMonth); date-fns isn't a dependency of apps/frontend
// (only pulled in transitively by react-day-picker's own bundle), so the
// handful of helpers actually used are reimplemented here with native
// `Date`/`Intl` — same pattern already used by apps/frontend's
// `lib/utils.ts` for `formatDistanceToNow`.
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function eachDayOfInterval(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthTitle(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const NewsArticlesCalendarSection = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: newsData, isLoading } = useQuery({
    queryKey: ["news-calendar", formatMonthKey(currentMonth)],
    queryFn: () =>
      fetchBulkNews({
        published_at_gte: startOfMonth(currentMonth).toISOString(),
        published_at_lte: endOfMonth(currentMonth).toISOString(),
        limit: 100,
      }),
  });

  if (isLoading) return <Loader />;

  const newsItems = newsData?.data || [];
  const days = eachDayOfInterval(
    startOfMonth(currentMonth),
    endOfMonth(currentMonth),
  );

  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{formatMonthTitle(currentMonth)}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-t border-l">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="bg-muted/30 text-muted-foreground border-r border-b p-2 text-center text-xs font-bold uppercase"
          >
            {day}
          </div>
        ))}

        {/* Empty cells for padding */}
        {Array.from({ length: days[0].getDay() }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="bg-muted/10 min-h-[120px] border-r border-b"
          />
        ))}

        {days.map((day) => {
          const dayNews = newsItems.filter(
            (n) =>
              n.published_at &&
              // `published_at` is typed `Date` in admin-news.type.ts but the
              // API actually returns an ISO string; `String()` normalizes
              // either shape for the `Date` constructor.
              isSameDay(new Date(String(n.published_at)), day),
          );
          return (
            <div
              key={day.toISOString()}
              className="hover:bg-muted/5 min-h-[120px] border-r border-b p-1 transition-colors"
            >
              <span className="p-1 px-2 text-sm font-semibold opacity-60">
                {day.getDate()}
              </span>
              <div className="mt-1 max-h-[80px] space-y-1 overflow-y-auto">
                {dayNews.map((n) => (
                  <div
                    key={n._id}
                    className="bg-card truncate rounded border px-1.5 py-0.5 text-[10px] leading-tight hover:shadow-sm"
                    title={n.title}
                  >
                    <span
                      className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${n.status === "published" ? "bg-green-500" : "bg-orange-500"}`}
                    />
                    {n.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsArticlesCalendarSection;
