import {
  StatisticCard,
  type TStatistic,
} from "@/components/cards/StatisticCard";
import React from "react";

type EventsStatisticsSectionProps = {
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    statistics?: Record<string, number>;
  };
};

const EventsStatisticsSection: React.FC<EventsStatisticsSectionProps> = ({
  meta,
}) => {
  const { total, statistics: dataStatistics } = meta || {};

  const {
    active: totalActive,
    inactive: totalInactive,
    featured: totalFeatured,
  } = dataStatistics || {};

  const statistics: TStatistic[] = [
    {
      value: total || 0,
      title: "Total Events",
      subtitle: "Includes all Events",
      description: "Overall count of events in the system.",
      icon: "folder-open",
    },
    {
      value: totalActive || 0,
      title: "Active Events",
      subtitle: "Currently active",
      description: "Events that are active and visible to users.",
      icon: "check-circle",
    },
    {
      value: totalInactive || 0,
      title: "Inactive Events",
      subtitle: "Currently inactive",
      description: "Events that are disabled or hidden from users.",
      icon: "x-circle",
    },
    {
      value: totalFeatured || 0,
      title: "Featured Events",
      subtitle: "Highlighted selection",
      description: "Special events marked as featured for promotion.",
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

export default EventsStatisticsSection;
