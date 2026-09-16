import type { TPreferenceState } from "@/types/state.type";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { useCallback, useEffect, useState } from "react";

const COOKIE_KEY = "preference";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const initial: TPreferenceState = {
  theme: "light",
  direction: "ltr",
  language: "en",
  sidebar: "expanded",
  header: "expanded",
  layout: "vertical",
};

const usePreference = () => {
  const [preference, setPreference] = useState<TPreferenceState>(initial);

  // Load from cookies on mount
  useEffect(() => {
    const cookieValue = getCookie(COOKIE_KEY);
    if (cookieValue) {
      try {
        const parsed = JSON.parse(cookieValue as string);
        setPreference((prev) => ({ ...prev, ...parsed }));
      } catch {
        // Ignore JSON parse errors
      }
    }
  }, []);

  const savePreference = useCallback(
    (newPreference: Partial<TPreferenceState>) => {
      const updated = { ...preference, ...newPreference };
      setPreference(updated);
      setCookie(COOKIE_KEY, JSON.stringify(updated), {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    },
    [preference],
  );

  // Individual setters
  const setTheme = (theme: TPreferenceState["theme"]) =>
    savePreference({ theme });
  const setDirection = (direction: TPreferenceState["direction"]) =>
    savePreference({ direction });
  const setLanguage = (language: TPreferenceState["language"]) =>
    savePreference({ language });
  const setSidebar = (sidebar: TPreferenceState["sidebar"]) =>
    savePreference({ sidebar });
  const setHeader = (header: TPreferenceState["header"]) =>
    savePreference({ header });
  const setLayout = (layout: TPreferenceState["layout"]) =>
    savePreference({ layout });

  // Reset to default
  const reset = () => {
    deleteCookie(COOKIE_KEY, { path: "/" });
    setPreference(initial);
  };

  // Toggle helpers
  const toggleTheme = () => {
    const order: TPreferenceState["theme"][] = ["light", "dark", "system"];
    const nextIndex = (order.indexOf(preference.theme) + 1) % order.length;
    setTheme(order[nextIndex]);
  };

  const toggleDirection = () =>
    setDirection(preference.direction === "ltr" ? "rtl" : "ltr");

  const toggleLanguage = () =>
    setLanguage(preference.language === "en" ? "bn" : "en");

  const toggleSidebar = () =>
    setSidebar(preference.sidebar === "expanded" ? "compact" : "expanded");

  return {
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
  };
};

export default usePreference;
