import type { TStatistic } from "@/components/cards/StatisticCard";
import type { TUser } from "@/types/user.type";
import { FileText } from "lucide-react";
import React from "react";

export type TProfileOverviewSectionProps = {
  user: Partial<TUser>;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    statistics?: Record<string, number>;
  };
};

const ProfileOverviewSection: React.FC<TProfileOverviewSectionProps> = ({
  user,
  meta,
}) => {
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
    <div className="space-y-6">
      {/* Description */}
      {user?.name && (
        <div>
          <h3 className="text-foreground mb-3 flex items-center text-lg font-semibold">
            <FileText className="mr-2 h-5 w-5" />
            Name
          </h3>
          <p className="text-muted-foreground leading-relaxed">{user?.name}</p>
        </div>
      )}

      {/* Category Details */}
      <div>
        <h3 className="text-foreground mb-4 text-lg font-semibold">
          Category Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="text-muted-foreground mb-1 text-sm">User ID</div>
            <div className="text-foreground font-mono text-sm">{user?._id}</div>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="text-muted-foreground mb-1 text-sm">
              User Status
            </div>
            <div className="text-foreground text-sm">
              {user?.status || "None"}
            </div>
          </div>
          {["supper-admin", "admin", "editor", "author"].includes(
            user?.role || "",
          ) && (
            <>
              {statistics.map((statistic, index) => (
                <div key={index} className="bg-muted rounded-lg p-4">
                  <div className="text-muted-foreground mb-1 text-sm">
                    {statistic.title}
                  </div>
                  <div className="text-foreground text-sm">
                    {statistic.value || 0}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileOverviewSection;
