import { cn } from "@/lib/utils";

export type TNewsCardOverlapSkeletonProps = {
  className?: string;
  classNameContent?: string;
  classNameThumbnail?: string;
};

const NewsCardOverlapSkeleton: React.FC<TNewsCardOverlapSkeletonProps> = ({
  className,
  classNameContent,
  classNameThumbnail,
}) => {
  return (
    <div className={cn("group relative animate-pulse", className)}>
      {/* Thumbnail skeleton */}
      <div
        className={cn(
          "bg-muted aspect-video w-full overflow-hidden",
          classNameThumbnail,
        )}
      />

      {/* Overlap content skeleton */}
      <div
        className={cn(
          "from-card via-card absolute right-0 bottom-0 left-0 bg-gradient-to-t to-transparent p-4",
          classNameContent,
        )}
      >
        <div className="border-s-2 ps-2">
          <div className="bg-muted mb-[0.25em] h-5 w-3/4 rounded" />
          <div className="flex flex-wrap items-center gap-1">
            <div className="bg-muted h-3 w-20 rounded" />
            <div className="bg-muted h-3 w-16 rounded border-s ps-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCardOverlapSkeleton;
