"use client";

import debounce from "@/utils/debounce";
import { useCallback, useEffect, useState } from "react";

// Tracks whether the mobile (off-canvas) sidebar is open, and auto-closes it
// when the viewport grows into the desktop breakpoint. Pure UI state, no
// external data dependency, so it's shared as-is (ported from
// apps/adminpanel's hook of the same name).
export const useSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // Auto-close mobile sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    const debouncedResize = debounce(handleResize, 150);
    window.addEventListener("resize", debouncedResize);

    // Initial check
    handleResize();

    return () => window.removeEventListener("resize", debouncedResize);
  }, []);

  return {
    isMobileOpen,
    toggleMobile,
    closeMobile,
  };
};
