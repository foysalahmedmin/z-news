import { cn } from "@/lib/utils";
import NewsCardSkeleton from "../../cards-skeleton/NewsCardSkeleton";

const NewsFeaturedSectionSkeleton: React.FC = () => {
  const topCount = 3;
  const bottomCount = 4;

  return (
    <section>
      <div className="container">
        <div className="space-y-6 md:space-y-10">
          {/* Top grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: topCount }).map((_, index) => (
              <NewsCardSkeleton
                className={cn("md:text-2xl", {
                  "border-muted border-s-4 md:col-span-2 lg:items-start lg:text-5xl":
                    index === 0,
                })}
                type={"list"}
                key={index}
              />
            ))}
          </div>

          <hr className="border-muted" />

          {/* Bottom grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: bottomCount }).map((_, index) => (
              <NewsCardSkeleton key={index} type="grid" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsFeaturedSectionSkeleton;
