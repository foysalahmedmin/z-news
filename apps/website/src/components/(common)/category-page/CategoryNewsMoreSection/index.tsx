"use client";

import NewsCard from "@/components/cards/NewsCard";
import NewsCardSkeleton from "@/components/skeletons/cards-skeleton/NewsCardSkeleton";
import { Button } from "@/components/ui/Button";
import { fetchBulkNews } from "@/services/news.service";
import { TCategory } from "@/types/category.type";
import { TNews } from "@/types/news.type";
import React, { useEffect, useState } from "react";

type CategoryNewsMoreSectionProps = {
  category?: Partial<TCategory>;
};

const CategoryNewsMoreSection: React.FC<CategoryNewsMoreSectionProps> = ({
  category,
}) => {
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<TNews[]>([]);
  const [meta, setMeta] = useState<{
    total?: number;
    limit?: number;
    page?: number;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const hasMore = !!(meta?.total && meta?.total > data?.length);

  useEffect(() => {
    if (!category?._id) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data, meta } = await fetchBulkNews({
          page,
          limit: 12,
          category: category?._id,
          sort: "-published_at",
        });
        setData((prev) => [...prev, ...(data || [])]);
        setMeta(meta || {});
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page]);
  return (
    <section>
      <div className="container">
        <div>
          {isLoading && page === 1 ? (
            <div className="space-y-6 md:space-y-10">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <NewsCardSkeleton key={index} type="grid" />
                ))}
              </div>
            </div>
          ) : data.length === 0 ? (
            <p className="py-4 text-center">কোন সংবাদ পাওয়া যায়নি</p>
          ) : (
            <div className="space-y-6 md:space-y-10">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {data?.map((item, index) => (
                  <NewsCard key={index} type="grid" news={item} />
                ))}
              </div>
            </div>
          )}
        </div>
        {hasMore && (
          <div className="mt-10 flex justify-center">
            <Button
              className="primary mx-4"
              onClick={() => setPage((prev) => prev + 1)}
              isLoading={isLoading}
              size={"lg"}
            >
              {isLoading ? "লোড হচ্ছে..." : "আরও দেখুন"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryNewsMoreSection;
