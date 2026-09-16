import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import React from "react";

const Badge: React.FC<ComponentProps<"span">> = ({ className, children }) => {
  return (
    <span
      className={cn(
        "bg-primary text-primary-foreground inline-flex items-center rounded px-2 py-0.5",
        className,
      )}
    >
      {children}
    </span>
  );
};

export { Badge };
