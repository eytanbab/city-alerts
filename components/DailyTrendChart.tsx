"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

interface DailyTrendChartProps {
  data: { date: string; count: number }[];
  city?: string;
  title?: string;
  description?: string;
  lastSiren?: string | null;
}

const chartConfig = {
  count: {
    label: "כמות אזעקות",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  const [, month, day] = parts;
  return `${day}/${month}`;
}

const formatNumber = (num: number) =>
  new Intl.NumberFormat("he-IL").format(num);

export function DailyTrendChart({
  data,
  title = "מגמת אזעקות יומית",
  description = "כמות האזעקות לאורך זמן",
  lastSiren,
}: DailyTrendChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  const insights = useMemo(() => {
    if (data.length === 0) return null;
    const sortedData = [...data].sort((a, b) => b.count - a.count);
    const maxDay = sortedData[0];

    return {
      peakDay: formatDate(maxDay.date),
      peakCount: maxDay.count,
      avgCount: Math.round(total / data.length),
    };
  }, [data, total]);

  if (total === 0) return null;

  return (
    <Card
      className="h-full bg-card border-none shadow-sm ring-1 ring-border/50"
      dir="rtl"
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription className="text-sm font-normal">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 px-2">
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <AreaChart
            data={data}
            margin={{ left: 10, right: 0, top: 0, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatDate}
              minTickGap={30}
              fontSize={12}
              tick={{ fill: "var(--muted-foreground)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              orientation="right"
              allowDecimals={false}
              tickMargin={10}
              fontSize={12}
              tick={{ fill: "var(--muted-foreground)" }}
              width={20}
              tickFormatter={formatNumber}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="rounded-xl border-border"
                  labelFormatter={formatDate}
                  formatter={(val) => formatNumber(Number(val))}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              fill="var(--color-chart-1)"
              fillOpacity={0.1}
              animationDuration={500}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {insights && (
        <CardFooter
          className={`grid ${lastSiren ? "grid-cols-3" : "grid-cols-2"} gap-4 pt-4 border-t border-border`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              יום שיא
            </span>
            <span className="text-sm font-bold text-foreground">
              {insights.peakDay} ({formatNumber(insights.peakCount)})
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              ממוצע יומי
            </span>
            <span className="text-sm font-bold text-foreground">
              {formatNumber(insights.avgCount)} אזעקות
            </span>
          </div>
          {lastSiren && (
            <div className="flex flex-col gap-1 border-r pr-4 border-border/50">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                אזעקה אחרונה
              </span>
              <span className="text-sm font-bold text-foreground">
                {lastSiren}
              </span>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
