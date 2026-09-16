import NewsCard from "@/components/cards/NewsCard";
import { cn } from "@/lib/utils";
import { fetchBulkNews } from "@/services/news.service";
import { TCategory } from "@/types/category.type";
import React from "react";

const CategoryNewsFeaturedSection: React.FC<{
  category?: Partial<TCategory>;
}> = async ({ category }) => {
  const { data } = await fetchBulkNews({
    page: 1,
    limit: 7,
    category: category?._id,
    sort: "-is_featured,-published_at",
  });

  const hasAd = false;
  const endPoint = hasAd ? 4 : 7;

  const topData = data?.slice(0, endPoint);

  return (
    <section>
      <div className="container">
        <div>
          <div className="grid gap-4 md:grid-flow-col md:grid-cols-2 md:grid-rows-5 lg:grid-cols-3 lg:grid-rows-3">
            {topData?.map((item, index) => (
              <NewsCard
                className={cn("", {
                  "md:row-span-3 md:text-xl": index === 0,
                })}
                type={index === 0 ? "grid" : "list"}
                news={item}
                key={index}
              />
            ))}
            {hasAd && (
              <div className="md:row-span-3 md:text-xl">
                <div>{/* <Ad /> */}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryNewsFeaturedSection;
