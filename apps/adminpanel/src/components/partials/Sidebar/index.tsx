import { ENV } from "@/config";
import useMenu from "@/hooks/states/useMenu";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React, { memo } from "react";
import MenuItem from "./MenuItem";

interface SidebarProps {
  className?: string;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = memo(({ className, onClose }) => {
  const { menus } = useMenu();

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
              src="/logo.png"
              alt="Z-News Logo"
              loading="lazy"
            />
          </div>
          <a
            href={ENV?.app_url || "/"}
            target="_blank"
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
        {/* Add your navigation items here */}
        <div className="space-y-2">
          {menus.map((menu, i) => (
            <MenuItem key={i} index={i} item={menu} />
          ))}
        </div>
      </nav>
    </div>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
