import { fetchBulkNewsHeadlines } from "@/services/news-headline.service";
import Link from "next/link";
import Marquee from "react-fast-marquee";

const NewsHeadlinesSection = async () => {
  const { data } = await fetchBulkNewsHeadlines({
    page: 1,
    limit: 10,
    sort: "-published_at",
  });
  return (
    <>
      {data && data?.length > 0 && (
        <section className="bg-card text-card-foreground top-0 shadow md:sticky md:z-30">
          <div className="relative container">
            <div className="relative flex flex-col items-center lg:flex-row">
              <div className="bg-primary text-primary-foreground flex h-12 w-full items-center justify-center gap-2 px-4 lg:w-auto">
                <span className="relative flex size-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex size-4 rounded-full bg-red-500"></span>
                </span>
                <h3 className="font-bold whitespace-nowrap">শিরোনাম</h3>
              </div>

              {/* Marquee container should take full available width */}
              <div className="relative flex h-12 w-full items-center overflow-hidden lg:w-auto lg:flex-1">
                <div className="via-card from-card absolute -end-1 top-0 bottom-0 z-20 w-10 bg-gradient-to-l to-transparent" />
                <div className="via-card from-card absolute -start-1 top-0 bottom-0 z-20 w-10 bg-gradient-to-r to-transparent" />
                <Marquee speed={50} pauseOnHover gradient={false}>
                  <ul className="flex whitespace-nowrap">
                    {data?.map((headline) => (
                      <li
                        className="border-primary border-r px-4"
                        key={headline._id}
                      >
                        {headline?.news?.slug ? (
                          <Link
                            href={`/news/${headline?.news?.slug}`}
                            className="underline-effect foreground hover:underline-effect-active whitespace-nowrap uppercase transition-colors duration-200"
                          >
                            {headline?.news?.title}
                          </Link>
                        ) : (
                          <span className="underline-effect foreground hover:underline-effect-active whitespace-nowrap uppercase transition-colors duration-200">
                            {headline?.news?.title}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </Marquee>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default NewsHeadlinesSection;
