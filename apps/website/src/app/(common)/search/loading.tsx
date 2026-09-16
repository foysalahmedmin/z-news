import NewsCardSkeleton from "@/components/skeletons/cards-skeleton/NewsCardSkeleton";
import { Calendar } from "lucide-react";

const SearchPageLoading = () => {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] animate-pulse flex-col p-4 md:min-h-[calc(100vh-8rem)]">
      {/* Title */}
      <div className="bg-muted mb-4 h-6 w-40 rounded" />

      {/* Filters Row */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="grid w-full gap-4 md:grid-cols-2">
          {/* Date Picker */}
          <div className="relative h-10">
            <div className="flex h-full w-full min-w-[200px] items-center gap-2 rounded-md border px-3 py-2">
              <Calendar size={16} className="text-muted" />
              <div className="bg-muted h-4 w-28 rounded" />
            </div>
          </div>
          {/* Category Dropdown */}
          <div className="bg-muted h-10 w-full rounded" />
        </div>
        {/* Search */}
        <div className="bg-muted h-10 min-w-[200px] flex-grow rounded" />
      </div>

      {/* Active Filters Skeleton (optional) */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="bg-muted h-6 w-32 rounded-full" />
        <div className="bg-muted h-6 w-28 rounded-full" />
      </div>

      {/* Result count + sort */}
      <div className="mb-4 flex items-center justify-between border-y py-2">
        <div className="flex items-center gap-2">
          <div className="bg-muted h-4 w-20 rounded" />
        </div>
        <div className="bg-muted h-8 w-32 rounded" />
      </div>

      {/* News List Skeleton */}
      <div className="flex flex-1 flex-col">
        <ul className="space-y-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <li key={index} className="border-b pb-4">
              <NewsCardSkeleton type="list" />
            </li>
          ))}
        </ul>
      </div>

      {/* Load More Button Skeleton */}
      <div className="mt-6 flex justify-center">
        <div className="bg-muted h-10 w-40 rounded" />
      </div>
    </div>
  );
};

export default SearchPageLoading;
