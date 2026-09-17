"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ChartConfig } from "@/components/ui/Chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart";
import { FormControl } from "@/components/ui/FormControl";
import useScreenSize from "@/hooks/ui/useScreenSize";
import { fetchViewTrends } from "@/services/admin-view.service";
import { useQuery } from "@tanstack/react-query";

// Ported from apps/adminpanel's
// src/components/(common)/dashboard-page/AdminDashboard/ChartAreaInteractiveSection/index.tsx.
// The source section rendered static sample data (chart-data.ts) split into
// fake "desktop"/"mobile" series. The backend only tracks a single daily
// view count (GET /api/view/analytics/trends), so this now renders that one
// real series instead of inventing a device breakdown. Time-range selector
// (`timeRange`) is passed straight through as the `days` query param instead
// of the old client-side filtering against a hardcoded reference date, since
// the endpoint already filters server-side by `days`.
export const description = "An interactive area chart";

const chartConfig = {
  views: {
    label: "Views",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const DAYS_BY_RANGE: Record<string, number> = {
  "90d": 90,
  "30d": 30,
  "7d": 7,
};

const ChartAreaInteractiveSection = () => {
  const isMobile = useScreenSize().width < 1024;
  const [timeRange, setTimeRange] = React.useState("90d");

  // Adjust timeRange when isMobile changes, without the extra re-render an
  // effect would cause (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  // Still user-overridable afterward via the select below.
  const [prevIsMobile, setPrevIsMobile] = React.useState(isMobile);
  if (isMobile !== prevIsMobile) {
    setPrevIsMobile(isMobile);
    if (isMobile) {
      setTimeRange("7d");
    }
  }

  const days = DAYS_BY_RANGE[timeRange] || 90;

  const { data: trendsResponse } = useQuery({
    queryKey: ["admin-dashboard", "view-trends", days],
    queryFn: () => fetchViewTrends({ days }),
  });

  const filteredData = (trendsResponse?.data ?? []).map((item) => ({
    date: item.date,
    views: item.count,
  }));

  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-row items-end justify-between gap-2">
        <div>
          <CardTitle>Total Views</CardTitle>
          <div className="text-muted-foreground text-sm">
            <span className="hidden @[540px]/card:block">
              Article views over time
            </span>
            <span className="@[540px]/card:hidden">Views over time</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FormControl
            as={"select"}
            name="time"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="">Select</option>
            <option value="90d">Last 3 months</option>
            <option value="30d">Last 30 days</option>
            <option value="7d">Last 7 days</option>
          </FormControl>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-views)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-views)"
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
              dataKey="views"
              type="natural"
              fill="url(#fillViews)"
              stroke="var(--color-views)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ChartAreaInteractiveSection;
