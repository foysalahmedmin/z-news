import { cn } from "@/lib/utils";
import { fetchBulkNews } from "@/services/news.service";
import { TNews } from "@/types/news.type";
import { formatCount } from "@/utils/formatCount";
import { Dot, Newspaper } from "lucide-react";
import Link from "next/link";

type SuggestionNewsProps = {
  news?: Partial<TNews>;
};

const SuggestionNews = async ({ news }: SuggestionNewsProps) => {
  if (!news?.category?._id) return null;

  const { data } = await fetchBulkNews({
    page: 1,
    limit: 8,
    news_ne: news?._id,
    category: news.category._id,
    sort: "-published_at",
  });

  if (data?.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Newspaper size={20} />
        <h3 className="text-xl font-bold">পড়তে পারেন</h3>
      </div>

      <div className="space-y-2">
        {data?.map((item, index) => (
          <div
            key={item._id || index}
            className="border-b pb-2 last:border-b-0 last:pb-0"
          >
            <Link
              href={`/news/${item.slug}`}
              className="group flex items-start gap-2"
            >
              <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                {formatCount(index + 1)}
              </div>
              <h3
                className={cn(
                  "mb-[0.25em] space-x-[0.5em] text-[1.125em] leading-[1.25] font-semibold group-hover:text-blue-900",
                )}
              >
                {item?.sub_title && (
                  <>
                    <span className="text-red-700">{item.sub_title}</span>{" "}
                    <Dot className="text-muted-foreground size-[1em]" />
                  </>
                )}
                <span>{item.title}</span>
              </h3>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionNews;
