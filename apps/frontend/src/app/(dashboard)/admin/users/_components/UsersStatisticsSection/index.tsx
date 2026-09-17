import {
  StatisticCard,
  type TStatistic,
} from "@/components/partials/admin/StatisticCard";
import type { TUser } from "@/types/admin-user.type";
import React from "react";

// Ported from apps/adminpanel's
// `components/(common)/users-page/UsersStatisticsSection`. The source's
// card titles/subtitles/descriptions were copy-pasted verbatim from the
// Categories page ("Total Categories", "Featured Categories", ...) despite
// this being the Users statistics section — relabeled here to describe
// users instead, while keeping the same four underlying counts (total,
// author-role count, active/in-progress, blocked).
type UsersStatisticsSectionProps = {
  data?: TUser[];
};

const UsersStatisticsSection: React.FC<UsersStatisticsSectionProps> = ({
  data,
}) => {
  const total = data?.length || 0;
  const totalAuthor = data?.filter((d) => d?.role === "author").length || 0;
  const totalActive =
    data?.filter((d) => d?.status === "in-progress").length || 0;
  const totalInactive =
    data?.filter((d) => d?.status === "blocked").length || 0;

  const statistics: TStatistic[] = [
    {
      value: total,
      title: "Total Users",
      subtitle: "Includes all users",
      description: "Overall count of users in the system.",
      icon: "folder-open",
    },
    {
      value: totalAuthor,
      title: "Author Users",
      subtitle: "Content contributors",
      description: "Users with the author role.",
      icon: "edit2",
    },
    {
      value: totalActive,
      title: "Active Users",
      subtitle: "Currently active",
      description: "Users that are active and able to access the system.",
      icon: "check-circle",
    },
    {
      value: totalInactive,
      title: "Blocked Users",
      subtitle: "Currently blocked",
      description: "Users that are blocked from accessing the system.",
      icon: "x-circle",
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

export default UsersStatisticsSection;
