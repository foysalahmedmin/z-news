"use client";

import NewsCard from "@/components/cards/NewsCard";
import NewsCardSkeleton from "@/components/skeletons/cards-skeleton/NewsCardSkeleton";
import { Button } from "@/components/ui/Button";
import { FormControl } from "@/components/ui/FormControl";
import { useClickOutside } from "@/hooks/ui/useClickOutside";
import { fetchCategories } from "@/services/category.service";
import { fetchBulkNews } from "@/services/news.service";
import { TCategory } from "@/types/category.type";
import { TNews } from "@/types/news.type";
import debounce from "@/utils/debounce";
import { Calendar, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

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

const OperationClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<TCategory[]>([]);
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<TNews[]>([]);
  const [meta, setMeta] = useState<{
    total?: number;
    limit?: number;
    page?: number;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Read filters directly from searchParams
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const search = searchParams.get("search") || "";
  const published_at_gte = searchParams.get("published_at_gte") || "";
  const published_at_lte = searchParams.get("published_at_lte") || "";

  // Convert URL params to date range (derived state)
  const selectedRange: DateRange | undefined = (() => {
    if (published_at_gte && published_at_lte) {
      return {
        from: new Date(published_at_gte),
        to: new Date(published_at_lte),
      };
    } else if (published_at_gte) {
      return {
        from: new Date(published_at_gte),
        to: undefined,
      };
    }
    return undefined;
  })();

  // Find selected category object from categories list
  const selectedCategory =
    categories.find((cat) => cat._id === category) || null;

  const hasMore = !!(meta?.total && meta?.total > data?.length);

  // Update URL params helper
  const updateSearchParams = (newParams: { [key: string]: string | null }) => {
    const currentParams = new URLSearchParams(
      Array.from(searchParams.entries()),
    );

    Object.entries(newParams).forEach(([key, value]) => {
      if (!value) currentParams.delete(key);
      else currentParams.set(key, value);
    });

    currentParams.delete("page"); // Reset page on filter change
    router.push(`?${currentParams.toString()}`);
    setPage(1);
  };

  function formatYMD(date?: Date) {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Handle date range selection
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      updateSearchParams({
        published_at_gte: formatYMD(range.from),
        published_at_lte: formatYMD(range.to),
      });
    } else if (range?.from) {
      updateSearchParams({
        published_at_gte: formatYMD(range.from),
        published_at_lte: null,
      });
    } else {
      updateSearchParams({
        published_at_gte: null,
        published_at_lte: null,
      });
    }
  };

  // Clear date range
  const clearDateRange = () => {
    updateSearchParams({
      published_at_gte: null,
      published_at_lte: null,
    });
  };

  // Format date for display
  const formatDateRange = () => {
    if (!selectedRange?.from) return "তারিখ নির্বাচন করুন";

    const fromDate = selectedRange.from.toLocaleDateString("bn-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (!selectedRange.to) return `${fromDate} থেকে`;

    const toDate = selectedRange.to.toLocaleDateString("bn-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return `${fromDate} - ${toDate}`;
  };

  // Preset date ranges
  const setPresetRange = (days: number) => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);

    updateSearchParams({
      published_at_gte: startDate.toISOString().split("T")[0],
      published_at_lte: today.toISOString().split("T")[0],
    });
    setIsDatePickerOpen(false);
  };

  // Fetch categories once
  useEffect(() => {
    fetchCategories()
      .then(({ data }) => setCategories(data || []))
      .catch(console.error);
  }, []);

  // Fetch news when filters or page change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data: newsData, meta: newsMeta } = await fetchBulkNews({
          page,
          limit: 12,
          ...(category && { category: category }),
          ...(sort ? { sort } : { sort: "-published_at" }),
          ...(search && { search }),
          ...(published_at_gte && { published_at_gte: published_at_gte }),
          ...(published_at_lte && { published_at_lte: published_at_lte }),
        });

        if (page === 1) setData(newsData || []);
        else setData((prev) => [...prev, ...(newsData || [])]);

        setMeta(newsMeta || {});
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, category, sort, search, published_at_gte, published_at_lte]);

  const ref = useClickOutside<HTMLDivElement>(() => setIsDatePickerOpen(false));

  const debouncedSearchUpdate = debounce((value: string | null) => {
    updateSearchParams({ search: value });
  }, 500);

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col p-4 md:min-h-[calc(100vh-8rem)]">
      <h1 className="mb-4 text-2xl font-bold">অনুসন্ধান</h1>

      <div className="mb-6 flex flex-wrap gap-4">
        {/* Date Range Picker */}
        <div className="grid w-full gap-4 md:grid-cols-2">
          <div ref={ref} className="relative h-10">
            <div
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex h-full w-full min-w-[200px] items-center gap-2 rounded-md border px-3 py-2 transition-colors"
            >
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

            {isDatePickerOpen && (
              <div className="bg-card text-card-foreground absolute top-full left-0 z-50 mt-2 rounded-lg border p-4 py-5 shadow-md">
                {/* Quick Presets */}
                <div className="mb-4 flex flex-wrap gap-2 border-b pb-4">
                  <button
                    onClick={() => setPresetRange(7)}
                    className="bg-foreground/10 text-foreground hover:bg-foreground/5 flex-1 cursor-pointer rounded py-1 text-xs transition-colors"
                  >
                    গত ৭ দিন
                  </button>
                  <button
                    onClick={() => setPresetRange(30)}
                    className="bg-foreground/10 text-foreground hover:bg-foreground/5 flex-1 cursor-pointer rounded py-1 text-xs transition-colors"
                  >
                    গত ৩০ দিন
                  </button>
                  <button
                    onClick={() => setPresetRange(90)}
                    className="bg-foreground/10 text-foreground hover:bg-foreground/5 flex-1 cursor-pointer rounded py-1 text-xs transition-colors"
                  >
                    গত ৯০ দিন
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
                        <strong>নির্বাচিত:</strong> {formatDateRange()}
                      </div>
                    )
                  }
                />
              </div>
            )}
          </div>
          {/* Category */}
          <FormControl
            as="select"
            value={category}
            onChange={(e) =>
              updateSearchParams({ category: e.target.value || null })
            }
          >
            <option value="">সব বিভাগ</option>
            {categories?.map((cat) => renderCategoryOptions(cat))}
          </FormControl>
        </div>

        {/* Search */}
        <FormControl
          as="input"
          type="search"
          className="min-w-[200px] flex-grow rounded border px-3 py-2"
          placeholder="সংবাদ খুঁজুন..."
          defaultValue={search}
          onChange={(e) => debouncedSearchUpdate(e.target.value || null)}
        />
      </div>

      {/* Active Filters Display */}
      {(selectedRange?.from || category || search) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedRange?.from && (
            <div className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
              <Calendar size={12} />
              {formatDateRange()}
              <button
                onClick={clearDateRange}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X size={12} />
              </button>
            </div>
          )}
          {selectedCategory && (
            <div className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-sm text-green-800">
              {selectedCategory.name}
              <button
                onClick={() => updateSearchParams({ category: null })}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <X size={12} />
              </button>
            </div>
          )}
          {search && (
            <div className="inline-flex items-center gap-1 rounded bg-yellow-100 px-2 py-1 text-sm text-yellow-800">
              "{search}"
              <button
                onClick={() => updateSearchParams({ search: null })}
                className="ml-1 text-yellow-600 hover:text-yellow-800"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between border-y py-2">
        <div className="flex items-center">
          <span>প্রাপ্ত ফলাফল:</span>
          <span className="ml-2 font-semibold">
            {meta?.total || data?.length || 0}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>সাজানো:</span>
          <FormControl
            as="select"
            className="h-8"
            value={sort}
            onChange={(e) =>
              updateSearchParams({ sort: e.target.value || null })
            }
          >
            <option value="">প্রাসঙ্গিক</option>
            <option value="-published_at">নতুন থেকে পুরোনো</option>
            <option value="published_at">পুরোনো থেকে নতুন</option>
          </FormControl>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {/* News List */}
        {isLoading && data.length === 0 ? (
          <div className="h-full flex-1">
            <ul className="space-y-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <li
                  key={index}
                  className="border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <NewsCardSkeleton type="list" />
                </li>
              ))}
            </ul>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full flex-1 items-center justify-center">
            <p className="text-center">কোন সংবাদ পাওয়া যায়নি</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {data.map((newsItem) => (
              <li
                key={newsItem._id}
                className="border-b pb-4 last:border-b-0 last:pb-0"
              >
                <NewsCard
                  className="lg:text-lg"
                  classNameThumbnail="md:w-1/3 md:max-w-40"
                  news={newsItem}
                  type="list"
                />
              </li>
            ))}
          </ul>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => setPage((prev) => prev + 1)}
              isLoading={isLoading}
            >
              {isLoading ? "লোড হচ্ছে..." : "আরও দেখুন"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationClient;
