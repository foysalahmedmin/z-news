import React from "react";

const NewsDetailsSectionSkeleton: React.FC = () => {
  return (
    <article className="container mx-auto max-w-4xl animate-pulse space-y-6 md:space-y-10">
      {/* Breadcrumb */}
      <div className="space-y-4 md:space-y-6">
        <nav className="text-muted-foreground flex gap-2 text-sm">
          <div className="bg-muted h-4 w-10 rounded" />
          <span>/</span>
          <div className="bg-muted h-4 w-16 rounded" />
          <span>/</span>
          <div className="bg-muted h-4 w-24 rounded" />
        </nav>

        <div className="space-y-4">
          {/* Title */}
          <div className="bg-muted h-8 w-3/4 rounded md:h-12" />

          {/* Description */}
          <div className="space-y-2">
            <div className="bg-muted h-4 w-full rounded" />
            <div className="bg-muted h-4 w-5/6 rounded" />
          </div>
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-y-2 text-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border-muted flex items-center gap-2 border-l px-2"
            >
              <div className="bg-muted h-4 w-4 rounded-full" />
              <div className="bg-muted h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>

      <hr />

      <div className="space-y-6 md:space-y-10">
        {/* Thumbnail */}
        <div className="bg-muted aspect-video w-full rounded-md" />

        {/* Content */}
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`bg-muted h-4 rounded ${
                i % 3 === 0 ? "w-5/6" : "w-full"
              }`}
            />
          ))}
        </div>

        {/* Additional Images */}
        <div>
          <div className="bg-muted mb-4 h-6 w-24 rounded" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-muted h-48 w-full rounded-md" />
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-muted h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>
    </article>
  );
};

export default NewsDetailsSectionSkeleton;
