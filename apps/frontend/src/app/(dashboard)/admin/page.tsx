"use client";

import Loader from "@/components/partials/admin/Loader";
import PageHeader from "@/components/partials/admin/PageHeader";
import { fetchAdminDashboard } from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";
import AdminStatisticsSection from "./_components/AdminStatisticsSection";
import CategoryBreakdownChart from "./_components/CategoryBreakdownChart";
import RecentActivityFeed from "./_components/RecentActivityFeed";
import TrendAreaChart from "./_components/TrendAreaChart";
import UpcomingEventsWidget from "./_components/UpcomingEventsWidget";

// Rebuilt to run off ONE consolidated query (GET /api/dashboard/admin, via
// fetchAdminDashboard()) instead of the 5 separate queries the previous
// version's sections fired independently (AdminStatisticsSection alone fired
// 4, ChartAreaInteractiveSection fired 1 more). Fetched once here and passed
// down as props -- every section below is now purely presentational.
//
// This still shows the same dashboard to everyone who can reach /admin
// (super-admin/admin/editor/author/contributor), same as before -- role
// branching and a separate Editorial-tier dashboard are a later phase.
//
// No top-level <main> here — the admin layout ((dashboard)/admin/layout.tsx)
// already renders one around `children`.
export default function AdminDashboardPage() {
  const { data: adminDashboard, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => fetchAdminDashboard(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />
      <section className="space-y-6">
        <AdminStatisticsSection data={adminDashboard?.data?.statistics} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <TrendAreaChart
            title="Total Views"
            description="Article views, last 30 days"
            data={adminDashboard?.data?.view_trends ?? []}
          />
          <TrendAreaChart
            title="New Users"
            description="Signups, last 30 days"
            data={adminDashboard?.data?.user_growth ?? []}
            dataKey="count"
            color="var(--chart-2)"
          />
        </div>

        <CategoryBreakdownChart
          data={adminDashboard?.data?.category_breakdown ?? []}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <UpcomingEventsWidget
            data={adminDashboard?.data?.upcoming_events ?? []}
          />
          <RecentActivityFeed
            data={adminDashboard?.data?.recent_activity ?? []}
          />
        </div>
      </section>
    </div>
  );
}
