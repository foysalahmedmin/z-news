"use client";

import Loader from "@/components/partials/admin/Loader";
import { fetchEditorialDashboard } from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";
import CategoryBreakdownChart from "../CategoryBreakdownChart";
import ModerationQueueSection from "../ModerationQueueSection";
import MyContentPerformanceSection from "../MyContentPerformanceSection";
import RecentActivityFeed from "../RecentActivityFeed";

// Editorial-tier dashboard for editor/author/contributor viewers of /admin.
// Runs off ONE consolidated query (GET /api/dashboard/editorial via
// fetchEditorialDashboard()), matching the Admin tier's single-query
// convention (see AdminTierDashboard). `my_content` and `moderation_queue`
// are present in the response only for roles the backend decides should see
// them (author/contributor and editor/admin respectively) -- this component
// renders each section purely based on whether the field is present in the
// payload, without re-deriving the role check client-side.
const EditorialTierDashboard = () => {
  const { data: editorialDashboard, isLoading } = useQuery({
    queryKey: ["editorial-dashboard"],
    queryFn: () => fetchEditorialDashboard(),
  });

  if (isLoading) {
    return <Loader />;
  }

  const data = editorialDashboard?.data;

  return (
    <section className="space-y-6">
      {data?.my_content && (
        <MyContentPerformanceSection data={data.my_content} />
      )}

      {data?.moderation_queue && (
        <ModerationQueueSection data={data.moderation_queue} />
      )}

      <CategoryBreakdownChart data={data?.category_breakdown ?? []} />

      <RecentActivityFeed data={data?.recent_activity ?? []} />
    </section>
  );
};

export default EditorialTierDashboard;
