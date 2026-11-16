"use client";

import { cn } from "@/lib/utils";
import { recordNewsView } from "@/services/view.service";
import { TNews } from "@/types/news.type";
import { formatCount } from "@/utils/formatCount";
import { Eye } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type ViewProps = {
  news: Partial<TNews>;
  className?: string;
};

// Records the page view (POST, once per article mount) and shows the count.
const View: React.FC<ViewProps> = ({ news, className }) => {
  const [viewCount, setViewCount] = useState(0);
  // Guards against StrictMode's dev double-effect posting a second view.
  const recordedFor = useRef<string | null>(null);

  useEffect(() => {
    const id = news?._id;
    if (!id || recordedFor.current === id) return;
    recordedFor.current = id;

    recordNewsView(id)
      .then(({ meta }) => setViewCount(Number(meta?.views) || 0))
      .catch((error) => console.error(error));
  }, [news?._id]);

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
