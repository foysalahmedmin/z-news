import NewsCard from "@/components/cards/NewsCard";
import { cn } from "@/lib/utils";
import { fetchBulkNews } from "@/services/news.service";

const NewsFeaturedSection = async () => {
  const { data } = await fetchBulkNews({ page: 1, limit: 5, is_featured: true });

  const lead = data?.[0];
  const bottom = data?.slice(1, 5).filter(Boolean) || [];

  return (
    <section>
      <div className="container">
        <div className="space-y-6 md:space-y-10">
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <NewsCard
              className={cn(
                "border-primary md:text-2xl lg:col-span-2 lg:items-start lg:text-5xl",
              )}
              classNameThumbnail={cn("md:relative md:w-1/2 lg:w-1/3")}
              classNameThumbnailImage={cn(
                "md:aspect-auto absolute inset-0 md:w-full md:h-full",
              )}
              classNameDescription={cn(
                "md:line-clamp-4 line-clamp-3 mt-auto md:text-[0.5em] lg:line-clamp-5",
              )}
              type={"list"}
              news={lead}
            />
          </div>

          <hr />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {bottom?.map((item, index) => (
              <NewsCard
                classNameTitle="line-clamp-none"
                classNameDescription="mt-auto"
                type="grid"
                news={item}
                key={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsFeaturedSection;
