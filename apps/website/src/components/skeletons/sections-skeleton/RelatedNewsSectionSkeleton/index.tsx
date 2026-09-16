import React from "react";

const RelatedNewsSectionSkeleton: React.FC = () => {
  // Number of skeleton news cards to show
  const skeletonCount = 6;

  return (
    <section className="container mx-auto max-w-4xl animate-pulse">
      <div className="bg-card space-y-6 rounded-md border p-6 shadow-sm">
        {/* Header Skeleton */}
        <div className="flex items-center gap-2">
          <div className="bg-muted-foreground/30 h-5 w-5 rounded" />
          <div className="bg-muted-foreground/30 h-6 w-40 rounded" />
        </div>

        {/* News Cards Skeleton */}
        <div className="space-y-6">
          <div className="grid">
            {[...Array(skeletonCount)].map((_, i) => (
              <div key={i} className="border-b py-2 last:border-0">
                {/* Simulate list card with two lines */}
                <div className="bg-muted-foreground/30 mb-2 h-4 w-3/4 rounded" />
                <div className="bg-muted-foreground/20 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Load More Button Skeleton */}
        <div className="mt-10 flex justify-center">
          <div className="bg-muted-foreground/30 h-10 w-36 rounded" />
        </div>
      </div>
    </section>
  );
};

export default RelatedNewsSectionSkeleton;
