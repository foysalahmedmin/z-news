import Loader from "@/components/partials/Loader";
import { Button } from "@/components/ui/Button";
import { fetchBulkNews } from "@/services/news.service";
import { useQuery } from "@tanstack/react-query";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const NewsArticlesCalendarSection = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: newsData, isLoading } = useQuery({
    queryKey: ["news-calendar", format(currentMonth, "yyyy-MM")],
    queryFn: () =>
      fetchBulkNews({
        published_at_gte: startOfMonth(currentMonth).toISOString(),
        published_at_lte: endOfMonth(currentMonth).toISOString(),
        limit: 100,
      }),
  });

  if (isLoading) return <Loader />;

  const newsItems = newsData?.data || [];
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

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
        <h2 className="text-xl font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
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
            (n) => n.published_at && isSameDay(new Date(n.published_at), day),
          );
          return (
            <div
              key={day.toISOString()}
              className="hover:bg-muted/5 min-h-[120px] border-r border-b p-1 transition-colors"
            >
              <span className="p-1 px-2 text-sm font-semibold opacity-60">
                {format(day, "d")}
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
