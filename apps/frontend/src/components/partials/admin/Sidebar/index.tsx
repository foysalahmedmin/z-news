"use client";

import { ENV } from "@/config";
import { cn } from "@/lib/utils";
import type { TProcessedMenu } from "@/types/route-menu.type";
import { X } from "lucide-react";
import React, { memo } from "react";
import MenuItem from "./MenuItem";

interface SidebarProps {
  className?: string;
  onClose: () => void;
}

// TODO(nav-phase): This static list stands in for apps/adminpanel's
// role-filtered, Redux-driven menu (`useMenu()` / `state.menu`, populated by
// `MenuApplier` from the route config). It exists purely so the sidebar
// shell has something to render. A later migration phase will replace this
// with the real menu config, filtered by the signed-in user's role.
const ADMIN_MENU_ITEMS: TProcessedMenu[] = [
  { name: "Overview", menuType: "title" },
  { name: "Dashboard", path: "/admin", icon: "layout-dashboard" },

  { name: "Content", menuType: "title" },
  {
    name: "News Articles",
    icon: "newspaper",
    children: [
      { name: "All Articles", path: "/admin/news" },
      { name: "Content Templates", path: "/admin/content-templates" },
    ],
  },
  { name: "Categories", path: "/admin/categories", icon: "folder-tree" },
  { name: "Events", path: "/admin/events", icon: "calendar-days" },
  { name: "Files", path: "/admin/files", icon: "files" },

  { name: "Engagement", menuType: "title" },
  { name: "Comments", path: "/admin/comments", icon: "message-square" },
  { name: "Reactions", path: "/admin/reactions", icon: "heart" },
  { name: "Notifications", path: "/admin/notifications", icon: "bell" },

  { name: "Administration", menuType: "title" },
  { name: "Users", path: "/admin/users", icon: "users" },
  { name: "Bin", path: "/admin/bin", icon: "trash-2" },
];

const Sidebar: React.FC<SidebarProps> = memo(({ className, onClose }) => {
  const menus = ADMIN_MENU_ITEMS;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header */}
      <header
        className={cn(
          "bg-card/50 flex h-16 items-center justify-between border-b px-4 backdrop-blur-sm lg:h-20",
        )}
      >
        {/* Logo Section */}
        <div
          className={cn(
            "logo flex h-full min-w-0 items-center gap-4 px-2 lg:px-1",
          )}
        >
          <div
            className={cn(
              "logo-icon bg-muted size-8 flex-shrink-0 overflow-hidden rounded-md lg:size-10",
            )}
          >
            <img
              className="size-full rounded-md object-contain"
              src="/icon.png"
              alt="Z-News Logo"
              loading="lazy"
            />
          </div>
          <a
            href={ENV?.app_url || "/"}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "text-foreground logo-text inline-block font-bold tracking-wide",
              "overflow-hidden whitespace-nowrap opacity-100 transition-opacity duration-500",
            )}
          >
            Z NEWS
          </a>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            "hover:bg-muted/80 transition-all duration-200 active:scale-95",
            "text-muted-foreground hover:text-foreground",
            "lg:hidden",
          )}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </header>

      {/* Navigation Content */}
      <nav
        className={cn(
          "flex-1 overflow-x-hidden overflow-y-auto",
          "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted",
          "px-4 py-6",
        )}
      >
        <div className="space-y-2">
          {menus.map((menu, i) => (
            <MenuItem key={i} item={menu} />
          ))}
        </div>
      </nav>
    </div>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
