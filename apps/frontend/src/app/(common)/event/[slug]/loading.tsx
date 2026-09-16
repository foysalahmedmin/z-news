import CategoryNewsFeaturedSectionSkeleton from "@/components/skeletons/sections-skeleton/CategoryNewsFeaturedSectionSkeleton";
import CategoryNewsMoreSectionSkeleton from "@/components/skeletons/sections-skeleton/CategoryNewsMoreSectionSkeleton";
import CategoryNewsPageHeaderSectionSkeleton from "@/components/skeletons/sections-skeleton/CategoryNewsPageHeaderSectionSkeleton";

const EventNewPageLoading = async () => {
  return (
    <div>
      <CategoryNewsPageHeaderSectionSkeleton />
      <div className="space-y-10 py-6 md:space-y-16 md:py-10">
        <CategoryNewsFeaturedSectionSkeleton />
        <div className="container">
          <hr />
        </div>
        <CategoryNewsMoreSectionSkeleton />
      </div>
    </div>
  );
};

export default EventNewPageLoading;
