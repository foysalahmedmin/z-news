import { fetchBulkNewsBreaks } from "@/services/news-break.service";
import Link from "next/link";
import Marquee from "react-fast-marquee";

const NewsBreaksSection = async () => {
  const { data } = await fetchBulkNewsBreaks({
    page: 1,
    limit: 5,
    sort: "-published_at",
  });

  if (!data || data.length === 0) return null;

  return (
    <section className="bg-red-600 text-white top-0 shadow md:sticky md:z-40">
      <div className="relative container">
        <div className="relative flex flex-col items-center lg:flex-row">
          <div className="bg-red-700 flex h-12 w-full items-center justify-center gap-2 px-4 lg:w-auto">
            <span className="relative flex size-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex size-4 rounded-full bg-white"></span>
            </span>
            <h3 className="font-bold whitespace-nowrap">ব্রেকিং নিউজ</h3>
          </div>

          {/* Marquee container should take full available width */}
          <div className="relative flex h-12 w-full items-center overflow-hidden lg:w-auto lg:flex-1">
            <div className="via-red-600 from-red-600 absolute -end-1 top-0 bottom-0 z-20 w-10 bg-gradient-to-l to-transparent" />
            <div className="via-red-600 from-red-600 absolute -start-1 top-0 bottom-0 z-20 w-10 bg-gradient-to-r to-transparent" />
            <Marquee speed={50} pauseOnHover gradient={false}>
              <ul className="flex whitespace-nowrap">
                {data?.map((newsBreak) => (
                  <li
                    className="border-red-500 border-r px-4"
                    key={newsBreak._id}
                  >
                    {newsBreak?.news?.slug ? (
                      <Link
                        href={`/news/${newsBreak?.news?.slug}`}
                        className="underline-effect hover:underline-effect-active whitespace-nowrap uppercase transition-colors duration-200 hover:text-red-100"
                      >
                        {newsBreak?.news?.title}
                      </Link>
                    ) : (
                      <span className="underline-effect hover:underline-effect-active whitespace-nowrap uppercase transition-colors duration-200">
                        {newsBreak?.news?.title}
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
  );
};

export default NewsBreaksSection;

