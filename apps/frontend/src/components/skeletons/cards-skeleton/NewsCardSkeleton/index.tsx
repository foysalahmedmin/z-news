import { TNews } from "@/types/news.type";
import React from "react";
import NewsCardGirdSkeleton from "./NewsCardGridSkeleton";
import NewsCardListSkeleton from "./NewsCardListSkeleton";
import NewsCardOverlapSkeleton from "./NewsCardOverlapSkeleton";
export type TNewsCardSkeletonProps = {
  type: "grid" | "list" | "overlap";
  news?: Partial<TNews>;
  className?: string;
  classNameContent?: string;
  classNameThumbnail?: string;
};

const NewsCardSkeleton: React.FC<TNewsCardSkeletonProps> = ({
  type,
  ...props
}) => {
  return (
    <>
      {type === "grid" && <NewsCardGirdSkeleton {...props} />}
      {type === "list" && <NewsCardListSkeleton {...props} />}
      {type === "overlap" && <NewsCardOverlapSkeleton {...props} />}
    </>
  );
};

export default NewsCardSkeleton;
