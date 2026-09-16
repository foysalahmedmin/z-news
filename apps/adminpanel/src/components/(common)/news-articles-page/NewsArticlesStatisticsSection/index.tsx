import {
  StatisticCard,
  type TStatistic,
} from "@/components/cards/StatisticCard";
import React from "react";

type NewsArticlesStatisticsSectionProps = {
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    statistics?: Record<string, number>;
  };
};

const NewsArticlesStatisticsSection: React.FC<
  NewsArticlesStatisticsSectionProps
> = ({ meta }) => {
  const { total, statistics: dataStatistics } = meta || {};
  const {
    published: totalPublished,
    draft: totalDraft,
    pending: totalPending,
  } = dataStatistics || {};

  const statistics: TStatistic[] = [
    {
      value: total || 0,
      title: "Total News Articles",
      subtitle: "Includes all News Articles",
      description: "Overall count of news articles in the system.",
      icon: "folder-open",
    },
    {
      value: totalPublished || 0,
      title: "Published News Articles",
      subtitle: "Currently published",
      description: "News Articles that are published and visible to users.",
      icon: "check-circle",
    },
    {
      value: totalDraft || 0,
      title: "Draft News Articles",
      subtitle: "Not published yet",
      description: "News articles saved as drafts and not visible to users.",
      icon: "file-text",
    },
    {
      value: totalPending || 0,
      title: "Pending News Articles",
      subtitle: "Awaiting approval",
      description: "News articles pending review before being published.",
      icon: "clock",
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

export default NewsArticlesStatisticsSection;
