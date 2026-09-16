import NewsBreaksSection from "@/components/(common)/home-page/NewsBreaksSection";
import NewsFeaturedSection from "@/components/(common)/home-page/NewsFeaturedSection";
import NewsHeadlinesSection from "@/components/(common)/home-page/NewsHeadlinesSection";
import CategoryNewsSection from "@/components/sections/CategoryNewsSection";
import EventNewsSection from "@/components/sections/EventNewsSection";
import CategoryNewsSectionSkeleton from "@/components/skeletons/sections-skeleton/CategoryNewsSectionSkeleton";
import { fetchCategories } from "@/services/category.service";
import { fetchEvents } from "@/services/event.service";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Z-News",
  description: "Z-News",
};

export const revalidate = 15;

const HomePage: React.FC = async () => {
  const { data: events } = await fetchEvents({
    page: 1,
    limit: 1,
    sort: "-published_at",
    is_featured: true,
  });

  const { data: categories } = await fetchCategories({
    page: 1,
    limit: 15,
    sort: "sequence",
    is_featured: true,
  });

  return (
    <main className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-8rem)]">
      <NewsBreaksSection />
      <NewsHeadlinesSection />
      {events?.map((event) => (
        <Suspense
          key={event._id}
          fallback={
            <div>
              <CategoryNewsSectionSkeleton />
            </div>
          }
        >
          <EventNewsSection event={event} />
        </Suspense>
      ))}

      <div className="space-y-10 py-6 md:space-y-16 md:py-10">
        <NewsFeaturedSection />

        <CategoryNewsSection
          category={{ name: "সাম্প্রতিক সংবাদ", icon: "clock" }}
        />

        {categories?.map((category) => (
          <Suspense
            key={category._id}
            fallback={
              <div>
                <CategoryNewsSectionSkeleton />
              </div>
            }
          >
            <CategoryNewsSection category={category} />
          </Suspense>
        ))}
      </div>
    </main>
  );
};

export default HomePage;
