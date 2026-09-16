"use client";

import useScrollPosition from "@/hooks/ui/useScrollPosition";
import { cn } from "@/lib/utils";
import { Search as SearchIcon } from "lucide-react";
import Link from "next/link";

const Search = () => {
  const { scrollTop } = useScrollPosition();
  return (
    <Link
      href="/search"
      className={cn("scale-0 opacity-0 transition-all duration-300", {
        "scale-100 opacity-100": scrollTop > 64,
      })}
    >
      <SearchIcon />
    </Link>
  );
};

export default Search;
