import type { TStatistic } from "@/components/cards/StatisticCard";
import { StatisticCard } from "@/components/cards/StatisticCard";

const statistics: TStatistic[] = [
  {
    title: "Total Revenue",
    value: "1,250.00",
    subtitle: "Trending up this month",
    description: "Visitors for the last 6 months",
    icon: "trending-up",
    trend: {
      type: "up",
      value: "+12.5%",
    },
  },
  {
    title: "New Customers",
    value: "1,234",
    subtitle: "Down 20% this period",
    description: "Acquisition needs attention",
    icon: "trending-down",
    trend: {
      type: "up",
      value: "+15%",
    },
  },
  {
    title: "Active Accounts",
    value: "45,678",
    subtitle: "Strong user retention",
    description: "Engagement exceeds targets",
    icon: "trending-up",
    trend: {
      type: "up",
      value: "+12.5%",
    },
  },
  {
    title: "Growth Rate",
    value: "4.5%",
    subtitle: "Steady performance increase",
    description: "Meets growth projections",
    icon: "trending-up",
    trend: {
      type: "up",
      value: "+4.5%",
    },
  },
];

const AdminStatisticsSection = () => {
  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statistics.map((item) => (
        <StatisticCard key={item.title} item={item} />
      ))}
    </div>
  );
};

export default AdminStatisticsSection;
