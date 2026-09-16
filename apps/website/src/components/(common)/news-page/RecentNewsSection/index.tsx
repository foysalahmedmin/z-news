import NewsCard from "@/components/cards/NewsCard";
import { fetchBulkNews } from "@/services/news.service";
import { Clock } from "lucide-react";

const RecentNewsSection = async () => {
  const { data } = await fetchBulkNews({
    page: 1,
    limit: 8,
    sort: "-published_at",
  });

  if (data?.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock size={20} />
        <h3 className="text-xl font-bold">সাম্প্রতিক সংবাদ</h3>
      </div>

      <div className="space-y-2">
        {data?.map((item, index) => (
          <div key={index} className="border-b py-2 last:border-b-0">
            <NewsCard
              className="text-sm"
              classNameThumbnail="md:w-1/3"
              classNameDescription="hidden"
              news={item}
              type="list"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentNewsSection;
