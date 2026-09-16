"use client";

import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import useSetting from "@/hooks/states/useSetting";
import { cn } from "@/lib/utils";
import { Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import { SettingOption } from "./Options";

type SettingName = "theme" | "direction" | "sidebar";

const Settings = () => {
  const { setting } = useSetting();
  const [isOpen, setIsOpen] = useState(false);
  const settingOptions: SettingName[] = ["theme", "direction", "sidebar"];

  return (
    <div className={cn("fixed end-0 bottom-6 z-50")}>
      <div className="group/button-container inline-block">
        <Button
          onClick={() => setIsOpen(true)}
          shape="icon"
          className="group/button -me-6 size-12 rounded-full group-hover/button-container:me-6"
        >
          <SettingsIcon className="group-hover/button:animate-spin" />
        </Button>
      </div>

      <Drawer isOpen={isOpen} setIsOpen={setIsOpen} asPortal side="right">
        <Drawer.Backdrop />
        <Drawer.Content
          className="flex h-screen w-80 max-w-[90vw] flex-col"
          side={setting.direction == "rtl" ? "left" : "right"}
        >
          <Drawer.Header className="h-16 border-b">
            <Drawer.Title className="uppercase">Settings</Drawer.Title>
            <Drawer.Close className="size-8 rounded-full" />
          </Drawer.Header>

          <Drawer.Body className="flex-1 overflow-y-auto">
            <div className="bg-muted text-muted-foreground mb-4 flex flex-wrap items-center gap-2 rounded p-4 text-left text-sm">
              <div className="flex items-center gap-1">
                <span className="capitalize">Theme:</span>
                <strong className="capitalize">{setting.theme};</strong>
              </div>
              <div className="flex items-center gap-1">
                <span className="capitalize">Direction:</span>
                <strong className="uppercase">{setting.direction};</strong>
              </div>
              <div className="flex items-center gap-1">
                <span className="capitalize">Sidebar:</span>
                <strong className="capitalize">{setting.sidebar};</strong>
              </div>
            </div>

            <div className="space-y-4">
              {settingOptions.map((option) => (
                <SettingOption key={option} name={option} />
              ))}
            </div>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </div>
  );
};

export default Settings;
