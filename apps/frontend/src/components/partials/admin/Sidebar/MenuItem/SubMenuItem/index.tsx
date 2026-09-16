"use client";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { TProcessedMenu } from "@/types/route-menu.type";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { isPathActive } from "../../utils";

type Props = {
  className?: string;
  item: TProcessedMenu;
};

const Comp: React.FC<{
  children: React.ReactNode;
  className?: string;
  path?: string;
  onClick?: () => void;
}> = ({ children, className, path, onClick }) => {
  return (
    <>
      {path ? (
        <Link href={path} className={cn("", className)} onClick={onClick}>
          {children}
        </Link>
      ) : (
        <div className={cn("", className)} onClick={onClick}>
          {children}
        </div>
      )}
    </>
  );
};

const SubMenuItem: React.FC<Props> = ({ item }) => {
  const pathname = usePathname();
  const { menuType, name: label, path, badges, children } = item;

  const hasChildren = !!children && children.length > 0;

  const isActive = isPathActive(pathname, path);
  const hasActiveChild = hasChildren
    ? children.some((child) => isPathActive(pathname, child.path))
    : false;

  const [isManuallyOpen, setIsManuallyOpen] = useState(false);
  const isOpen = isManuallyOpen || hasActiveChild;

  const handleToggle = () => setIsManuallyOpen((prev) => !prev);

  const handler = () => {
    if (hasChildren) {
      handleToggle();
    }
  };

  if (menuType === "title") {
    return (
      <>
        <div
          className={cn(
            "text-muted-foreground/75 flex items-center px-2 text-xs font-semibold uppercase lg:px-3",
          )}
        >
          <span className={cn("")}>{label}</span>
        </div>
      </>
    );
  }

  return (
    <div>
      {/* Menu Item */}
      <Comp
        path={path}
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
            <div className="flex gap-0.5">
              {badges?.map((badge) => <Badge key={badge}>{badge}</Badge>)}
            </div>
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
              <SubMenuItem key={index} item={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubMenuItem;
