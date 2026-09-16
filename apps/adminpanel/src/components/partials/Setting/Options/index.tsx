import useSetting from "@/hooks/states/useSetting";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

// ----------------- Theme Options -----------------

export const ThemeOptionSystem = () => {
  const { setting, setTheme } = useSetting();
  return (
    <ThemeOptionLayout
      isActive={setting.theme === "system"}
      label="System"
      theme="system"
      onClick={() => setTheme("system")}
    />
  );
};

export const ThemeOptionLight = () => {
  const { setting, setTheme } = useSetting();
  return (
    <ThemeOptionLayout
      isActive={setting.theme === "light"}
      label="Light"
      theme="light"
      onClick={() => setTheme("light")}
    />
  );
};

export const ThemeOptionDark = () => {
  const { setting, setTheme } = useSetting();
  return (
    <ThemeOptionLayout
      isActive={setting.theme === "dark"}
      label="Dark"
      theme="dark"
      onClick={() => setTheme("dark")}
    />
  );
};

export const ThemeOptionSemiDark = () => {
  const { setting, setTheme } = useSetting();
  return (
    <ThemeOptionLayout
      isActive={setting.theme === "semi-dark"}
      label="Semi Dark"
      theme="semi-dark"
      onClick={() => setTheme("semi-dark")}
    />
  );
};

// Reusable Theme Option Layout
type ThemeOptionLayoutProps = {
  isActive: boolean;
  label: string;
  onClick: () => void;
  theme: "system" | "light" | "dark" | "semi-dark";
};

const ThemeOptionLayout: React.FC<ThemeOptionLayoutProps> = ({
  isActive,
  label,
  onClick,
  theme,
}) => {
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystemTheme = () => {
      setSystemTheme(media.matches ? "dark" : "light");
    };

    applySystemTheme();
    media.addEventListener("change", applySystemTheme);
    return () => media.removeEventListener("change", applySystemTheme);
  }, [theme]);

  const appliedTheme = theme === "system" ? systemTheme : theme;

  return (
    <label
      className={cn(
        "aspect-video cursor-pointer rounded-lg border-2 p-2 transition-all",
        {
          "border-primary text-primary": isActive,
        },
      )}
      onClick={onClick}
    >
      <div className={appliedTheme}>
        <div className="bg-background text-foreground h-full overflow-hidden rounded shadow-sm">
          <div className="flex h-full gap-1">
            <div
              className={cn("bg-card flex h-full w-1/3 flex-col gap-1 p-1", {
                dark: appliedTheme === "semi-dark",
              })}
            >
              <div className="bg-muted-foreground/25 h-3 rounded p-1">
                <div className="bg-muted mx-auto h-full w-3/4 rounded" />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-1 overflow-hidden">
                {Array(4)
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="bg-muted mx-auto h-1 w-3/4 rounded"
                    />
                  ))}
              </div>
              <div className="h-3" />
            </div>
            <div className="flex flex-1 flex-col justify-between p-1">
              <div className="bg-muted-foreground/25 h-3 rounded" />
              <div className="bg-muted-foreground/25 h-3 rounded" />
            </div>
          </div>
        </div>
      </div>
      <h5 className="mt-2 text-center text-xs font-medium uppercase">
        {label}
      </h5>
    </label>
  );
};

// ----------------- Direction Options -----------------

const DirectionLTR = () => {
  const { setting, setDirection } = useSetting();
  return (
    <DirectionOption
      label="LTR"
      isActive={setting.direction === "ltr"}
      icon="→"
      onClick={() => setDirection("ltr")}
    />
  );
};

const DirectionRTL = () => {
  const { setting, setDirection } = useSetting();
  return (
    <DirectionOption
      label="RTL"
      isActive={setting.direction === "rtl"}
      icon="←"
      onClick={() => setDirection("rtl")}
    />
  );
};

type DirectionOptionProps = {
  label: string;
  isActive: boolean;
  icon: string;
  onClick: () => void;
};

const DirectionOption: React.FC<DirectionOptionProps> = ({
  label,
  isActive,
  icon,
  onClick,
}) => {
  return (
    <label
      className={cn(
        `aspect-video cursor-pointer rounded-lg border-2 p-2 transition-all`,
        {
          "border-primary text-primary": isActive,
        },
      )}
      onClick={onClick}
    >
      <div className="text-foreground bg-muted flex h-full w-full items-center justify-center rounded">
        <div className="text-2xl">{icon}</div>
      </div>
      <h5 className="mt-2 text-center text-xs font-medium uppercase">
        {label}
      </h5>
    </label>
  );
};

// ----------------- Sidebar Options -----------------

const SidebarExpanded = () => {
  const { setting, setSidebar } = useSetting();
  return (
    <SidebarOption
      isActive={setting.sidebar === "expanded"}
      label="Expanded"
      leftWidth="w-1/4"
      rightWidth="w-3/4"
      onClick={() => setSidebar("expanded")}
    />
  );
};

const SidebarCompact = () => {
  const { setting, setSidebar } = useSetting();
  return (
    <SidebarOption
      isActive={setting.sidebar === "compact"}
      label="Compact"
      leftWidth="w-1/8"
      rightWidth="w-7/8"
      onClick={() => setSidebar("compact")}
    />
  );
};

type SidebarOptionProps = {
  isActive: boolean;
  label: string;
  leftWidth: string;
  rightWidth: string;
  onClick: () => void;
};

const SidebarOption: React.FC<SidebarOptionProps> = ({
  isActive,
  label,
  leftWidth,
  rightWidth,
  onClick,
}) => {
  return (
    <label
      className={cn(
        `aspect-video cursor-pointer rounded-lg border-2 p-2 transition-all`,
        {
          "border-primary text-primary": isActive,
        },
      )}
      onClick={onClick}
    >
      <div className="bg-background flex h-full w-full rounded">
        <div className={`${leftWidth} bg-muted-foreground/10 rounded-l`}></div>
        <div className={`${rightWidth} rounded-r`}></div>
      </div>
      <h5 className="mt-2 text-center text-xs font-medium uppercase">
        {label}
      </h5>
    </label>
  );
};

// ----------------- NameOption & SettingOption -----------------

type SettingName = "theme" | "direction" | "sidebar";
type SettingOption =
  | "system"
  | "light"
  | "dark"
  | "semi-dark"
  | "ltr"
  | "rtl"
  | "expanded"
  | "compact";

const nameOptionElementMap: Partial<
  Record<`${SettingName}-${SettingOption}`, React.ReactElement>
> = {
  "theme-light": <ThemeOptionLight />,
  "theme-dark": <ThemeOptionDark />,
  "theme-system": <ThemeOptionSystem />,
  "theme-semi-dark": <ThemeOptionSemiDark />,
  "direction-ltr": <DirectionLTR />,
  "direction-rtl": <DirectionRTL />,
  "sidebar-expanded": <SidebarExpanded />,
  "sidebar-compact": <SidebarCompact />,
};

const NameOption: React.FC<{
  name: SettingName;
  option: SettingOption;
}> = ({ name, option }) => {
  const key = `${name}-${option}` as keyof typeof nameOptionElementMap;
  return nameOptionElementMap[key] || null;
};

export const SettingOption: React.FC<{ name: SettingName }> = ({ name }) => {
  const nameOptionsMap: Record<SettingName, SettingOption[]> = {
    theme: ["system", "light", "dark", "semi-dark"],
    direction: ["ltr", "rtl"],
    sidebar: ["expanded", "compact"],
  };

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-semibold capitalize">{name} Settings</h3>
      <div className="grid grid-cols-2 gap-4">
        {nameOptionsMap[name].map((option) => (
          <NameOption key={option} name={name} option={option} />
        ))}
      </div>
    </div>
  );
};
