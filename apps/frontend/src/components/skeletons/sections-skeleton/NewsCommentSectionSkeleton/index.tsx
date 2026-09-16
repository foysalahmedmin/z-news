import NewsCommentCardSkeleton from "../../cards-skeleton/NewsCommentCardSkeleton";

const NewsCommentSectionSkeleton: React.FC = () => {
  const skeletonCommentsCount = 3;

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="bg-card animate-pulse rounded-md border p-6 shadow">
        {/* Header Skeleton */}
        <div className="mb-4 flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-muted h-5 w-5 rounded" />
            <div className="bg-muted h-6 w-40 rounded" />
          </div>
          <div className="bg-muted h-5 w-5 rounded" />
        </div>

        {/* Comment Form Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="bg-muted h-10 rounded" />
          <div className="bg-muted h-10 rounded" />
          <div className="bg-muted h-24 rounded" />
          <div className="bg-muted ml-auto h-10 w-40 rounded" />
        </div>

        {/* Comments List Skeleton */}
        {[...Array(skeletonCommentsCount)].map((_, i) => (
          <NewsCommentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default NewsCommentSectionSkeleton;
