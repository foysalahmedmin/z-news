"use client";

import { ButtonMenu } from "@/components/buttons/ButtonMenu";
import Logo from "@/components/partials/Logo";
import Sidebar from "@/components/partials/Sidebar";
import { Drawer } from "@/components/ui/Drawer";
import { TCategory } from "@/types/category.type";
import { Search } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

type HeaderProps = {
  className?: string;
  categories?: TCategory[];
};

// Main Header Component
const TopHeader: React.FC<HeaderProps> = ({ className, categories }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className="bg-card text-card-foreground sticky top-0 z-50 overflow-hidden shadow md:static md:z-auto md:shadow-none">
        <div>
          <div className="container grid h-full w-full grid-cols-3 items-center justify-between">
            <div className="flex items-center justify-start gap-4">
              <ButtonMenu
                isOpen={isMenuOpen}
                onClick={() => setIsMenuOpen(true)}
              />
              <div className="hidden md:block">
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
            <div className="">
              <Logo className="text-sm" />
            </div>
            <div className="flex items-center justify-end gap-4">
              {/* <Link
                className="hidden md:block"
                href={`/search?published_at_gte=${new Date().toISOString().split("T")[0]}&published_at_lte=${new Date().toISOString().split("T")[0]}`}
              >
                <Button
                  className="foreground"
                  size={"sm"}
                  asChild={true}
                  variant="outline"
                >
                  <span>আজকের সংবাদ</span>
                </Button>
              </Link> */}
              <Link href="/search">
                <Search />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Drawer isOpen={isMenuOpen} setIsOpen={setIsMenuOpen}>
        <Drawer.Backdrop />
        <Drawer.Content className="flex h-screen w-80 max-w-[90vw] flex-col">
          <Sidebar
            categories={categories}
            onClose={() => setIsMenuOpen(false)}
          />
        </Drawer.Content>
      </Drawer>
    </>
  );
};

export default TopHeader;
