import NewsCardSkeleton from "../../cards-skeleton/NewsCardSkeleton";

const CategoryNewsMoreSectionSkeleton: React.FC<{
  itemCount?: number;
}> = ({ itemCount = 12 }) => {
  return (
    <section>
      <div className="container">
        <div className="space-y-6 md:space-y-10">
          {/* Grid of news skeletons */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: itemCount }).map((_, index) => (
              <NewsCardSkeleton key={index} type="grid" />
            ))}
          </div>
        </div>

        {/* Load More Button skeleton */}
        <div className="mt-10 flex justify-center">
          <div className="bg-muted h-12 w-40 animate-pulse rounded" />
        </div>
      </div>
    </section>
  );
};

export default CategoryNewsMoreSectionSkeleton;
