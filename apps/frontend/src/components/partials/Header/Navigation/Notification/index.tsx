"use client";

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
import { BellIcon, Mail, MailOpen, MoveLeft } from "lucide-react";
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
        <DrawerContent className="flex h-screen w-80 max-w-[90vw] flex-col">
          <DrawerHeader className="h-16 border-b">
            <DrawerTitle className="uppercase">Notification</DrawerTitle>
            <DrawerCloseTrigger className="size-8 rounded-full" />
          </DrawerHeader>

          <DrawerBody className="flex-1 overflow-y-auto">
            <div className="bg-muted text-muted-foreground mb-4 flex flex-wrap items-center gap-2 rounded p-4 text-start text-sm">
              {count > 0
                ? `You have ${count} unread notification${count === 1 ? "" : "s"}.`
                : "You're all caught up."}
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="text-muted-foreground p-4 text-center text-sm">
                  Loading…
                </div>
              ) : items.length === 0 ? (
                <div className="text-muted-foreground p-4 text-center text-sm">
                  No notifications yet.
                </div>
              ) : (
                items.map((item) => (
                  <RecentNotificationItem key={item._id} item={item} />
                ))
              )}
            </div>
          </DrawerBody>
          <DrawerFooter className="flex h-16 items-center justify-center border-t">
            <Link
              href={"/notification"}
              className="flex items-center gap-2 hover:underline"
            >
              View All Notifications <MoveLeft strokeWidth={1} />
            </Link>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Notification;
