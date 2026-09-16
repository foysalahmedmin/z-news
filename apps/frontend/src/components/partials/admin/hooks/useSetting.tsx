"use client";

// TODO(data-phase): This is a local, in-memory placeholder that stands in for
// apps/adminpanel's `useSetting` hook (which reads/writes `state.setting` in
// Redux and is kept in sync with localStorage by `SettingApplier`). For this
// shell-only port there is no Redux store yet, so theme/direction/language/
// sidebar/header/layout state just lives in React context for the lifetime
// of the `/admin` layout and resets on refresh. A later migration phase will
// swap this out for the real Redux-backed hook (and localStorage
// persistence) without changing the consumer API below.

import type { TPreferenceState } from "@/types/state.type";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

type AdminSetting = Required<TPreferenceState>;

const DEFAULT_SETTING: AdminSetting = {
  theme: "light",
  direction: "ltr",
  language: "en",
  sidebar: "expanded",
  header: "expanded",
  layout: "vertical",
};

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
  const [setting, setSettingState] = useState<AdminSetting>(DEFAULT_SETTING);

  const setSetting = (payload: Partial<AdminSetting>) =>
    setSettingState((prev) => ({ ...prev, ...payload }));

  const setTheme = (theme: AdminSetting["theme"]) => setSetting({ theme });
  const setDirection = (direction: AdminSetting["direction"]) =>
    setSetting({ direction });
  const setLanguage = (language: AdminSetting["language"]) =>
    setSetting({ language });
  const setSidebar = (sidebar: AdminSetting["sidebar"]) =>
    setSetting({ sidebar });
  const setHeader = (header: AdminSetting["header"]) => setSetting({ header });
  const setLayout = (layout: AdminSetting["layout"]) => setSetting({ layout });

  const value: AdminSettingContextValue = {
    setting,
    setSetting,
    reset: () => setSettingState(DEFAULT_SETTING),
    setTheme,
    setDirection,
    setLanguage,
    setSidebar,
    setHeader,
    setLayout,
    toggleTheme: () => {
      const order: AdminSetting["theme"][] = ["light", "dark", "system"];
      const nextIndex = (order.indexOf(setting.theme) + 1) % order.length;
      setTheme(order[nextIndex]);
    },
    toggleDirection: () =>
      setDirection(setting.direction === "ltr" ? "rtl" : "ltr"),
    toggleLanguage: () => setLanguage(setting.language === "en" ? "bn" : "en"),
    toggleSidebar: () =>
      setSidebar(setting.sidebar === "expanded" ? "compact" : "expanded"),
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
