import type { TStatistic } from "@/components/partials/admin/StatisticCard";
import { StatisticCard } from "@/components/partials/admin/StatisticCard";
import type { TAdminDashboardData } from "@/types/dashboard.type";

// Previously fired 4 separate useQuery calls (total views, total users,
// total categories, total news) against 4 different endpoints. The Admin
// dashboard now runs off one consolidated fetchAdminDashboard() call made
// once by the parent page, so this section is purely presentational --
// it just renders whatever slice of the payload it's handed.
type AdminStatisticsSectionProps = {
  data?: TAdminDashboardData["statistics"];
};

const AdminStatisticsSection = ({ data }: AdminStatisticsSectionProps) => {
  const statistics: TStatistic[] = [
    {
      title: "Total Views",
      value: data?.total_views || 0,
      subtitle: "All-time article views",
      description: "Overall view count across all news articles.",
      icon: "eye",
    },
    {
      title: "Total Users",
      value: data?.total_users || 0,
      subtitle: "Registered accounts",
      description: "Overall count of users in the system.",
      icon: "users",
    },
    {
      title: "Total Categories",
      value: data?.total_categories || 0,
      subtitle: "Includes all categories",
      description: "Overall count of categories in the system.",
      icon: "folder-open",
    },
    {
      title: "Total News",
      value: data?.total_news || 0,
      subtitle: "Includes all news articles",
      description: "Overall count of news articles in the system.",
      icon: "file-text",
    },
    {
      title: "Total Comments",
      value: data?.total_comments || 0,
      subtitle: "All-time comments",
      description: "Overall count of comments across all articles.",
      icon: "message-square-quote",
    },
    {
      title: "Total Reactions",
      value: data?.total_reactions || 0,
      subtitle: "All-time reactions",
      description: "Overall count of reactions across all articles.",
      icon: "smile",
    },
    {
      title: "Pending Review",
      value: data?.pending_news || 0,
      subtitle: "Awaiting moderation",
      description: "News articles currently pending review.",
      icon: "clock",
    },
    {
      title: "Flagged Comments",
      value: data?.flagged_comments || 0,
      subtitle: "Needs attention",
      description: "Comments flagged by users for moderation.",
      icon: "flag",
    },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statistics.map((item) => (
        <StatisticCard key={item.title} item={item} />
      ))}
    </div>
  );
};

export default AdminStatisticsSection;
