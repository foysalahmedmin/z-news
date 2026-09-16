import { cn } from "@/lib/utils";
import { TCategory } from "@/types/category.type";
import React from "react";
import Categories from "./Categories";
import NavigationLogo from "./Logo";
import Search from "./Search";

type NavigationProps = {
  className?: string;
  categories?: TCategory[];
};

const Navigation: React.FC<NavigationProps> = async ({
  className,
  categories,
}) => {
  return (
    <nav
      className={cn(
        "bg-card text-card-foreground sticky top-0 z-50 hidden shadow md:block",
        className,
      )}
    >
      <div className="container h-16">
        <div className="relative flex h-full items-center gap-4">
          <div className="w-16">
            <NavigationLogo />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-19/20">
              <Categories data={categories} />
            </div>
          </div>
          <div className="flex w-16 items-center justify-end gap-4">
            <Search />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
