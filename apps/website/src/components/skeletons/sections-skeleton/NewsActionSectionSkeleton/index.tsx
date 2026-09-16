import React from "react";

const NewsActionSectionSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl animate-pulse">
      <div className="bg-card rounded-md border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left side buttons */}
          <div className="flex items-center gap-4">
            {/* Reaction Skeleton */}
            <div className="bg-muted flex h-10 divide-x rounded-md">
              <div className="flex items-center gap-1 px-2">
                <div className="bg-muted-foreground/30 h-5 w-5 rounded" />
                <div className="bg-muted-foreground/30 h-4 w-6 rounded" />
              </div>
              <div className="flex items-center gap-1 px-2">
                <div className="bg-muted-foreground/30 h-5 w-5 rounded" />
                <div className="bg-muted-foreground/30 h-4 w-6 rounded" />
              </div>
            </div>

            {/* Print Skeleton */}
            <div className="bg-muted flex h-10 items-center rounded-md p-1">
              <div className="bg-muted-foreground/30 h-5 w-5 rounded" />
            </div>

            {/* Share Skeleton */}
            <div className="bg-muted flex h-10 items-center rounded-md p-1">
              <div className="bg-muted-foreground/30 h-5 w-5 rounded" />
            </div>
          </div>

          {/* View Count Skeleton */}
          <div className="flex h-10 items-center divide-x rounded-md">
            <div className="flex items-center gap-1 px-2">
              <div className="bg-muted-foreground/30 h-5 w-5 rounded" />
              <div className="bg-muted-foreground/30 h-4 w-8 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsActionSectionSkeleton;
