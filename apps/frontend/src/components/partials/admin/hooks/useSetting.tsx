"use client";

// Backs the admin shell's settings (theme/direction/language/sidebar/header/
// layout) with the site's existing cookie-persisted usePreference hook,
// wrapped in a Context so every admin consumer shares one reactive instance
// instead of each independently reading the cookie on mount (which usePreference
// alone would do if called directly in multiple places, per Next.js SSR
// guidance on cookies being readable in both server and client contexts).
import usePreference from "@/hooks/states/usePreference";
import type { TPreferenceState } from "@/types/state.type";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";

type AdminSetting = Required<TPreferenceState>;

type AdminSettingContextValue = {
  setting: AdminSetting;
  setSetting: (payload: Partial<AdminSetting>) => void;
  reset: () => void;
  setTheme: (theme: AdminSetting["theme"]) => void;
  setDirection: (direction: AdminSetting["direction"]) => void;
  setLanguage: (language: AdminSetting["language"]) => void;
  setSidebar: (sidebar: AdminSetting["sidebar"]) => void;
  setHeader: (header: AdminSetting["header"]) => void;
  setLayout: (layout: AdminSetting["layout"]) => void;
  toggleTheme: () => void;
  toggleDirection: () => void;
  toggleLanguage: () => void;
  toggleSidebar: () => void;
};

const AdminSettingContext = createContext<AdminSettingContextValue | null>(
  null,
);

export const AdminSettingProvider = ({ children }: { children: ReactNode }) => {
  const {
    preference,
    setPreference,
    reset,
    setTheme,
    setDirection,
    setLanguage,
    setSidebar,
    setHeader,
    setLayout,
    toggleTheme,
    toggleDirection,
    toggleLanguage,
    toggleSidebar,
  } = usePreference();

  const value: AdminSettingContextValue = {
    setting: preference as AdminSetting,
    // usePreference's setPreference is a raw useState setter (replaces the
    // whole object); this API's original contract was a partial-merge patch
    // (setSetting({ sidebar: "compact" }) leaving other fields untouched).
    setSetting: (payload) => setPreference({ ...preference, ...payload }),
    reset,
    setTheme,
    setDirection,
    setLanguage,
    setSidebar,
    setHeader,
    setLayout,
    toggleTheme,
    toggleDirection,
    toggleLanguage,
    toggleSidebar,
  };

  return (
    <AdminSettingContext.Provider value={value}>
      {children}
    </AdminSettingContext.Provider>
  );
};

const useSetting = () => {
  const context = useContext(AdminSettingContext);
  if (!context) {
    throw new Error(
      "useSetting must be used within an <AdminSettingProvider />",
    );
  }
  return context;
};

export default useSetting;
