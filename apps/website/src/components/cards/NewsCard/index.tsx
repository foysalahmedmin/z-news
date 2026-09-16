import { TNews } from "@/types/news.type";
import React from "react";
import NewsCardGird from "./NewsCardGrid";
import NewsCardList from "./NewsCardList";
import NewsCardOverlap from "./NewsCardOverlap";
export type TNewsCardProps = {
  type: "grid" | "list" | "overlap";
  news?: Partial<TNews>;
  className?: string;
  classNameContent?: string;
  classNameThumbnail?: string;
  classNameThumbnailImage?: string;
  classNameTitle?: string;
  classNameDescription?: string;
};

const NewsCard: React.FC<TNewsCardProps> = ({ type, ...props }) => {
  return (
    <>
      {type === "grid" && <NewsCardGird {...props} />}
      {type === "list" && <NewsCardList {...props} />}
      {type === "overlap" && <NewsCardOverlap {...props} />}
    </>
  );
};

export default NewsCard;
