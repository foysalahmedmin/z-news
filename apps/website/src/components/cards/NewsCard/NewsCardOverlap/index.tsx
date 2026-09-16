import { cn } from "@/lib/utils";
import { TNews } from "@/types/news.type";
import { parseYouTubeUrl } from "@/utils/youtubeUrlUtils";
import { Dot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type TNewsCardOverlapProps = {
  news?: Partial<TNews>;
  className?: string;
  classNameContent?: string;
  classNameThumbnail?: string;
};

const NewsCardOverlap: React.FC<TNewsCardOverlapProps> = ({
  news,
  className,
  classNameContent,
  classNameThumbnail,
}) => {
  const { slug, title, sub_title, published_at, category } = news || {};
  const { thumbnails } = news?.youtube
    ? parseYouTubeUrl(news?.youtube || "")
    : {};

  const thumbnail = news?.thumbnail?.url || thumbnails?.default || "/thumbnail.png";
  const date =
    published_at &&
    new Date(published_at).toLocaleString("bn-BD", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  return (
    <Link
      href={`/news/${slug}`}
      className={cn("group relative", className)}
      title={title}
    >
      <div className={cn("overflow-hidden", classNameThumbnail)}>
        <Image
          className="aspect-video w-full object-cover object-center transition-all duration-300 group-hover:scale-105"
          src={thumbnail}
          alt={title || "Thumbnail"}
          width={500}
          height={280}
          // onError={(e) => {
          //   e.currentTarget.src = "/thumbnail.png";
          // }}
        />
      </div>
      <div
        className={cn(
          "from-card via-card absolute right-0 bottom-0 left-0 bg-gradient-to-t to-transparent p-4",
          classNameContent,
        )}
      >
        <div className="border-s-2 ps-2">
          <h3 className="mb-[0.25em] line-clamp-2 text-[1.125em] leading-[1.5] font-semibold group-hover:text-blue-900">
            {sub_title && (
              <>
                <span className="text-red-700">{sub_title}</span>{" "}
                <Dot className="text-muted-foreground inline-block size-[1em]" />
              </>
            )}
            <span>{title}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-1">
            <p className="text-muted-foreground text-xs">{date}</p>
            <p className="text-muted-foreground border-muted-foreground border-s ps-1 text-xs">
              {category?.name}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NewsCardOverlap;
