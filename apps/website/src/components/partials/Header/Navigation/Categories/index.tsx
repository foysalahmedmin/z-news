"use client";

import { ActiveLink } from "@/components/ui/ActiveLink";
import { TCategory } from "@/types/category.type";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useMeasure from "react-use-measure";

const CategoryItem = ({
  category,
}: {
  category: TCategory;
  disabled?: boolean;
}) => {
  return (
    <div className="px-2">
      <ActiveLink
        className="underline-effect foreground hover:underline-effect-active text-base font-semibold whitespace-nowrap uppercase transition-colors duration-200"
        activeClassName="underline-effect-active"
        href={`/category/${category.slug}`}
      >
        {category.name}
      </ActiveLink>
    </div>
  );
};

const CategoryDropdownItem = ({ category }: { category: TCategory }) => {
  return (
    <div className="px-2">
      <ActiveLink
        className="underline-effect foreground hover:underline-effect-active text-base font-semibold whitespace-nowrap uppercase transition-colors duration-200"
        activeClassName="underline-effect-active"
        href={`/category/${category.slug}`}
      >
        {category.name}
      </ActiveLink>
    </div>
  );
};

const Categories = ({ data }: { data?: TCategory[] }) => {
  const [ref, bounds] = useMeasure();
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(data?.length || 0);
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Measure all items first
  useEffect(() => {
    if (!data || !measureRef.current) return;

    const items = measureRef.current.children;
    const widths: number[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i] as HTMLElement;
      widths.push(item.offsetWidth);
    }

    setItemWidths(widths);
  }, [data]);

  // Calculate visible items based on actual widths
  useEffect(() => {
    if (!bounds.width || itemWidths.length === 0) return;

    const moreButtonWidth = 96;
    const availableWidth = bounds.width - moreButtonWidth;

    let totalWidth = 0;
    let maxVisible = 0;

    for (let i = 0; i < itemWidths.length; i++) {
      if (totalWidth + itemWidths[i] <= availableWidth) {
        totalWidth += itemWidths[i];
        maxVisible++;
      } else {
        break;
      }
    }

    // If all items fit, don't need more button
    if (maxVisible === itemWidths.length) {
      let finalTotalWidth = 0;
      let finalMaxVisible = 0;

      for (let i = 0; i < itemWidths.length; i++) {
        if (finalTotalWidth + itemWidths[i] <= bounds.width) {
          finalTotalWidth += itemWidths[i];
          finalMaxVisible++;
        } else {
          break;
        }
      }
      setVisibleCount(finalMaxVisible);
    } else {
      setVisibleCount(maxVisible);
    }
  }, [bounds.width, itemWidths]);

  if (!data || data.length === 0) {
    return null;
  }

  const visibleItems = data.slice(0, visibleCount);
  const hiddenItems = data.slice(visibleCount);

  return (
    <>
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        className="pointer-events-none invisible fixed -top-full flex items-center opacity-0"
        aria-hidden="true"
      >
        {data.map((category) => (
          <div key={category._id}>
            <CategoryItem category={category} disabled />
          </div>
        ))}
      </div>

      {/* Visible container */}
      <div ref={ref} className="flex w-full items-center justify-center">
        {visibleItems.map((category) => (
          <div key={category._id}>
            <CategoryItem category={category} disabled />
          </div>
        ))}

        {hiddenItems.length > 0 && (
          <div className="group relative">
            <div className="w-24 px-2">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="underline-effect foreground hover:underline-effect-active flex w-full items-center justify-center gap-1 font-semibold whitespace-nowrap uppercase transition-colors duration-200"
              >
                <MoreHorizontal size={16} />
                আরও
              </button>
            </div>
            <div className="absolute end-0 top-full z-10 hidden min-w-40 px-2 pt-1 group-hover:block">
              <div className="bg-card space-y-1 rounded border py-2 text-end opacity-0 group-hover:opacity-100">
                {hiddenItems.map((category) => (
                  <div key={category._id}>
                    <CategoryDropdownItem category={category} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Categories;
