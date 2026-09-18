"use client";

import Loader from "@/components/partials/admin/Loader";
import PageHeader from "@/components/partials/admin/PageHeader";
import useUser from "@/hooks/states/useUser";
import AdminTierDashboard from "./_components/AdminTierDashboard";
import EditorialTierDashboard from "./_components/EditorialTierDashboard";

// This app has 5 roles that can reach /admin: super-admin, admin, editor,
// author, contributor (enforced upstream by proxy.ts -- no further
// fallback/guard needed here). super-admin/admin get the Admin-tier
// dashboard (site-wide stats); editor/author/contributor get the
// Editorial-tier dashboard (their own content + moderation queue, gated
// further server-side by role within that single response).
const ADMIN_TIER_ROLES = ["super-admin", "admin"];

// No top-level <main> here — the admin layout ((dashboard)/admin/layout.tsx)
// already renders one around `children`.
export default function AdminDashboardPage() {
  const { user } = useUser();
  const { info } = user || {};

  return (
    <div className="space-y-6">
      <PageHeader />

      {!user?.isAuthenticated ? (
        // Brief moment before useUser()'s cookie-read effect resolves --
        // it starts as {isAuthenticated: false} with no role, so show the
        // shared Loader instead of flashing the wrong tier's dashboard.
        <Loader />
      ) : ADMIN_TIER_ROLES.includes(info?.role || "") ? (
        <AdminTierDashboard />
      ) : (
        <EditorialTierDashboard />
      )}
    </div>
  );
}
