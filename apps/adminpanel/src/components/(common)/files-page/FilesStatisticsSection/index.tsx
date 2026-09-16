import {
  StatisticCard,
  type TStatistic,
} from "@/components/cards/StatisticCard";
import React from "react";

type FilesStatisticsSectionProps = {
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    statistics?: Record<string, number>;
  };
};

const FilesStatisticsSection: React.FC<FilesStatisticsSectionProps> = ({
  meta,
}) => {
  const { total, statistics: dataStatistics } = meta || {};

  const {
    active: totalActive,
    image: totalImages,
    video: totalVideos,
  } = dataStatistics || {};

  const statistics: TStatistic[] = [
    {
      value: total || 0,
      title: "Total Files",
      subtitle: "Includes all files",
      description: "Overall count of files in the system.",
      icon: "file",
    },
    {
      value: totalActive || 0,
      title: "Active Files",
      subtitle: "Currently active",
      description: "Files that are active and available.",
      icon: "check-circle",
    },
    {
      value: totalImages || 0,
      title: "Images",
      subtitle: "Image files",
      description: "Total number of image files.",
      icon: "image",
    },
    {
      value: totalVideos || 0,
      title: "Videos",
      subtitle: "Video files",
      description: "Total number of video files.",
      icon: "video",
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

export default FilesStatisticsSection;
