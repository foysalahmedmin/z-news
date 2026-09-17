"use client";

import type { TBreadcrumbs } from "@/components/ui/Breadcrumb";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import useAdminMenu from "../hooks/useAdminMenu";

// Ported from apps/adminpanel's src/components/sections/PageHeader/index.tsx.
// The original derived the active breadcrumb trail from Redux
// (`useMenu().activeBreadcrumbs`, populated by a react-router location
// listener). Next.js's App Router has no such listener, so this reads the
// current path from `usePathname()` and looks it up directly in
// `useAdminMenu()`'s `breadcrumbsMap` (see builder/RouteMenu.ts) — the
// same source of truth the admin Sidebar already uses for its menu tree.
// Used across every /admin/* page, so it lives with the other shared admin
// partials rather than being colocated with a single page.
type PageHeaderProps = {
  className?: string;
  name?: string;
  description?: string;
  breadcrumbs?: TBreadcrumbs;
  slot?: ReactNode;
};

const PageHeader = ({
  className,
  name: nameProp,
  description: descriptionProp,
  breadcrumbs,
  slot,
}: PageHeaderProps) => {
  const pathname = usePathname();
  const { breadcrumbsMap } = useAdminMenu();

  const items: TBreadcrumbs = breadcrumbs || breadcrumbsMap[pathname] || [];
  const name = nameProp || items[items.length - 1]?.name || "";
  const description =
    descriptionProp || items[items.length - 1]?.description || "";

  return (
    <header className={cn("flex flex-col gap-2", className)}>
      {/* Breadcrumbs */}
      {items?.length > 0 && <Breadcrumb items={items} />}

      {/* Name Description & Slot */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold capitalize">
            {name}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          )}
        </div>

        {/* Right Slot */}
        {slot && <div className="flex items-center space-x-2">{slot}</div>}
      </div>
    </header>
  );
};

export default PageHeader;
