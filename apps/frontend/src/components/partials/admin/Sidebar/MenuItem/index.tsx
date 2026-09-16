"use client";

import useSetting from "@/components/partials/admin/hooks/useSetting";
import { Badge } from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { TProcessedMenu } from "@/types/route-menu.type";
import { ChevronRight, Dot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { isPathActive } from "../utils";
import SubMenuItem from "./SubMenuItem";

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

const MenuItem: React.FC<Props> = ({ item }) => {
  const { setting } = useSetting();
  const isCompact = setting.sidebar === "compact";

  const pathname = usePathname();
  const { menuType, name: label, path, badges, children } = item || {};

  const hasChildren = !!children && children.length > 0;

  // Active/open state used to be driven by Redux (`activeIndexes` /
  // `openIndexes` computed by MenuApplier from the current route). Since
  // there's no menu-index machinery anymore, active state is derived
  // directly from the URL, and the expand/collapse state is local to this
  // item (auto-expanded whenever one of its children is active).
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
            "text-muted-foreground flex items-center px-2 py-2 font-semibold uppercase lg:px-3",
          )}
        >
          {isCompact ? (
            <>
              <span
                className={cn(
                  "hidden px-0.5 lg:block lg:w-full lg:group-hover/sidebar:hidden",
                )}
              >
                <Dot className="size-5" />
              </span>
              <span
                className={cn("text-sm lg:hidden lg:group-hover/sidebar:block")}
              >
                {label}
              </span>
            </>
          ) : (
            <span className={cn("text-sm")}>{label}</span>
          )}
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
        className={cn(
          "relative flex items-center gap-2 px-2 py-2 lg:gap-3 lg:px-3",
          {
            "bg-accent/5": isActive || isOpen,
          },
        )}
      >
        <div
          className={cn(
            "bg-accent absolute start-0 top-0 bottom-0 w-1 rounded-e-full opacity-0 duration-300",
            {
              "opacity-100": isActive,
            },
          )}
        />
        {/* Icon */}
        <div className="flex flex-shrink-0 items-center justify-center">
          <div className="flex size-6 items-center justify-center">
            {item.icon && (
              <Icon name={item.icon} strokeWidth={1.5} className="size-6" />
            )}
          </div>
        </div>

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
            "grid-rows-[0fr]",
            isCompact && {
              "lg:grid-rows-[0fr] lg:group-hover/sidebar:grid-rows-[1fr]":
                isOpen,
              "lg:grid-rows-[0fr]": !isOpen,
            },
            !isCompact && {
              "grid-rows-[1fr]": isOpen,
            },
          )}
        >
          <div
            className={cn(
              "my-2 min-h-0 space-y-2 overflow-hidden border-s",
              "origin-top transition-all duration-300 ease-in-out",
              "invisible scale-y-0 opacity-0",
              isCompact && {
                "lg:group-hover/sidebar:visible lg:group-hover/sidebar:min-h-fit lg:group-hover/sidebar:scale-y-100 lg:group-hover/sidebar:opacity-100 lg:group-hover/sidebar:delay-100":
                  isOpen,
                "lg:invisible lg:scale-y-0 lg:opacity-0": !isOpen,
              },
              !isCompact && {
                "visible min-h-fit scale-y-100 opacity-100 delay-100": isOpen,
              },
            )}
          >
            {children.map((child, i) => (
              <SubMenuItem key={`submenu-${i}`} item={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItem;
