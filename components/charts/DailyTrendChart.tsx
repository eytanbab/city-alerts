"use client";

import { useMemo } from "react";
import { XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from "recharts";
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
  data?: { date: string; count: number }[];
  multiData?: { city: string; data: { date: string; count: number }[] }[];
  city?: string;
  title?: string;
  description?: string;
  lastSiren?: string | null;
}

interface ChartDataEntry {
  date: string;
  [key: string]: string | number;
}

const CITY_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

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
  multiData,
  city,
  title = "מגמת אזעקות יומית",
  description = "כמות האזעקות לאורך זמן",
  lastSiren,
}: DailyTrendChartProps) {
  const isMulti = !!(multiData && multiData.length > 1);
  const isSingleFromMulti = !!(multiData && multiData.length === 1);

  const chartData = useMemo(() => {
    if (isSingleFromMulti) {
      return multiData![0].data as ChartDataEntry[];
    }
    if (!isMulti) return (data || []) as ChartDataEntry[];

    // Get all unique dates across all cities
    const allDates = new Set<string>();
    multiData!.forEach((d) =>
      d.data.forEach((item) => allDates.add(item.date)),
    );
    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map((date) => {
      const entry: ChartDataEntry = { date };
      multiData!.forEach((d) => {
        const dateData = d.data.find((i) => i.date === date);
        entry[d.city] = dateData ? dateData.count : 0;
      });
      return entry;
    });
  }, [data, multiData, isMulti, isSingleFromMulti]);

  const total = useMemo(() => {
    if (isSingleFromMulti)
      return multiData![0].data.reduce((a, c) => a + c.count, 0);
    if (!isMulti)
      return chartData.reduce(
        (acc, curr) => acc + (Number(curr.count) || 0),
        0,
      );
    return multiData!.reduce(
      (acc, d) => acc + d.data.reduce((a, c) => a + c.count, 0),
      0,
    );
  }, [chartData, multiData, isMulti, isSingleFromMulti]);

  const activeCityName = isSingleFromMulti ? multiData![0].city : city;

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      count: {
        label: activeCityName || "אזעקות",
        color: "var(--chart-1)",
      },
    };
    if (isMulti) {
      multiData!.forEach((d, i) => {
        config[d.city] = {
          label: d.city,
          color: CITY_COLORS[i % CITY_COLORS.length],
        };
      });
    }
    return config;
  }, [multiData, isMulti, activeCityName]);

  const insights = useMemo(() => {
    if (total === 0 || isMulti) return null;
    const dataToUse = isSingleFromMulti ? multiData![0].data : data || [];
    const sortedData = [...dataToUse].sort(
      (a, b) => (Number(b.count) || 0) - (Number(a.count) || 0),
    );
    const maxDay = sortedData[0];

    if (!maxDay) return null;

    return {
      peakDay: formatDate(maxDay.date),
      peakCount: Number(maxDay.count) || 0,
      avgCount: Math.round(total / dataToUse.length),
    };
  }, [data, multiData, total, isMulti, isSingleFromMulti]);

  if (total === 0) return null;

  return (
    <Card
      className="h-full bg-card border-none shadow-sm ring-1 ring-border/50"
      dir="rtl"
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          {isSingleFromMulti ? `מגמת אזעקות: ${activeCityName}` : title}
        </CardTitle>
        <CardDescription className="text-sm font-normal">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 px-2">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          {isMulti ? (
            <LineChart
              data={chartData}
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
                  />
                }
              />
              <Legend verticalAlign="top" height={36} />
              {multiData!.map((d, i) => (
                <Line
                  key={d.city}
                  type="monotone"
                  dataKey={d.city}
                  stroke={CITY_COLORS[i % CITY_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          ) : (
            <LineChart
              data={chartData}
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
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={500}
              />
            </LineChart>
          )}
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
