import {
  StatisticCard,
  type TStatistic,
} from "@/components/cards/StatisticCard";
import React from "react";

type CategoriesStatisticsSectionProps = {
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    statistics?: Record<string, number>;
  };
};

const CategoriesStatisticsSection: React.FC<
  CategoriesStatisticsSectionProps
> = ({ meta }) => {
  const { total, statistics: dataStatistics } = meta || {};

  const {
    active: totalActive,
    inactive: totalInactive,
    featured: totalFeatured,
  } = dataStatistics || {};

  const statistics: TStatistic[] = [
    {
      value: total || 0,
      title: "Total Categories",
      subtitle: "Includes all categories",
      description: "Overall count of categories in the system.",
      icon: "folder-open",
    },
    {
      value: totalActive || 0,
      title: "Active Categories",
      subtitle: "Currently active",
      description: "Categories that are active and visible to users.",
      icon: "check-circle",
    },
    {
      value: totalInactive || 0,
      title: "Inactive Categories",
      subtitle: "Currently inactive",
      description: "Categories that are disabled or hidden from users.",
      icon: "x-circle",
    },
    {
      value: totalFeatured || 0,
      title: "Featured Categories",
      subtitle: "Highlighted selection",
      description: "Special categories marked as featured for promotion.",
      icon: "star",
    },
  ];
  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statistics.map((item, index) => (
        <StatisticCard key={index} item={item} />
      ))}
    </div>
  );
};

export default CategoriesStatisticsSection;
