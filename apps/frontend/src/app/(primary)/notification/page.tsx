"use client";

import NotificationsList from "@/components/partials/notification/NotificationsList";
import { BellIcon } from "lucide-react";

// Public-site full notification list route. Renders inside `(primary)`'s
// existing Header/Footer layout (@/app/(primary)/layout.tsx) — no admin
// dashboard chrome. Notification bells across the site (public/admin/user)
// link "View All Notifications" here for the public one.
const NotificationPage = () => {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
          <BellIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            Stay up to date with your activity on Z-News
          </p>
        </div>
      </div>

      <NotificationsList />
    </main>
  );
};

export default NotificationPage;
