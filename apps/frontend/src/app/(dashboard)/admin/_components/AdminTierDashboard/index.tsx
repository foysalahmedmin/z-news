"use client";

import Loader from "@/components/partials/admin/Loader";
import { fetchAdminDashboard } from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";
import AdminStatisticsSection from "../AdminStatisticsSection";
import CategoryBreakdownChart from "../CategoryBreakdownChart";
import RecentActivityFeed from "../RecentActivityFeed";
import TrendAreaChart from "../TrendAreaChart";
import UpcomingEventsWidget from "../UpcomingEventsWidget";

// Admin-tier dashboard for super-admin/admin viewers of /admin. Extracted
// out of page.tsx unchanged so page.tsx can role-branch between this and
// EditorialTierDashboard -- no behavior change from the previous phase.
//
// Runs off ONE consolidated query (GET /api/dashboard/admin, via
// fetchAdminDashboard()) instead of the 5 separate queries the previous
// version's sections fired independently (AdminStatisticsSection alone fired
// 4, ChartAreaInteractiveSection fired 1 more). Fetched once here and passed
// down as props -- every section below is purely presentational.
const AdminTierDashboard = () => {
  const { data: adminDashboard, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => fetchAdminDashboard(),
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
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
  );
};

export default AdminTierDashboard;
