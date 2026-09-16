"use client";

import { cn } from "@/lib/utils";
import { TNews } from "@/types/news.type";
import { Bookmark } from "lucide-react";
import React, { useState } from "react";

type ReactionProps = {
  news: Partial<TNews>;
};

const Save: React.FC<ReactionProps> = ({ news }) => {
  const [isLoading, setIsLoading] = useState(false);
  const is_saved = false;
  return (
    <div className="bg-muted flex h-10 items-center rounded-md p-1">
      <button
        disabled={isLoading}
        className="flex h-full cursor-pointer items-center gap-1 px-2"
      >
        <Bookmark
          className={cn("size-5", {
            "fill-current": is_saved,
          })}
        />
      </button>
    </div>
  );
};

export default Save;
