// NewsArticlesFilterSection.tsx
import { Dropdown } from "@/components/ui/Dropdown";
import { FormControl } from "@/components/ui/FormControl";
import { cn } from "@/lib/utils";
import type { TCategory } from "@/types/category.type";
import type { TUser } from "@/types/user.type";
import { Calendar, X } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type NewsArticlesFilterSectionProps = {
  className?: string;
  state: {
    category: string;
    setCategory: (value: string) => void;
    author: string;
    setAuthor: (value: string) => void;
    status: string;
    setStatus: (value: string) => void;
    featured: string;
    setFeatured: (value: string) => void;
    publishedAtGte: string;
    setPublishedAtGte: (value: string) => void;
    publishedAtLte: string;
    setPublishedAtLte: (value: string) => void;
    categories: TCategory[];
    users: TUser[];
  };
};

const renderCategoryOptions = (
  category?: TCategory,
  prefix = "",
): React.ReactNode => {
  if (!category) return null;
  return (
    <>
      <option key={category._id} value={category._id}>
        {prefix + category.name}
      </option>
      {category.children?.map((child) =>
        renderCategoryOptions(child, prefix + "-- "),
      )}
    </>
  );
};

const NewsArticlesFilterSection: React.FC<NewsArticlesFilterSectionProps> = ({
  className,
  state,
}) => {
  const {
    category,
    setCategory,
    author,
    setAuthor,
    status,
    setStatus,
    featured,
    setFeatured,
    publishedAtGte,
    setPublishedAtGte,
    publishedAtLte,
    setPublishedAtLte,
    categories,
    users,
  } = state;

  const selectedRange = useMemo<DateRange | undefined>(() => {
    if (publishedAtGte && publishedAtLte) {
      return { from: new Date(publishedAtGte), to: new Date(publishedAtLte) };
    } else if (publishedAtGte) {
      return { from: new Date(publishedAtGte), to: undefined };
    }
    return undefined;
  }, [publishedAtGte, publishedAtLte]);

  function formatYMD(date?: Date) {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const handleDateRangeSelect = useCallback(
    (range: DateRange | undefined) => {
      if (range?.from) {
        setPublishedAtGte(formatYMD(range?.from));
        setPublishedAtLte(formatYMD(range?.to));
      } else {
        setPublishedAtGte("");
        setPublishedAtLte("");
      }
    },
    [setPublishedAtGte, setPublishedAtLte],
  );

  const clearDateRange = useCallback(() => {
    setPublishedAtGte("");
    setPublishedAtLte("");
  }, [setPublishedAtGte, setPublishedAtLte]);

  const formatDateRange = useCallback(() => {
    if (!selectedRange?.from) return "Select date range";

    const formatOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };

    const fromDate = selectedRange.from.toLocaleDateString(
      "en-US",
      formatOptions,
    );

    if (!selectedRange.to) return `${fromDate} to`;
    const toDate = selectedRange.to.toLocaleDateString("en-US", formatOptions);

    return `${fromDate} - ${toDate}`;
  }, [selectedRange]);

  const setPresetRange = useCallback(
    (days: number) => {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - days);

      setPublishedAtGte(startDate.toISOString().split("T")[0]);
      setPublishedAtLte(today.toISOString().split("T")[0]);
    },
    [setPublishedAtGte, setPublishedAtLte],
  );

  return (
    <div className={cn("grid w-full gap-4 md:grid-cols-2", className)}>
      {/* Date Range Picker */}
      <Dropdown className="w-full md:col-span-2">
        <Dropdown.Trigger
          isAnimation={false}
          className="w-full active:scale-100"
          variant="none"
          size="none"
        >
          <div className="flex h-full w-full min-w-[200px] items-center gap-2 rounded-md border px-3 py-2 transition-colors">
            <Calendar size={16} />
            <span className="text-sm">{formatDateRange()}</span>
            {selectedRange?.from && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearDateRange();
                }}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </Dropdown.Trigger>

        <Dropdown.Content>
          <div className="bg-card text-card-foreground absolute top-full left-0 z-50 mt-2 rounded-lg border p-4 py-5 shadow-md">
            {/* Quick Presets */}
            <div className="mb-4 flex flex-wrap gap-2 border-b pb-4">
              <button
                onClick={() => setPresetRange(7)}
                className="bg-foreground/10 text-foreground hover:bg-foreground/5 flex-1 cursor-pointer rounded py-1 text-xs transition-colors"
              >
                Last 7 days
              </button>
              <button
                onClick={() => setPresetRange(30)}
                className="bg-foreground/10 text-foreground hover:bg-foreground/5 flex-1 cursor-pointer rounded py-1 text-xs transition-colors"
              >
                Last 30 days
              </button>
              <button
                onClick={() => setPresetRange(90)}
                className="bg-foreground/10 text-foreground hover:bg-foreground/5 flex-1 cursor-pointer rounded py-1 text-xs transition-colors"
              >
                Last 90 days
              </button>
            </div>

            {/* Calendar */}
            <DayPicker
              mode="range"
              selected={selectedRange}
              onSelect={handleDateRangeSelect}
              disabled={{ after: new Date() }}
              className="w-full"
              footer={
                selectedRange?.from && (
                  <div className="bg-muted mt-4 rounded p-2 text-sm">
                    <strong>Selected:</strong> {formatDateRange()}
                  </div>
                )
              }
            />
          </div>
        </Dropdown.Content>
      </Dropdown>

      {/* Category Filter */}
      <FormControl
        as="select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">All categories</option>
        {categories?.map((cat) => renderCategoryOptions(cat))}
      </FormControl>

      {/* Author Filter */}
      <FormControl
        as="select"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      >
        <option value="">All authors</option>
        {users?.map((user) => (
          <option key={user._id} value={user._id}>
            {user.name}
          </option>
        ))}
      </FormControl>

      {/* Status Filter */}
      <FormControl
        as="select"
        value={status}
        onChange={(e) => setStatus(e.target.value || "")}
      >
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </FormControl>

      {/* Featured Filter */}
      <FormControl
        as="select"
        value={featured}
        onChange={(e) => setFeatured(e.target.value || "")}
      >
        <option value="">All Features</option>
        <option value="featured">Featured</option>
        <option value="not-featured">Not Featured</option>
      </FormControl>
    </div>
  );
};

export default NewsArticlesFilterSection;
