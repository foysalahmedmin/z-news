"use client";

// Plain-signed-in-user dashboard's full notification list route
// (`/user/notifications`) — linked from the user-shell header bell's "View
// All Notifications".
//
// Reuses the same shared NotificationsList component as the public site's
// `/notification` page (@/app/(primary)/notification/page.tsx) rather than
// the admin dashboard's NotificationsView
// (@/app/(dashboard)/admin/notifications/_components/NotificationsView.tsx):
// NotificationsView is self-scoped via cookie auth like this route is, but
// it unconditionally renders admin's <PageHeader />, which resolves its
// breadcrumb/title from useAdminMenu()'s breadcrumbsMap — built solely from
// the admin menu tree, keyed by /admin/* routes. On this /user/* route that
// lookup misses entirely, rendering a blank breadcrumb-less header instead
// of a real page title. Reusing NotificationsList (already free of that
// admin coupling) avoids leaking admin chrome into the user shell.
import NotificationsList from "@/components/partials/notification/NotificationsList";

export default function UserNotificationsPage() {
  return (
    <div className="flex size-full flex-col space-y-6">
      <header>
        <h1 className="text-foreground text-2xl font-semibold">
          Notifications
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Stay up to date with your activity on Z-News.
        </p>
      </header>

      <NotificationsList />
    </div>
  );
}
