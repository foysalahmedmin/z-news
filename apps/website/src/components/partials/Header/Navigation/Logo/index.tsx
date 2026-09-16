"use client";

import Logo from "@/components/partials/Logo";
import useScrollPosition from "@/hooks/ui/useScrollPosition";
import { cn } from "@/lib/utils";

const NavigationLogo = () => {
  const { scrollTop } = useScrollPosition();
  return (
    <Logo
      href="/"
      className={cn("scale-0 opacity-0 transition-all duration-300", {
        "scale-100 opacity-100": scrollTop > 64,
      })}
    />
  );
};

export default NavigationLogo;
