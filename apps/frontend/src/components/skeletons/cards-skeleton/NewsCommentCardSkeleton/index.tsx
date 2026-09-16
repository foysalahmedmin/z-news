const NewsCommentCardSkeleton: React.FC = () => {
  return (
    <div className="bg-muted mb-6 animate-pulse rounded-md border p-4">
      <div className="flex items-start gap-3">
        {/* Avatar Skeleton */}
        <div className="flex-shrink-0">
          <div className="bg-muted h-8 w-8 rounded-full" />
        </div>

        <div className="flex-1 space-y-2">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-muted h-4 w-24 rounded" />
              <div className="bg-muted h-3 w-20 rounded" />
            </div>
            <div className="bg-muted h-3 w-12 rounded" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-2">
            <div className="bg-muted h-4 w-full rounded" />
            <div className="bg-muted h-4 w-5/6 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCommentCardSkeleton;
