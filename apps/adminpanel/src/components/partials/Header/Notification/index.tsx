import { Drawer } from "@/components/ui/Drawer";
import useNotification from "@/hooks/states/useNotification";
import useSetting from "@/hooks/states/useSetting";
import { cn } from "@/lib/utils";
import { fetchNotificationRecipientsBySelf } from "@/services/notification-recipient.service";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { BellIcon, MoveLeft, MoveRight } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router";

const Notification: React.FC = () => {
  const { setting } = useSetting();
  const { unread, notifications } = useNotification();

  const [isOpen, setIsOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["notifications", notifications],
    queryFn: () => fetchNotificationRecipientsBySelf({ page: 1, limit: 12 }),
  });

  return (
    <div className="flex h-full items-center">
      <button onClick={() => setIsOpen(true)} className="relative pr-1">
        <BellIcon className="size-6 cursor-pointer" />
        <span className="bg-accent text-accent-foreground absolute -top-1 right-0 inline-flex h-4 min-w-4 transform items-center justify-center rounded-full text-xs">
          {unread}
        </span>
      </button>
      <Drawer isOpen={isOpen} setIsOpen={setIsOpen} asPortal side="right">
        <Drawer.Backdrop />
        <Drawer.Content
          className="flex h-screen w-80 max-w-[90vw] flex-col"
          side={setting.direction == "rtl" ? "left" : "right"}
        >
          <Drawer.Header className="h-16 border-b">
            <Drawer.Title className="uppercase">Notification</Drawer.Title>
            <Drawer.Close className="size-8 rounded-full" />
          </Drawer.Header>

          <Drawer.Body className="flex-1 overflow-y-auto">
            <div className="bg-muted text-muted-foreground mb-4 flex flex-wrap items-center gap-2 rounded p-4 text-start text-sm"></div>

            <div className="space-y-4">
              {[...(data?.data || [])]?.map((item) => {
                const timeAgo = formatDistanceToNow(new Date(item.created_at), {
                  addSuffix: true,
                });

                return (
                  <div
                    key={item._id}
                    className={cn(
                      "rounded border p-4 transition-colors",
                      item.is_read ? "bg-card" : "border-primary/40 bg-muted",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className={cn(
                            "font-semibold",
                            item.is_read
                              ? "text-muted-foreground"
                              : "text-foreground",
                          )}
                        >
                          {item.notification?.title}
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.notification?.message}
                        </p>
                      </div>

                      {!item.is_read && (
                        <span className="bg-primary mt-1 ml-2 h-2 w-2 rounded-full"></span>
                      )}
                    </div>

                    <div className="text-muted-foreground mt-2 text-xs">
                      {timeAgo}
                    </div>
                  </div>
                );
              })}
            </div>
          </Drawer.Body>
          <Drawer.Footer className="flex h-16 items-center justify-center border-t">
            <Link
              to={"/notification"}
              className="flex items-center gap-2 hover:underline"
            >
              View All Notifications{" "}
              {setting.direction === "ltr" ? (
                <MoveRight strokeWidth={1} />
              ) : (
                <MoveLeft strokeWidth={1} />
              )}
            </Link>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  );
};

export default Notification;
