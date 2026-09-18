"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ChartConfig } from "@/components/ui/Chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart";
import type { TCategoryBreakdownItem } from "@/types/dashboard.type";

// Presentational bar chart for the Admin dashboard's category breakdown.
// Categorical data (article count per category), not a time series, so this
// uses recharts' BarChart/Bar rather than the AreaChart used by
// TrendAreaChart -- kept in the same Card/ChartContainer wrapper style for
// visual consistency with the trend charts above it.
type CategoryBreakdownChartProps = {
  data: TCategoryBreakdownItem[];
};

const chartConfig = {
  count: {
    label: "Articles",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const CategoryBreakdownChart = ({ data }: CategoryBreakdownChartProps) => {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Content by Category</CardTitle>
        <div className="text-muted-foreground text-sm">
          Article count per category
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
            No category data yet
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <ChartTooltip
                cursor={false}
                content={(props) => (
                  <ChartTooltipContent {...props} indicator="dot" />
                )}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdownChart;
