import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { Fragment, useCallback, useMemo } from "react";
import { Button } from "./Button";
import { FormControl } from "./FormControl";

type PaginationProps = {
  className?: string;
  total: number;
  limit: number;
  page: number;
  setLimit: (limit: number) => void;
  setPage: (page: number) => void;
  options?: number[];
  showInfo?: boolean;
};

const Pagination: React.FC<PaginationProps> = ({
  className,
  total,
  limit,
  page,
  setLimit,
  setPage,
  options: limitOptions = [5, 10, 20, 50],
  showInfo = true,
}) => {
  const totalPages = Math.ceil(total / limit);
  const startItem = Math.min((page - 1) * limit + 1, total);
  const endItem = Math.min(page * limit, total);

  const pages = useMemo(() => {
    if (totalPages <= 1) return [];

    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    // Always include first page
    if (totalPages >= 1) {
      rangeWithDots.push(1);
    }

    // Calculate middle range
    const start = Math.max(2, page - delta);
    const end = Math.min(totalPages - 1, page + delta);

    // Add dots before middle range if needed
    if (start > 2) {
      rangeWithDots.push("...");
    }

    // Add middle range
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        range.push(i);
      }
    }
    rangeWithDots.push(...range);

    // Add dots after middle range if needed
    if (end < totalPages - 1) {
      rangeWithDots.push("...");
    }

    // Always include last page if it's different from first
    if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [page, totalPages]);

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      // Calculate what the new page should be to keep the user roughly in the same position
      const currentFirstItem = (page - 1) * limit + 1;
      const newPage = Math.max(1, Math.ceil(currentFirstItem / newLimit));

      setLimit(newLimit);
      setPage(newPage);
    },
    [page, limit, setLimit, setPage],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages, setPage],
  );

  // Don't render if there's no data or only one page
  if (total === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 px-4 py-3 sm:flex-row sm:gap-0",
        className,
      )}
    >
      {/* Results Info */}
      {showInfo && (
        <div className="text-muted-foreground text-sm">
          {total > 0 ? (
            <>
              Showing <span className="font-medium">{startItem}</span> to{" "}
              <span className="font-medium">{endItem}</span> of{" "}
              <span className="font-medium">{total}</span> results
            </>
          ) : (
            "No results found"
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        {/* Limit Selector */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="limit"
            className="text-muted-foreground text-sm font-medium"
          >
            Rows per page:
          </label>
          <FormControl
            as="select"
            className="h-8 w-16 px-0 text-center"
            id="limit"
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </FormControl>
        </div>

        {/* Pagination Buttons */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            {/* Previous Button */}
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
              variant="ghost"
              shape={"icon"}
              size={"sm"}
            >
              <ChevronLeft className="size-6" />
            </Button>

            {/* Page Numbers */}
            {pages.map((p, index) => (
              <Fragment key={`page-${index}`}>
                {p === "..." ? (
                  <span className="text-muted-foreground inline-flex size-8 items-center justify-center pb-1.5 text-sm font-medium">
                    ...
                  </span>
                ) : (
                  <Button
                    onClick={() => handlePageChange(p as number)}
                    aria-label={`Go to page ${p}`}
                    aria-current={p === page ? "page" : undefined}
                    shape={"icon"}
                    variant={p === page ? "default" : "outline"}
                    size={"sm"}
                  >
                    {p}
                  </Button>
                )}
              </Fragment>
            ))}

            {/* Next Button */}
            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
              variant="ghost"
              shape={"icon"}
              size={"sm"}
            >
              <ChevronRight className="size-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export { Pagination };
