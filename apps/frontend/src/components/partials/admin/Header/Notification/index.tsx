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
import useUnreadNotificationCount from "@/hooks/useUnreadNotificationCount";
import { cn, formatTimeAgo } from "@/lib/utils";
import { fetchNotificationRecipientsBySelf } from "@/services/notification-recipient.service";
import type { TNotificationRecipient } from "@/types/notification-recipient";
import { useQuery } from "@tanstack/react-query";
import { BellIcon, Mail, MailOpen, MoveLeft, MoveRight } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const RECENT_LIMIT = 5;

const RecentNotificationItem: React.FC<{ item: TNotificationRecipient }> = ({
  item,
}) => {
  const timeAgo = formatTimeAgo(item.created_at);

  return (
    <div
      className={cn(
        "rounded border p-3 transition-colors",
        item.is_read ? "bg-card" : "border-primary/40 bg-muted",
      )}
    >
      <div className="flex items-start gap-2">
        {item.is_read ? (
          <MailOpen className="text-muted-foreground mt-0.5 size-4 flex-shrink-0" />
        ) : (
          <Mail className="text-primary mt-0.5 size-4 flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-semibold",
              item.is_read ? "text-muted-foreground" : "text-foreground",
            )}
            title={item.notification?.title}
          >
            {item.notification?.title}
          </p>
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
            {item.notification?.message}
          </p>
          <div className="text-muted-foreground mt-1 text-[11px]">
            {timeAgo}
          </div>
        </div>
      </div>
    </div>
  );
};

const Notification: React.FC = () => {
  const { setting } = useSetting();

  const [isOpen, setIsOpen] = useState(false);
  const { count } = useUnreadNotificationCount();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications-recent", { limit: RECENT_LIMIT }],
    queryFn: () => fetchNotificationRecipientsBySelf({ limit: RECENT_LIMIT }),
    enabled: isOpen,
  });

  const items = (data?.data || []) as TNotificationRecipient[];

  return (
    <div className="flex h-full items-center">
      <button
        onClick={() => setIsOpen(true)}
        className="relative pr-1"
        aria-label="Notifications"
      >
        <BellIcon className="size-6 cursor-pointer" />
        {count > 0 && (
          <span className="bg-accent text-accent-foreground absolute -top-1 right-0 inline-flex h-4 min-w-4 transform items-center justify-center rounded-full px-1 text-xs">
            {count > 99 ? "99+" : count}
          </span>
        )}
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
            {isLoading ? (
              <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-center">
                <BellIcon className="size-10 animate-pulse opacity-40" />
                <p className="text-sm">Loading…</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-center">
                <BellIcon className="size-10 opacity-40" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <RecentNotificationItem key={item._id} item={item} />
                ))}
              </div>
            )}
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
