"use client";

import { cn } from "@/lib/utils";
import { TNews } from "@/types/news.type";
import { Printer } from "lucide-react";
import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import NewsDetailsPrintSection from "../../NewsDetailsPrintSection";

type PrintProps = {
  news: Partial<TNews>;
  className?: string;
};

const Print: React.FC<PrintProps> = ({ news, className }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div
      className={cn(
        "bg-muted flex h-10 items-center rounded-md p-1",
        className,
      )}
    >
      <button
        onClick={reactToPrintFn}
        disabled={isLoading}
        className="flex h-full cursor-pointer items-center gap-1 px-2"
      >
        <Printer className={cn("size-5")} />
      </button>
      {/* Hidden NewsContent for printing */}
      <div className="hidden">
        <div ref={contentRef}>
          <NewsDetailsPrintSection news={news} />
        </div>
      </div>
    </div>
  );
};

export default Print;
