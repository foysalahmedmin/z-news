import EventNewsFeaturedSection from "@/components/(common)/event-page/EventNewsFeaturedSection";
import EventNewsMoreSection from "@/components/(common)/event-page/EventNewsMoreSection";
import EventNewsPageHeaderSection from "@/components/(common)/event-page/EventNewsPageHeaderSection";
import { fetchEvent } from "@/services/event.service";
import { fetchBulkNews } from "@/services/news.service";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;

// No event pages at build time; each is rendered on first visit, then
// served from the ISR cache (revalidated on demand by tag).
export const generateStaticParams = async () => [];

export const generateMetadata = async ({ params }: Props) => {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data } = await fetchEvent(decodedSlug);
  if (!data) return { title: "Event Not Found" };
  return {
    title: `${data?.name} - Z-News`,
    description: data?.description,
  };
};

const EventNewPage = async ({ params }: Props) => {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data } = await fetchEvent(decodedSlug);
  if (!data) notFound();

  // First page of the archive is server-rendered so its links are in the HTML.
  const moreNews = await fetchBulkNews({
    page: 1,
    limit: 12,
    event: data._id,
    sort: "-published_at",
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-8rem)]">
      <EventNewsPageHeaderSection event={data} />
      <div className="space-y-10 py-6 md:space-y-16 md:py-10">
        <EventNewsFeaturedSection event={data} />

        <div className="container">
          <hr />
        </div>

        <EventNewsMoreSection event={data} initial={moreNews} />
      </div>
    </div>
  );
};

export default EventNewPage;
