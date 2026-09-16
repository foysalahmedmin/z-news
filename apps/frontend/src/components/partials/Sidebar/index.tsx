"use client";

import Icon from "@/components/ui/Icon";
import { SOCIALS } from "@/config";
import { cn } from "@/lib/utils";
import { TCategory } from "@/types/category.type";
import Link from "next/link";
import React, { memo, useState } from "react";
import Logo from "../Logo";
import MenuItem from "./MenuItem";

interface SidebarProps {
  categories?: TCategory[];
  className?: string;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = memo(
  ({ className, categories, onClose }) => {
    const [activeIndexes, setActiveIndexes] = useState<number[]>([]);
    const [openIndexes, setOpenIndexes] = useState<number[]>([]);

    return (
      <div className={cn("flex h-full flex-col", className)}>
        {/* Header */}
        <header
          className={cn(
            "bg-card/50 flex h-16 items-center justify-between border-b px-4 backdrop-blur-sm",
          )}
        >
          {/* Logo Section */}
          <div
            className={cn(
              "logo flex h-full min-w-0 items-center gap-4 lg:px-1",
            )}
          >
            <div className={cn("logo-icon shrink-0")}>
              <Logo className="text-sm" />
            </div>
            <div className="">
              <span>
                {new Date().toLocaleString("bn-BD", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Navigation Content */}
        <nav
          className={cn(
            "flex-1 overflow-x-hidden overflow-y-auto",
            "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted",
            "space-y-4 px-4 py-6",
          )}
        >
          <div>
            {categories?.map((menu, i) => (
              <MenuItem
                key={i}
                index={i}
                item={menu}
                activeIndexes={activeIndexes}
                openIndexes={openIndexes}
                setOpenIndexes={setOpenIndexes}
              />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <footer
          className={cn("h-16 overflow-x-hidden overflow-y-auto border-t px-4")}
        >
          <div className="flex h-full items-center justify-center gap-4">
            {SOCIALS.map((social, i) => (
              <Link
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: `${social.color}1A`, // 10% opacity default
                  color: social.color,
                }}
                className="flex items-center gap-2 rounded-md p-2 transition-colors"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = social.color;
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${social.color}1A`;
                  e.currentTarget.style.color = social.color;
                }}
              >
                <Icon name={social.icon} className="size-4" />
              </Link>
            ))}
          </div>
        </footer>
      </div>
    );
  },
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
