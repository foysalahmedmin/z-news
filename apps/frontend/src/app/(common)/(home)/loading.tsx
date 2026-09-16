import CategoryNewsSectionSkeleton from "@/components/skeletons/sections-skeleton/CategoryNewsSectionSkeleton";
import NewsFeaturedSectionSkeleton from "@/components/skeletons/sections-skeleton/NewsFeaturedSectionSkeleton";
import NewsHeadlinesSectionSkeleton from "@/components/skeletons/sections-skeleton/NewsHeadlinesSectionSkeleton";

const HomePageLoading: React.FC = () => {
  return (
    <div>
      <NewsHeadlinesSectionSkeleton />
      <div className="space-y-10 py-6 md:space-y-16 md:py-10">
        <NewsFeaturedSectionSkeleton />
        <>
          {Array.from({ length: 3 })?.map((_, i) => (
            <CategoryNewsSectionSkeleton key={i} />
          ))}
        </>
      </div>
    </div>
  );
};

export default HomePageLoading;
