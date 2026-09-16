import NewsCard from "@/components/cards/NewsCard";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { fetchBulkNews } from "@/services/news.service";
import { TEvent } from "@/types/event.type";
import Link from "next/link";

const EventNewsSection: React.FC<{
  event?: Partial<TEvent>;
}> = async ({ event }) => {
  const { _id, slug, name, icon, layout = "default" } = event || {};

  const { data } = await fetchBulkNews({
    page: 1,
    limit: layout === "minimal" ? 6 : layout === "featured" ? 7 : 5,
    ...(_id && { event: _id }),
    sort: "-published_at,-is_featured",
  });

  if (!data?.length) return null;

  // Reusable Event Header Component
  const EventHeader = () => (
    <div className="mb-10 flex flex-col items-center justify-center text-center">
      <div className="bg-background mb-4 inline-flex items-center justify-center rounded-full p-3 shadow-md">
        {icon && <Icon className="text-primary size-8" name={icon} />}
      </div>

      {slug ? (
        <Link
          href={`/event/${slug}`}
          className="group transition-all duration-300"
        >
          <h2 className="text-foreground group-hover:text-primary text-3xl font-bold transition-colors md:text-4xl">
            {name}
          </h2>
          <div className="bg-primary mx-auto mt-4 h-1 w-20 rounded-full transition-all duration-300 group-hover:w-32" />
        </Link>
      ) : (
        <div>
          <h2 className="text-foreground text-3xl font-bold md:text-4xl">
            {name}
          </h2>
          <div className="bg-primary mx-auto mt-4 h-1 w-20 rounded-full" />
        </div>
      )}
    </div>
  );

  // Default Layout: Original 3-column centered design
  if (layout === "default") {
    const lead = data?.[0];
    const topData = data?.slice(1, 5);

    if (data.length < 5) return null;

    return (
      <section className="bg-amber-500/5 py-10 md:py-16">
        <div className="container mx-auto px-4">
          <EventHeader />

          {/* News Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:grid-rows-2">
            {/* Left Column */}
            <div className="flex flex-col gap-6 lg:col-span-3 lg:row-span-2">
              {topData?.slice(0, 2).map((item, index) => (
                <NewsCard
                  key={index}
                  className="border-foreground/25 rounded border border-dashed bg-transparent p-4 lg:h-full"
                  type="grid"
                  news={item}
                />
              ))}
            </div>

            {/* Lead News - Middle */}
            <div className="lg:col-span-6 lg:row-span-2">
              <NewsCard
                className="border-foreground/25 border border-dashed bg-transparent p-4 lg:h-full lg:text-3xl"
                type="grid"
                news={lead || {}}
              />
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6 lg:col-span-3 lg:row-span-2">
              {topData?.slice(2, 4).map((item, index) => (
                <NewsCard
                  key={index}
                  className="border-foreground/25 rounded border border-dashed bg-transparent p-4 lg:h-full"
                  type="grid"
                  news={item}
                />
              ))}
            </div>
          </div>

          {/* View All Link */}
          {slug && (
            <div className="mt-12 text-center">
              <Link
                href={`/event/${slug}`}
                className="text-primary hover:text-primary/80 inline-flex items-center font-medium transition-colors"
              >
                এই ইভেন্টের সব খবর দেখুন
                <Icon name="arrow-right" className="ml-2 size-5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Standard Layout: Enhanced grid with better styling
  if (layout === "standard") {
    const lead = data?.[0];
    const gridItems = data?.slice(1, 5) || [];

    if (data.length < 5) return null;

    return (
      <section className="bg-muted/50 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <EventHeader />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Featured Lead Card */}
            {lead && (
              <div className="md:col-span-2 lg:col-span-1">
                <NewsCard
                  className="group h-full overflow-hidden rounded-xl border bg-card shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
                  classNameThumbnail="aspect-video"
                  classNameThumbnailImage="transition-transform duration-300 group-hover:scale-110"
                  classNameTitle="text-xl md:text-2xl font-bold px-4 pt-4 line-clamp-2"
                  classNameDescription="text-sm px-4 pb-4 line-clamp-3"
                  type="grid"
                  news={lead}
                />
              </div>
            )}

            {/* Grid Items */}
            {gridItems.map((item, index) => (
              <NewsCard
                key={index}
                className="group h-full overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md hover:scale-[1.01]"
                classNameThumbnail="aspect-video"
                classNameThumbnailImage="transition-transform duration-300 group-hover:scale-110"
                classNameTitle="text-lg font-semibold px-4 pt-4 line-clamp-2"
                classNameDescription="text-sm px-4 pb-4 line-clamp-2"
                type="grid"
                news={item}
              />
            ))}
          </div>

          {/* View All Link */}
          {slug && (
            <div className="mt-12 text-center">
              <Link
                href={`/event/${slug}`}
                className="text-primary hover:text-primary/80 inline-flex items-center font-medium transition-colors"
              >
                এই ইভেন্টের সব খবর দেখুন
                <Icon name="arrow-right" className="ml-2 size-5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Featured Layout: Premium hero + grid design
  if (layout === "featured") {
    const lead = data?.[0];
    const gridItems = data?.slice(1, 7) || [];

    return (
      <section className="bg-gradient-to-b from-amber-50/50 via-background to-muted/30 py-12 md:py-20 dark:from-amber-950/20">
        <div className="container mx-auto px-4">
          <EventHeader />

          {/* Hero Card */}
          {lead && (
            <div className="mb-8 overflow-hidden rounded-2xl border-2 border-primary/20 bg-card shadow-2xl transition-shadow hover:shadow-3xl">
              <NewsCard
                className="border-0 p-0"
                classNameThumbnail="aspect-[21/9] w-full"
                classNameThumbnailImage="w-full h-full object-cover"
                classNameTitle="text-2xl md:text-4xl lg:text-5xl font-bold px-6 pt-6"
                classNameDescription="text-base md:text-lg px-6 pb-6 line-clamp-4"
                type="list"
                news={lead}
              />
            </div>
          )}

          {/* Premium Grid */}
          {gridItems.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gridItems.map((item, index) => (
                <NewsCard
                  key={index}
                  className="group overflow-hidden rounded-xl border bg-card shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
                  classNameThumbnail="aspect-video"
                  classNameThumbnailImage="transition-transform duration-300 group-hover:scale-110"
                  classNameTitle="text-lg md:text-xl font-semibold px-4 pt-4 line-clamp-2"
                  classNameDescription="text-sm px-4 pb-4 line-clamp-3"
                  type="grid"
                  news={item}
                />
              ))}
            </div>
          )}

          {/* View All Link */}
          {slug && (
            <div className="mt-12 text-center">
              <Link
                href={`/event/${slug}`}
                className="text-primary hover:text-primary/80 inline-flex items-center font-medium transition-colors"
              >
                এই ইভেন্টের সব খবর দেখুন
                <Icon name="arrow-right" className="ml-2 size-5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Minimal Layout: Clean list-based design
  if (layout === "minimal") {
    const topData = data?.slice(0, 6) || [];

    return (
      <section className="border-y bg-background py-8 md:py-12">
        <div className="container mx-auto px-4">
          <EventHeader />

          <div className="space-y-4 md:space-y-6">
            {topData.map((item, index) => (
              <div
                key={index}
                className="group border-b border-dashed border-muted-foreground/30 pb-4 last:border-0 last:pb-0 transition-colors hover:border-primary/50"
              >
                <NewsCard
                  className="flex-row items-center gap-4 border-0 p-0"
                  classNameThumbnail="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded"
                  classNameThumbnailImage="w-full h-full object-cover"
                  classNameTitle="text-base md:text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors"
                  classNameDescription="text-sm text-muted-foreground line-clamp-2 mt-1"
                  type="list"
                  news={item}
                />
              </div>
            ))}
          </div>

          {/* View All Link */}
          {slug && (
            <div className="mt-8 text-center">
              <Link
                href={`/event/${slug}`}
                className="text-primary hover:text-primary/80 inline-flex items-center font-medium transition-colors"
              >
                এই ইভেন্টের সব খবর দেখুন
                <Icon name="arrow-right" className="ml-2 size-5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Fallback (should not reach here)
  return null;
};

export default EventNewsSection;
