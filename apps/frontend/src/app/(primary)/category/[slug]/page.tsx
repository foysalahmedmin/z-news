import CategoryNewsFeaturedSection from "@/components/(common)/category-page/CategoryNewsFeaturedSection";
import CategoryNewsMoreSection from "@/components/(common)/category-page/CategoryNewsMoreSection";
import CategoryNewsPageHeaderSection from "@/components/(common)/category-page/CategoryNewsPageHeaderSection";
import CategoryNewsSection from "@/components/sections/CategoryNewsSection";
import CategoryNewsSectionSkeleton from "@/components/skeletons/sections-skeleton/CategoryNewsSectionSkeleton";
import { fetchCategory } from "@/services/category.service";
import { fetchBulkNews } from "@/services/news.service";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;

// No category pages at build time; each is rendered on first visit, then
// served from the ISR cache (revalidated on demand by tag).
export const generateStaticParams = async () => [];

export const generateMetadata = async ({ params }: Props) => {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data } = await fetchCategory(decodedSlug);
  if (!data) return { title: "Category Not Found" };
  return {
    title: `${data?.name} - Z-News`,
    description: data?.description,
  };
};

const CategoryNewPage = async ({ params }: Props) => {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data } = await fetchCategory(decodedSlug);
  if (!data) notFound();

  // First page of the archive is server-rendered so its links are in the HTML.
  const moreNews = await fetchBulkNews({
    page: 1,
    limit: 12,
    category: data._id,
    sort: "-published_at",
  });

  const hasSubCategory = data?.children && data?.children.length > 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-8rem)]">
      <CategoryNewsPageHeaderSection category={data} />
      <div className="space-y-10 py-6 md:space-y-16 md:py-10">
        <CategoryNewsFeaturedSection category={data} />

        {hasSubCategory && (
          <>
            {data?.children?.map((category) => (
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
          </>
        )}

        <div className="container">
          <hr />
        </div>

        <CategoryNewsMoreSection category={data} initial={moreNews} />
      </div>
    </div>
  );
};

export default CategoryNewPage;
