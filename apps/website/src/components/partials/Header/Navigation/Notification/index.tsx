import { Drawer } from "@/components/ui/Drawer";
import { BellIcon, MoveLeft } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const Notification: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex h-full items-center">
      <button onClick={() => setIsOpen(true)} className="relative pr-1">
        <BellIcon className="size-6 cursor-pointer" />
        <span className="bg-accent text-accent-foreground absolute -top-1 right-0 inline-flex h-4 min-w-4 transform items-center justify-center rounded-full text-xs">
          0
        </span>
      </button>
      <Drawer isOpen={isOpen} setIsOpen={setIsOpen} asPortal side="right">
        <Drawer.Backdrop />
        <Drawer.Content className="flex h-screen w-80 max-w-[90vw] flex-col">
          <Drawer.Header className="h-16 border-b">
            <Drawer.Title className="uppercase">Notification</Drawer.Title>
            <Drawer.Close className="size-8 rounded-full" />
          </Drawer.Header>

          <Drawer.Body className="flex-1 overflow-y-auto">
            <div className="bg-muted text-muted-foreground mb-4 flex flex-wrap items-center gap-2 rounded p-4 text-start text-sm"></div>

            <div className="space-y-4"></div>
          </Drawer.Body>
          <Drawer.Footer className="flex h-16 items-center justify-center border-t">
            <Link
              href={"/notification"}
              className="flex items-center gap-2 hover:underline"
            >
              View All Notifications <MoveLeft strokeWidth={1} />
            </Link>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  );
};

export default Notification;
