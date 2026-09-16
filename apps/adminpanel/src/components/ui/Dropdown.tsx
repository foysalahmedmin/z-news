"use client";

import { useClickOutside } from "@/hooks/ui/useClickOutside";
import type { OverlayState } from "@/hooks/ui/useOverlayState";
import useOverlayState from "@/hooks/ui/useOverlayState";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { createContext, useContext } from "react";
import type { ButtonProps } from "./Button";
import { Button } from "./Button";

const dropdownVariants = cva("relative", {
  variants: {
    variant: {
      default: "",
      none: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const dropdownContentVariants = cva("absolute z-30 shadow-lg", {
  variants: {
    variant: {
      default: "border bg-card rounded-lg p-1",
      none: "",
    },
    side: {
      top: "bottom-full start-0 origin-top",
      bottom: "top-full start-0 origin-bottom",
      start: "start-full top-0 origin-start",
      end: "end-full top-0 origin-end",
    },
  },
  defaultVariants: {
    variant: "default",
    side: "bottom",
  },
});

type DropdownContextType = OverlayState &
  VariantProps<typeof dropdownVariants> &
  VariantProps<typeof dropdownContentVariants>;
type DropdownProps = ComponentProps<"div"> &
  VariantProps<typeof dropdownVariants> &
  VariantProps<typeof dropdownContentVariants> & {
    readonly isOpen?: boolean;
    readonly setIsOpen?: (open: boolean) => void;
    readonly asPortal?: boolean;
    readonly activeClassName?: string;
  };

type DropdownContentProps = ComponentProps<"div"> &
  VariantProps<typeof dropdownContentVariants> & {
    readonly activeClassName?: boolean;
  };

const DropdownContext = createContext<DropdownContextType | null>(null);

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdown must be used within a <Dropdown />");
  }
  return context;
};

// Dropdown Root Component
const DropdownRoot: React.FC<DropdownProps> = ({
  className,
  activeClassName,
  variant,
  side,
  isOpen: isOpenProp,
  setIsOpen: setIsOpenProp,
  children,
  ...props
}) => {
  const overlayState = useOverlayState(isOpenProp, setIsOpenProp);

  return (
    <DropdownContext.Provider value={{ ...overlayState, variant, side }}>
      <div
        className={cn(dropdownVariants({ variant, className }), {
          [cn("open", activeClassName)]: overlayState.isOpen,
        })}
        {...props}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

// Dropdown Content Component
const DropdownContent: React.FC<DropdownContentProps> = ({
  className,
  activeClassName,
  variant,
  side,
  children,
  ...props
}) => {
  const {
    isOpen,
    variant: contextVariant,
    side: contextSide,
    onClose,
  } = useDropdown();

  const ref = useClickOutside<HTMLDivElement>(() => {
    if (isOpen) onClose();
  });
  return (
    <div
      ref={ref}
      className={cn(
        dropdownContentVariants({
          variant: variant ?? contextVariant,
          side: side ?? contextSide,
          className,
        }),
        {
          [cn("visible scale-100 opacity-100", activeClassName)]: isOpen,
          "invisible scale-95 opacity-0": !isOpen,
        },
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Dropdown Item Component
const DropdownItem: React.FC<ComponentProps<"div">> = ({
  className,
  children,
  onClick,
  ...props
}) => {
  return (
    <div className={cn("w-full rounded-md px-4 py-2", className)} {...props}>
      {children}
    </div>
  );
};

// Dropdown Separator Component
const DropdownSeparator: React.FC<ComponentProps<"div">> = ({
  className,
  ...props
}) => <div className={cn("bg-border my-1 h-px", className)} {...props} />;

// Dropdown Label Component
const DropdownLabel: React.FC<ComponentProps<"div">> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "text-muted-foreground px-4 py-2 text-xs font-medium tracking-wider uppercase",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

// Dropdown Trigger Component
const DropdownTrigger: React.FC<ButtonProps> = ({ onClick, ...props }) => {
  const { onToggle } = useDropdown();

  return (
    <Button
      onClick={(e) => {
        onToggle();
        onClick?.(e);
      }}
      {...props}
    />
  );
};

// Dropdown Compound Component
const Dropdown = Object.assign(DropdownRoot, {
  Content: DropdownContent,
  Item: DropdownItem,
  Separator: DropdownSeparator,
  Label: DropdownLabel,
  Trigger: DropdownTrigger,
});

export {
  Dropdown,
  dropdownContentVariants,
  dropdownVariants,
  useDropdown,
  type DropdownContentProps,
  type DropdownProps,
};
