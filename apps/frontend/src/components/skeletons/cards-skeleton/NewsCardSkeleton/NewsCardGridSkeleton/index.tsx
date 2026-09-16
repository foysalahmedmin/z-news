import { cn } from "@/lib/utils";

export type TNewsCardGridSkeletonProps = {
  className?: string;
  classNameContent?: string;
  classNameThumbnail?: string;
};

const NewsCardGridSkeleton: React.FC<TNewsCardGridSkeletonProps> = ({
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

      {/* Content skeleton */}
      <div className={cn("py-4", classNameContent)}>
        <div className="border-s-2 ps-2">
          <div className="bg-muted mb-[0.25em] h-5 w-3/4 rounded" />
          <div className="flex flex-wrap items-center gap-1">
            <div className="bg-muted h-3 w-20 rounded" />
            <div className="bg-muted h-3 w-16 rounded border-s ps-1" />
          </div>
        </div>
        <div className="mt-2 space-y-1">
          <div className="bg-muted h-3 w-full rounded" />
          <div className="bg-muted h-3 w-5/6 rounded" />
          <div className="bg-muted h-3 w-2/3 rounded" />
        </div>
      </div>
    </div>
  );
};

export default NewsCardGridSkeleton;
