"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ChartConfig } from "@/components/ui/Chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart";
import useScreenSize from "@/hooks/ui/useScreenSize";

// Shared presentational trend chart for the Admin dashboard's daily
// count-over-time series (view trends, user growth, ...). Extracted from
// the old ChartAreaInteractiveSection, which fetched its own data via
// useQuery and let the viewer pick a 7d/30d/90d range. That component is
// gone now: the Admin dashboard fetches everything up front in one
// fetchAdminDashboard() call with a fixed 30-day window, so there's no
// per-chart data fetching or day-range control left to keep here -- this
// component only renders whatever `data` it's given.
type TrendPoint = { date: string; count: number };

type TrendAreaChartProps = {
  title: string;
  description: string;
  data: TrendPoint[];
  dataKey?: string;
  color?: string;
};

const TrendAreaChart = ({
  title,
  description,
  data,
  dataKey = "count",
  color = "var(--primary)",
}: TrendAreaChartProps) => {
  const isMobile = useScreenSize().width < 1024;

  const chartConfig = {
    [dataKey]: {
      label: title,
      color,
    },
  } satisfies ChartConfig;

  const gradientId = `fill-${dataKey}`;

  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-row items-end justify-between gap-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <div className="text-muted-foreground text-sm">{description}</div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={`var(--color-${dataKey})`}
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor={`var(--color-${dataKey})`}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={(props) => (
                <ChartTooltipContent
                  {...props}
                  labelFormatter={(value) => {
                    return new Date(value as string | number).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      },
                    );
                  }}
                  indicator="dot"
                />
              )}
            />
            <Area
              dataKey={dataKey}
              type="natural"
              fill={`url(#${gradientId})`}
              stroke={`var(--color-${dataKey})`}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TrendAreaChart;
