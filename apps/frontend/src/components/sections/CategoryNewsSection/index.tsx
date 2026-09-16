import NewsCard from "@/components/cards/NewsCard";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { fetchBulkNews } from "@/services/news.service";
import { TCategory } from "@/types/category.type";
import Link from "next/link";

const CategoryNewsSection: React.FC<{
  category?: Partial<TCategory>;
}> = async ({ category }) => {
  const { _id, slug, name, icon, layout = "default" } = category || {};

  const { data } = await fetchBulkNews({
    page: 1,
    limit: layout === "minimal" ? 6 : layout === "featured" ? 7 : 10,
    ...(_id && { category: _id }),
    sort: "-published_at",
  });

  if (!data?.length) return null;

  // Header component (reusable)
  const CategoryHeader = () => (
    <div className="flex items-center gap-4">
      <div className="relative">
        {slug ? (
          <Link
            href={`/category/${slug}`}
            className="relative z-10 flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            {icon && (
              <Icon className="ml-3 size-8 md:size-10" name={icon} />
            )}
            <h2 className="text-xl font-bold md:text-3xl">{name}</h2>
          </Link>
        ) : (
          <div className="relative z-10 flex items-center gap-2">
            {icon && (
              <Icon className="ml-3 size-8 md:size-10" name={icon} />
            )}
            <h2 className="text-xl font-bold md:text-3xl">{name}</h2>
          </div>
        )}

        <div className="absolute inset-0 my-auto flex w-fit items-center gap-2 opacity-10">
          {icon && <Icon className="size-14 md:size-16" name={icon} />}
        </div>
      </div>
      <div className="border-muted-foreground flex-1 border-y py-1" />
    </div>
  );

  // Default Layout: Masonry grid with featured first item
  if (layout === "default") {
    const hasAd = false;
    const endPoint = hasAd ? 6 : 10;
    const topData = data?.slice(0, endPoint);

    if (data.length < 10) return null;

    return (
      <section className="">
        <div className="container space-y-6 md:space-y-10">
          <CategoryHeader />
          <div>
            <div className="grid gap-4 md:grid-flow-col md:grid-cols-2 md:grid-rows-6 lg:grid-cols-3 lg:grid-rows-4">
              {topData?.map((item, index) => (
                <NewsCard
                  className={cn("", {
                    "md:row-span-3 md:text-xl": index === 0,
                  })}
                  classNameDescription={cn("", {
                    "md:line-clamp-2 lg:line-clamp-1 xl:line-clamp-2 2xl:line-clamp-3":
                      index !== 0,
                  })}
                  type={index === 0 ? "grid" : "list"}
                  news={item}
                  key={index}
                />
              ))}
              {hasAd && (
                <div className="md:row-span-4 md:text-xl">
                  <div>{/* <Ad /> */}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Standard Layout: Enhanced grid with background
  if (layout === "standard") {
    const hasAd = false;
    const endPoint = hasAd ? 6 : 10;
    const topData = data?.slice(0, endPoint);

    if (data.length < 10) return null;

    return (
      <section className="bg-muted/50 py-10 md:py-16">
        <div className="container space-y-6 md:space-y-10">
          <CategoryHeader />
          <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {topData?.map((item, index) => (
                <NewsCard
                  className={cn("bg-card rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md", {
                    "md:col-span-2 lg:col-span-2 xl:col-span-2": index === 0,
                  })}
                  classNameDescription={cn("", {
                    "line-clamp-3": index === 0,
                    "line-clamp-2": index !== 0,
                  })}
                  type={index === 0 ? "list" : "grid"}
                  news={item}
                  key={index}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Featured Layout: Hero card + premium grid
  if (layout === "featured") {
    const lead = data?.[0];
    const gridItems = data?.slice(1, 7) || [];

    return (
      <section className="bg-gradient-to-b from-background to-muted/30 py-12 md:py-20">
        <div className="container space-y-8 md:space-y-12">
          <CategoryHeader />
          
          {/* Hero Card */}
          {lead && (
            <div className="overflow-hidden rounded-xl border bg-card shadow-lg transition-shadow hover:shadow-xl">
              <NewsCard
                className="border-0 p-0"
                classNameThumbnail="aspect-video w-full"
                classNameThumbnailImage="w-full h-full object-cover"
                classNameTitle="text-2xl md:text-4xl lg:text-5xl font-bold px-6 pt-6"
                classNameDescription="text-base md:text-lg px-6 pb-6 line-clamp-4"
                type="list"
                news={lead}
              />
            </div>
          )}

          {/* Premium Grid */}
          {gridItems.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gridItems.map((item, index) => (
                <NewsCard
                  className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]"
                  classNameThumbnail="aspect-video"
                  classNameThumbnailImage="transition-transform duration-300 group-hover:scale-110"
                  classNameTitle="text-lg md:text-xl font-semibold px-4 pt-4 line-clamp-2"
                  classNameDescription="text-sm px-4 pb-4 line-clamp-3"
                  type="grid"
                  news={item}
                  key={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Minimal Layout: Clean list-based design
  if (layout === "minimal") {
    const topData = data?.slice(0, 6) || [];

    return (
      <section className="border-y py-8 md:py-12">
        <div className="container space-y-6 md:space-y-8">
          <CategoryHeader />
          <div className="space-y-4 md:space-y-6">
            {topData.map((item, index) => (
              <div
                key={index}
                className="group border-b border-dashed pb-4 last:border-0 last:pb-0 transition-colors hover:border-primary/50"
              >
                <NewsCard
                  className="flex-row items-center gap-4 border-0 p-0"
                  classNameThumbnail="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded"
                  classNameThumbnailImage="w-full h-full object-cover"
                  classNameTitle="text-base md:text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors"
                  classNameDescription="text-sm text-muted-foreground line-clamp-2 mt-1"
                  type="list"
                  news={item}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Fallback (should not reach here)
  return null;
};

export default CategoryNewsSection;
