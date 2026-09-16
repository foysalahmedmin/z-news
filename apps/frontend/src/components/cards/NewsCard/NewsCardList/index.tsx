import { cn } from "@/lib/utils";
import { TNews } from "@/types/news.type";
import { getDescription } from "@/utils/parseContentToDescription";
import { parseYouTubeUrl } from "@/utils/youtubeUrlUtils";
import { CheckCircle, Dot, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type TNewsCardListProps = {
  news?: Partial<TNews>;
  className?: string;
  classNameThumbnail?: string;
  classNameThumbnailImage?: string;
  classNameContent?: string;
  classNameTitle?: string;
  classNameDescription?: string;
};

const NewsCardList: React.FC<TNewsCardListProps> = ({
  news,
  className,
  classNameThumbnail,
  classNameThumbnailImage,
  classNameContent,
  classNameTitle,
  classNameDescription,
}) => {
  const { published_at, slug, title, sub_title, description, category } =
    news || {};
  const { thumbnails } = news?.youtube
    ? parseYouTubeUrl(news?.youtube || "")
    : {};

  const thumbnail =
    news?.thumbnail?.url || thumbnails?.default || "/thumbnail.png";

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
      className={cn(
        "group relative flex flex-col gap-4 md:flex-row",
        className,
      )}
      title={title}
    >
      <div
        className={cn(
          "relative self-stretch overflow-hidden md:w-1/2",
          classNameThumbnail,
        )}
      >
        <div className={cn("aspect-video w-full", classNameThumbnailImage)}>
          <Image
            className="size-full object-cover object-center transition-all duration-300 group-hover:scale-105"
            src={thumbnail}
            alt={title || "Thumbnail"}
            width={500}
            height={280}
            // onError={(e) => {
            //   e.currentTarget.src = "/thumbnail.png";
            // }}
          />
          {(news?.youtube || news?.video?.url) && (
            <div className="absolute inset-0 z-10 m-auto flex aspect-square h-1/3 items-center justify-center rounded-full border bg-black/25 text-white backdrop-blur-xs md:h-2/5">
              <Play className="size-1/2" strokeWidth={2} />
            </div>
          )}
          {news?.fact_checked && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-green-600 px-1.5 py-0.5 text-[10px] text-white">
              <CheckCircle size={10} strokeWidth={3} />
              <span>FactChecked</span>
            </div>
          )}
        </div>
      </div>
      <div
        className={cn("flex flex-1 flex-col self-stretch", classNameContent)}
      >
        <div className="mb-[0.5em] border-s-2 ps-2">
          <h3
            className={cn(
              "mb-[0.25em] text-[1.125em] leading-[1.25] font-semibold group-hover:text-blue-900 md:line-clamp-3",
              classNameTitle,
            )}
          >
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
        <p
          className={cn(
            "text-muted-foreground line-clamp-3 text-[0.875em] leading-[1.25]",
            classNameDescription,
          )}
        >
          {description || getDescription(news?.content || "")}
        </p>
      </div>
    </Link>
  );
};

export default NewsCardList;
