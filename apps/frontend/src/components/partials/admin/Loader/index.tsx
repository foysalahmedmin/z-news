import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

const Loader: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "flex min-h-[calc(100vh-112px)] items-center justify-center py-12 lg:min-h-[calc(100vh-128px)]",
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
};

export default Loader;
