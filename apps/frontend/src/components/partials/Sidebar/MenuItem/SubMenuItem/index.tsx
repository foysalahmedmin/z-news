"use client";

import { cn } from "@/lib/utils";
import { TCategory } from "@/types/category.type";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  className?: string;
  item: TCategory;
  indexes: number[];
  depth: number;
  activeIndexes?: number[];
  openIndexes: number[];
  setOpenIndexes: (indexes: number[]) => void;
};

const Comp: React.FC<{
  children: React.ReactNode;
  className?: string;
  path?: string;
  onClick?: () => void;
}> = ({ children, className, path, onClick, ...props }) => {
  return (
    <>
      {path ? (
        <Link
          href={path}
          className={cn("", className)}
          onClick={onClick}
          {...props}
        >
          {children}
        </Link>
      ) : (
        <div className={cn("", className)} {...props}>
          {children}
        </div>
      )}
    </>
  );
};

const SubMenuItem: React.FC<Props> = ({
  indexes = [],
  item,
  activeIndexes = [],
  openIndexes = [],
  setOpenIndexes,
}) => {
  const { name: label, slug, children } = item;

  // Check if current item is active
  const isActive =
    activeIndexes?.length > 0 &&
    activeIndexes.slice(0, indexes.length).join("") === indexes.join("");
  const isOpen =
    openIndexes?.length > 0 &&
    openIndexes.slice(0, indexes.length).join("") === indexes.join("");

  const hasChildren = children && children.length > 0;

  const handleToggle = () => {
    if (isOpen) {
      setOpenIndexes(indexes.slice(0, -1));
    } else {
      setOpenIndexes(indexes);
    }
  };

  const handler = () => {
    if (hasChildren) {
      handleToggle();
    } else {
      if (!isOpen) setOpenIndexes(indexes);
    }
  };

  return (
    <div>
      {/* Menu Item */}
      <Comp
        path={`/category/${slug}`}
        onClick={handler}
        className={cn("relative flex items-center px-2 lg:px-3", {
          "text-accent": isActive || isOpen,
        })}
      >
        <div
          className={cn(
            "bg-accent absolute start-0 top-0 bottom-0 w-[1px] rounded-md opacity-0 duration-300",
            {
              "opacity-100": isActive,
            },
          )}
        />
        {/* Label */}
        <div
          className={cn(
            "relative flex flex-1 items-center justify-between gap-2 text-sm tracking-wide",
            "overflow-hidden whitespace-nowrap opacity-100 transition-opacity duration-500",
          )}
        >
          {/* Content */}
          <div className="flex flex-1 cursor-pointer items-center gap-2">
            <span className="flex-1">{label}</span>
          </div>

          {/* Chevron */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevent link navigation
                e.stopPropagation(); // Prevent bubbling to the Link
                handleToggle();
              }}
              className="absolute top-0 right-0 bottom-0 flex items-center"
              aria-label={isOpen ? "Collapse" : "Expand"}
            >
              <ChevronRight
                className={cn("size-3 transition-transform duration-300", {
                  "rotate-90": isOpen,
                })}
              />
            </button>
          )}
        </div>
      </Comp>

      {/* Children */}
      {hasChildren && (
        <div
          className={cn(
            "relative grid grid-rows-[0fr] overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out",
            {
              "grid-rows-[1fr]": isOpen,
            },
          )}
        >
          <div
            className={cn(
              "invisible my-2 min-h-0 origin-top scale-y-0 space-y-2 overflow-hidden border-l pl-2 opacity-0 transition-transform duration-300 ease-in-out lg:pl-3",
              {
                "visible min-h-fit origin-top scale-y-100 opacity-100 delay-100":
                  isOpen,
              },
            )}
          >
            {children.map((child, index) => (
              <SubMenuItem
                key={`${index}`}
                item={child}
                indexes={[...indexes, index]}
                depth={1}
                activeIndexes={activeIndexes}
                openIndexes={openIndexes}
                setOpenIndexes={setOpenIndexes}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubMenuItem;
