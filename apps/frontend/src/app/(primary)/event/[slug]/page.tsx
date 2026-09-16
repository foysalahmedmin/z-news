import EventNewsFeaturedSection from "@/components/(common)/event-page/EventNewsFeaturedSection";
import EventNewsMoreSection from "@/components/(common)/event-page/EventNewsMoreSection";
import EventNewsPageHeaderSection from "@/components/(common)/event-page/EventNewsPageHeaderSection";
import { fetchEvent } from "@/services/event.service";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 15;

export const generateMetadata = async ({ params }: Props) => {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data } = await fetchEvent(decodedSlug);
  return {
    title: `${data?.name} - Z-News`,
    description: data?.description,
  };
};

const EventNewPage = async ({ params }: Props) => {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data } = await fetchEvent(decodedSlug);

  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-8rem)]">
      <EventNewsPageHeaderSection event={data} />
      <div className="space-y-10 py-6 md:space-y-16 md:py-10">
        <EventNewsFeaturedSection event={data} />

        <div className="container">
          <hr />
        </div>

        <EventNewsMoreSection event={data} />
      </div>
    </div>
  );
};

export default EventNewPage;
