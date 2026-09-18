"use client";

import useSetting from "@/components/partials/admin/hooks/useSetting";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/Drawer";
import { BellIcon, MoveLeft, MoveRight } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

// Forked from admin/Header/Notification/index.tsx, unchanged (same static
// empty-state placeholder, including the /admin/notifications link).
//
// TODO(data-phase): apps/adminpanel drives this list from
// `useNotification()` (Redux, fed live by `NotificationApplier` over
// socket.io) plus a react-query fetch of the recipient's notification page.
// None of that real-time wiring exists yet in apps/frontend, so this is a
// static empty state for now. A later migration phase will wire real
// notification data into all three header bells (admin/public/user) at once
// via a shared hook, and update this link to point at the right
// notifications route per shell at the same time.
const Notification: React.FC = () => {
  const { setting } = useSetting();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-full items-center">
      <button onClick={() => setIsOpen(true)} className="relative pr-1">
        <BellIcon className="size-6 cursor-pointer" />
      </button>
      <Drawer isOpen={isOpen} setIsOpen={setIsOpen} asPortal side="right">
        <DrawerBackdrop />
        <DrawerContent
          className="flex h-screen w-80 max-w-[90vw] flex-col"
          side={setting.direction == "rtl" ? "left" : "right"}
        >
          <DrawerHeader className="h-16 border-b">
            <DrawerTitle className="uppercase">Notification</DrawerTitle>
            <DrawerCloseTrigger className="size-8 rounded-full" />
          </DrawerHeader>

          <DrawerBody className="flex-1 overflow-y-auto">
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-center">
              <BellIcon className="size-10 opacity-40" />
              <p className="text-sm">No new notifications</p>
            </div>
          </DrawerBody>
          <DrawerFooter className="flex h-16 items-center justify-center border-t">
            <Link
              href={"/admin/notifications"}
              className="flex items-center gap-2 hover:underline"
            >
              View All Notifications{" "}
              {setting.direction === "ltr" ? (
                <MoveRight strokeWidth={1} />
              ) : (
                <MoveLeft strokeWidth={1} />
              )}
            </Link>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Notification;
