import PageHeader from "@/components/partials/admin/PageHeader";
import AdminStatisticsSection from "./_components/AdminStatisticsSection";
import ChartAreaInteractiveSection from "./_components/ChartAreaInteractiveSection";
import DataTableUserActivitiesSection from "./_components/DataTableUserActivitiesSection";

// Ported from apps/adminpanel's src/pages/(common)/Dashboard/index.tsx,
// merged with src/components/(common)/dashboard-page/AdminDashboard/index.tsx
// (that wrapper added no behavior of its own, so it wasn't ported as a
// separate component). No top-level `<main>` here — the admin layout
// (`(dashboard)/admin/layout.tsx`) already renders one around `children`.
//
// All three sections below use static sample data in the source app (no
// service call to port — see each section's own file for its ported data).
// The source `AdminDashboard` only ever rendered the statistics and chart
// sections; `DataTableUserActivitiesSection` existed alongside them in the
// source tree but was never actually imported anywhere. It's wired in here
// per the porting brief, which listed it as one of this page's sections.
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader />
      <section className="space-y-6">
        <AdminStatisticsSection />
        <ChartAreaInteractiveSection />
        <DataTableUserActivitiesSection />
      </section>
    </div>
  );
}
