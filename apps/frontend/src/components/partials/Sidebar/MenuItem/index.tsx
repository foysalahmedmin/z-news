"use client";

import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { TCategory } from "@/types/category.type";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import SubMenuItem from "./SubMenuItem";

type Props = {
  className?: string;
  item: TCategory;
  index: number;
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
        <Link href={path} className={cn("", className)} {...props}>
          {children}
        </Link>
      ) : (
        <div className={cn("", className)} onClick={onClick} {...props}>
          {children}
        </div>
      )}
    </>
  );
};

const MenuItem: React.FC<Props> = ({
  index,
  activeIndexes,
  openIndexes,
  setOpenIndexes,
  item,
}) => {
  const { name: label, slug, children } = item || {};

  const isActive = index === activeIndexes?.[0];
  const isOpen = index === openIndexes?.[0];

  const hasChildren = children && children.length > 0;

  const handleToggle = () => {
    if (isOpen) {
      setOpenIndexes([]);
    } else {
      setOpenIndexes([index]);
    }
  };

  const handler = () => {
    if (hasChildren) {
      handleToggle();
    } else {
      if (!isOpen) setOpenIndexes([index]);
    }
  };

  return (
    <div>
      {/* Menu Item */}
      <Comp
        path={`/category/${slug}`}
        onClick={handler}
        className={cn(
          "relative flex items-center gap-2 px-2 py-2 lg:gap-3 lg:px-3",
          {
            "bg-accent/5": isOpen,
          },
        )}
      >
        {/* Icon */}
        <div className="flex flex-shrink-0 items-center justify-center">
          <div className="flex size-6 items-center justify-center">
            {item.icon && (
              <Icon name={item.icon} strokeWidth={1.5} className="size-6" />
            )}
          </div>
        </div>
        <div
          className={cn(
            "bg-accent absolute start-0 top-0 bottom-0 w-1 rounded-e-full opacity-0 duration-300",
            {
              "opacity-100": isActive,
            },
          )}
        />

        {/* Content */}
        <div
          className={cn(
            "relative flex flex-1 items-center justify-between tracking-wide",
            "overflow-hidden whitespace-nowrap opacity-100 transition-opacity duration-500",
          )}
        >
          {/* Label */}
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
                className={cn("size-4 transition-transform duration-300", {
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
            "relative grid overflow-hidden pl-2 transition-[grid-template-rows] duration-300 ease-in-out lg:pl-3",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div
            className={cn(
              "min-h-0 space-y-2 overflow-hidden border-s",
              "origin-top transition-all duration-300 ease-in-out",
              isOpen
                ? "visible my-2 min-h-fit scale-y-100 opacity-100 delay-100"
                : "invisible scale-y-0 opacity-0",
            )}
          >
            {children.map((child, i) => (
              <SubMenuItem
                key={`submenu-${index}-${i}`}
                item={child}
                indexes={[index, i]}
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

export default MenuItem;
