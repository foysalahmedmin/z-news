"use client";

import { cn } from "@/lib/utils";
import { TNews } from "@/types/news.type";
import { Printer } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import NewsDetailsPrintSection from "../../NewsDetailsPrintSection";

type PrintProps = {
  news: Partial<TNews>;
  className?: string;
};

// The printable copy of the article is only mounted while printing, so the
// page doesn't carry a hidden duplicate of the article (and its <h1>).
const Print: React.FC<PrintProps> = ({ news, className }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    onAfterPrint: () => setIsPrinting(false),
    onPrintError: () => setIsPrinting(false),
  });

  useEffect(() => {
    if (isPrinting) reactToPrintFn();
  }, [isPrinting, reactToPrintFn]);

  return (
    <div
      className={cn(
        "bg-muted flex h-10 items-center rounded-md p-1",
        className,
      )}
    >
      <button
        onClick={() => setIsPrinting(true)}
        disabled={isPrinting}
        aria-label="প্রিন্ট করুন"
        className="flex h-full cursor-pointer items-center gap-1 px-2"
      >
        <Printer className={cn("size-5")} />
      </button>
      {isPrinting && (
        <div className="hidden">
          <div ref={contentRef}>
            <NewsDetailsPrintSection news={news} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Print;
