import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { ComponentProps } from "react";
import React from "react";

type CheckboxProps = ComponentProps<"input"> & {
  disabled?: boolean;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, disabled = false, ...props }, ref) => {
    return (
      <label
        className={cn(
          "relative flex size-6 cursor-pointer items-center justify-center rounded border-2 transition-colors",
          props.checked ? "border-accent bg-accent" : "border-foreground",
          !disabled && "hover:border-accent/75",
          disabled && "cursor-not-allowed",
        )}
      >
        <input
          type="checkbox"
          disabled={disabled}
          className={cn(
            "absolute h-full w-full cursor-pointer opacity-0",
            className,
          )}
          ref={ref}
          {...props}
        />
        {props.checked && (
          <Check
            size={16}
            className="text-accent-foreground pointer-events-none"
          />
        )}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
