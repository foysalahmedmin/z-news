import { cn } from "@/lib/utils";
import NewsCardSkeleton from "../../cards-skeleton/NewsCardSkeleton";

const CategoryNewsFeaturedSectionSkeleton: React.FC<{
  hasAd?: boolean;
}> = ({ hasAd = false }) => {
  const endPoint = hasAd ? 4 : 7;

  return (
    <section>
      <div className="container">
        <div>
          <div className="grid gap-4 md:grid-flow-col md:grid-cols-2 md:grid-rows-5 lg:grid-cols-3 lg:grid-rows-3">
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
              <div className="md:row-span-3 md:text-xl">
                <div className="bg-muted h-full w-full animate-pulse rounded" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryNewsFeaturedSectionSkeleton;
