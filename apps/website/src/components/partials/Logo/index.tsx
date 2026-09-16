"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const Logo = ({ className, ...props }) => {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-[0.5em] text-base leading-none transition-all duration-300",
        className,
      )}
      {...props}
    >
      <Image
        className="size-[2em] object-contain"
        src="/icon.png"
        alt="Logo"
        width={32}
        height={32}
      />
      <p className="leading-none text-[1em]">NEWS</p>
    </Link>
  );
};

export default Logo;
