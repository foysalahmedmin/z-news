"use client";

import { cn } from "@/lib/utils";
import { fetchNewsView } from "@/services/view.service";
import { TNews } from "@/types/news.type";
import { formatCount } from "@/utils/formatCount";
import { Eye } from "lucide-react";
import React, { useEffect, useState } from "react";

type ViewProps = {
  news: Partial<TNews>;
  className?: string;
};

const View: React.FC<ViewProps> = ({ news, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (!news?._id) return;
    const getView = async () => {
      try {
        if (!news?._id) return;
        setIsLoading(true);

        const { meta } = await fetchNewsView(news?._id);
        const { views = 0 } = meta || {};
        setViewCount((views as number) || 0);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getView();
  }, [news]);

  return (
    <div
      className={cn(
        "divide-muted-foreground/25 bg-muted flex h-10 items-center divide-x rounded-md p-1",
        className,
      )}
    >
      <div className="flex items-center gap-1 px-2">
        <Eye className={cn("size-5")} />
        <span className="mb-0.5 text-lg leading-1">
          {formatCount(viewCount || 0)}
        </span>
      </div>
    </div>
  );
};

export default View;
