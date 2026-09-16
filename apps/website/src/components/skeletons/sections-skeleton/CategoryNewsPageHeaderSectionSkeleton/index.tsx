import React from "react";

const CategoryNewsPageHeaderSectionSkeleton: React.FC = () => {
  return (
    <section>
      <div className="bg-accent text-accent-foreground shadow">
        <div className="space-y-4 py-6">
          {/* Category Icon + Name */}
          <div className="container flex items-center gap-2 md:gap-4">
            <div className="bg-muted size-8 animate-pulse rounded-full md:size-10" />
            <div className="bg-muted h-6 w-32 animate-pulse rounded md:h-8 md:w-48" />
          </div>

          <div className="container">
            <hr className="border-muted" />
          </div>

          {/* Children categories */}
          <div className="container flex flex-wrap items-center gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="bg-muted h-4 w-20 animate-pulse rounded"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryNewsPageHeaderSectionSkeleton;
