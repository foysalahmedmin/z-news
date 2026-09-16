import React from "react";

const NewsHeadlinesSectionSkeleton: React.FC = () => {
  return (
    <section className="bg-card text-card-foreground top-0 shadow md:sticky md:z-30">
      <div className="relative container">
        <div className="relative flex flex-col items-center lg:flex-row">
          {/* Left: Title section */}
          <div className="bg-primary text-primary-foreground flex h-12 w-full items-center justify-center gap-2 px-4 lg:w-auto">
            <div className="relative flex size-4">
              <span className="bg-muted absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
              <span className="bg-muted relative inline-flex size-4 rounded-full"></span>
            </div>
            <div className="bg-muted h-4 w-16 animate-pulse rounded" />
          </div>

          {/* Right: Headlines Marquee */}
          <div className="relative flex h-12 w-full items-center overflow-hidden lg:w-auto lg:flex-1">
            <div className="via-card from-card absolute -end-1 top-0 bottom-0 z-20 w-10 bg-gradient-to-l to-transparent" />
            <div className="via-card from-card absolute -start-1 top-0 bottom-0 z-20 w-10 bg-gradient-to-r to-transparent" />

            {/* Fake moving skeleton items */}
            <div className="flex animate-pulse">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="border-muted flex items-center border-r px-4"
                >
                  <div className="bg-muted h-4 w-32 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsHeadlinesSectionSkeleton;
