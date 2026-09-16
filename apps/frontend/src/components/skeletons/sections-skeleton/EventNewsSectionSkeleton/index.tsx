import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import NewsCardSkeleton from "../../cards-skeleton/NewsCardSkeleton";

const EventNewsSection: React.FC<{
  layout?: "highlight" | string;
  hasAd?: boolean;
}> = ({ layout, hasAd = false }) => {
  const endPoint = hasAd ? 6 : 10;

  return (
    <section
      className={cn("", { "bg-muted py-10 md:py-16": layout === "highlight" })}
    >
      <div className="container space-y-6 md:space-y-10">
        {/* Section Header Skeleton */}
        <div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="relative z-8 flex animate-pulse items-center gap-2">
                <Icon
                  className="text-muted ml-3 size-8 md:size-10"
                  name="circle"
                />
                <div className="bg-muted h-6 w-32 rounded md:h-8 md:w-48" />
              </div>
              <div className="absolute inset-0 my-auto flex w-fit items-center gap-2 opacity-10">
                <Icon className="text-muted size-14 md:size-16" name="circle" />
              </div>
            </div>
            <div className="border-muted flex-1 border-y py-1" />
          </div>
        </div>

        {/* Cards Skeleton */}
        <div>
          <div className="grid gap-4 md:grid-flow-col md:grid-cols-2 md:grid-rows-6 lg:grid-cols-3 lg:grid-rows-4">
            {Array.from({ length: endPoint }).map((_, index) => (
              <NewsCardSkeleton
                key={index}
                type={index === 0 ? "grid" : "list"}
                className={cn("", {
                  "md:row-span-3 md:text-xl": index === 0,
                })}
              />
            ))}

            {hasAd && (
              <div className="md:row-span-4 md:text-xl">
                <div className="bg-muted h-full w-full animate-pulse rounded" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventNewsSection;
