"use client";

import type { TStatistic } from "@/components/partials/admin/StatisticCard";
import { StatisticCard } from "@/components/partials/admin/StatisticCard";
import { fetchCategories } from "@/services/admin-category.service";
import { fetchBulkNews } from "@/services/admin-news.service";
import { fetchUsers } from "@/services/admin-user.service";
import { fetchTotalViewCount } from "@/services/admin-view.service";
import { useQuery } from "@tanstack/react-query";

// Ported from apps/adminpanel's
// src/components/(common)/dashboard-page/AdminDashboard/AdminStatisticsSection/index.tsx.
// The source section used static sample data (no real fetch to port there),
// but the backend does expose real figures for this page: total views via
// GET /api/view/analytics/total (view.route.ts, admin-view.service.ts), and
// total users/categories/news via the `meta.total` each existing list
// endpoint already returns (same pattern EventsPage/CategoriesPage use to
// feed their own StatisticCards). Wired to those instead of inventing data.
const AdminStatisticsSection = () => {
  const { data: viewsResponse } = useQuery({
    queryKey: ["admin-dashboard", "total-views"],
    queryFn: () => fetchTotalViewCount(),
  });

  const { data: usersResponse } = useQuery({
    queryKey: ["admin-dashboard", "total-users"],
    queryFn: () => fetchUsers({ limit: 1 }),
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ["admin-dashboard", "total-categories"],
    queryFn: () => fetchCategories({ limit: 1 }),
  });

  const { data: newsResponse } = useQuery({
    queryKey: ["admin-dashboard", "total-news"],
    queryFn: () => fetchBulkNews({ limit: 1 }),
  });

  const statistics: TStatistic[] = [
    {
      title: "Total Views",
      value: viewsResponse?.data?.total || 0,
      subtitle: "All-time article views",
      description: "Overall view count across all news articles.",
      icon: "eye",
    },
    {
      title: "Total Users",
      value: usersResponse?.meta?.total || 0,
      subtitle: "Registered accounts",
      description: "Overall count of users in the system.",
      icon: "users",
    },
    {
      title: "Total Categories",
      value: categoriesResponse?.meta?.total || 0,
      subtitle: "Includes all categories",
      description: "Overall count of categories in the system.",
      icon: "folder-open",
    },
    {
      title: "Total News",
      value: newsResponse?.meta?.total || 0,
      subtitle: "Includes all news articles",
      description: "Overall count of news articles in the system.",
      icon: "file-text",
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
