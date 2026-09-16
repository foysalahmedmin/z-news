import { Card } from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

// Types
export type TrendType = "up" | "down" | "neutral";

export type TStatistic = {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon?: string;
  trend?: {
    type: TrendType;
    value: string | number;
    label?: string;
  };
};

export type TStatisticCardProps = {
  item: TStatistic;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
};

// Utility function to get trend icon
const getTrendIcon = (type: TrendType) => {
  switch (type) {
    case "up":
      return TrendingUp;
    case "down":
      return TrendingDown;
    case "neutral":
    default:
      return Minus;
  }
};

// Utility function to get trend color
const getTrendColor = (type: TrendType) => {
  switch (type) {
    case "up":
      return "text-green-500";
    case "down":
      return "text-red-500";
    case "neutral":
    default:
      return "text-gray-500";
  }
};

// Main StatisticCard component
export const StatisticCard: React.FC<TStatisticCardProps> = ({
  item,
  className,
  onClick,
}) => {
  const { title, value, subtitle, description, icon, trend } = item;

  const TrendIcon = trend ? getTrendIcon(trend.type) : null;
  const trendColor = trend ? getTrendColor(trend.type) : "";

  return (
    <Card className={cn("", className)} onClick={onClick}>
      {/* Header */}
      <Card.Header className="space-y-1.5 pb-0">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground text-sm">{title}</p>
          {trend && (
            <div className={cn("flex items-center gap-1", trendColor)}>
              {TrendIcon && <TrendIcon className="size-4" />}
              <span className="text-xs font-medium">
                {typeof trend.value === "number"
                  ? trend.value.toLocaleString()
                  : trend.value}
                {trend.label && (
                  <span className="text-muted-foreground/50 ml-1">
                    {trend.label}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
        <Card.Title className="text-2xl font-semibold tabular-nums md:text-3xl">
          {value}
        </Card.Title>
        <div className="bg-muted-foreground/25 mt-2 w-4 rounded-full py-1" />
      </Card.Header>
      <Card.Footer className="flex-col items-start gap-1.5 text-sm">
        <div className="flex items-center gap-2 font-medium">
          {icon && <Icon className="size-5" name={icon} />} {subtitle}
        </div>
        <div className="text-muted-foreground">{description}</div>
      </Card.Footer>
    </Card>
  );
};
