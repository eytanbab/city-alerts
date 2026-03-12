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
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TrendingUp, Info } from "lucide-react";
import { useState } from "react";

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
}: DailyTrendChartProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const isMulti = !!(multiData && multiData.length > 1);
  const isSingleFromMulti = !!(multiData && multiData.length === 1);

  const chartData = useMemo(() => {
    if (isSingleFromMulti) {
      return multiData![0].data as ChartDataEntry[];
    }
    return (data || []) as ChartDataEntry[];
  }, [data, multiData, isSingleFromMulti]);

  const total = useMemo(() => {
    if (isSingleFromMulti)
      return multiData![0].data.reduce((a, c) => a + (Number(c.count) || 0), 0);
    if (!isMulti)
      return (data || []).reduce(
        (acc, curr) => acc + (Number(curr.count) || 0),
        0,
      );
    return multiData!.reduce(
      (acc, d) => acc + d.data.reduce((a, c) => a + (Number(c.count) || 0), 0),
      0,
    );
  }, [data, multiData, isMulti, isSingleFromMulti]);

  const activeCityName = isSingleFromMulti ? multiData![0].city : city;

  const processedData = useMemo(() => {
    if (isMulti && !isSingleFromMulti) {
      // Multi-city trend
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
    }

    return chartData.map((item, index, array) => ({
      ...item,
      yesterday: index > 0 ? array[index - 1].count : null,
    }));
  }, [chartData, multiData, isMulti, isSingleFromMulti]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      count: {
        label: activeCityName || "אזעקות",
        color: "var(--chart-1)",
      },
    };
    if (isMulti && !isSingleFromMulti) {
      multiData!.forEach((d, i) => {
        config[d.city] = {
          label: d.city,
          color: CITY_COLORS[i % CITY_COLORS.length],
        };
      });
    }
    return config;
  }, [multiData, isMulti, isSingleFromMulti, activeCityName]);

  const insights = useMemo(() => {
    if (total === 0 || (isMulti && !isSingleFromMulti)) return null;
    const dataToUse = chartData;
    if (dataToUse.length === 0) return null;

    const sortedData = [...dataToUse].sort(
      (a, b) => (Number(b.count) || 0) - (Number(a.count) || 0),
    );
    const maxDay = sortedData[0];

    // Latest day comparison for percentage
    const latest = dataToUse[dataToUse.length - 1];
    const previous =
      dataToUse.length > 1 ? dataToUse[dataToUse.length - 2] : null;

    let percentChange: number | null = null;
    if (latest && previous && Number(previous.count) > 0) {
      const latestVal = Number(latest.count);
      const prevVal = Number(previous.count);
      percentChange = Math.round(((latestVal - prevVal) / prevVal) * 100);
    } else if (
      latest &&
      Number(latest.count) > 0 &&
      (!previous || Number(previous.count) === 0)
    ) {
      percentChange = 100;
    }

    if (!maxDay) return null;

    return {
      peakDay: formatDate(maxDay.date),
      peakCount: Number(maxDay.count) || 0,
      avgCount: Math.round(total / dataToUse.length),
      percentChange,
    };
  }, [chartData, total, isMulti, isSingleFromMulti]);

  if (total === 0) return null;

  return (
    <Card
      className="flex flex-col gap-4 py-4 text-card-foreground h-full bg-card border border-border shadow-sm"
      dir="rtl"
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="h-4 w-4 text-primary" />
          {isSingleFromMulti || (city && !isMulti)
            ? `מגמת אזעקות: ${activeCityName}`
            : title}
        </CardTitle>
        <CardDescription className="text-sm font-normal">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 px-2">
        <ChartContainer config={chartConfig} className="h-72 w-full">
          {isMulti && !isSingleFromMulti ? (
            <LineChart
              data={processedData}
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
                minTickGap={10}
                fontSize={12}
                tick={{ fill: "var(--muted-foreground)" }}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                orientation="right"
                allowDecimals={false}
                tickMargin={10}
                fontSize={12}
                tick={{ fill: "var(--muted-foreground)" }}
                width={40}
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
                  type="linear"
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
              data={processedData}
              margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
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
                minTickGap={10}
                fontSize={12}
                tick={{ fill: "var(--muted-foreground)" }}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                orientation="right"
                allowDecimals={false}
                tickMargin={10}
                fontSize={12}
                tick={{ fill: "var(--muted-foreground)" }}
                width={40}
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
                type="linear"
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
        <CardFooter className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50 bg-muted/5">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              יום שיא
            </span>
            <span className="text-sm font-semibold text-foreground">
              {insights.peakDay} ({formatNumber(insights.peakCount)})
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              ממוצע יומי
            </span>
            <span className="text-sm font-semibold text-foreground">
              {formatNumber(insights.avgCount)}
            </span>
          </div>

          <div className="flex flex-col gap-1 border-r pr-4 border-border/50">
            <Popover open={isInfoOpen} onOpenChange={setIsInfoOpen}>
              <PopoverTrigger asChild>
                <span
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1 cursor-help"
                  onMouseEnter={() => setIsInfoOpen(true)}
                  onMouseLeave={() => setIsInfoOpen(false)}
                >
                  מגמה יומית
                  <Info className="size-3 text-muted-foreground/70" />
                </span>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                className="w-auto max-w-40 px-3 py-2 text-xs font-medium leading-relaxed"
                dir="rtl"
              >
                <PopoverDescription>
                  השוואת כמות ההתרעות מהיום (החל מ-00:00) לעומת סך ההתרעות
                  אתמול.
                </PopoverDescription>
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-1.5">
              {insights.percentChange !== null ? (
                <>
                  <span
                    dir="ltr"
                    className={`text-sm font-semibold tabular-nums ${
                      insights.percentChange > 0
                        ? "text-destructive"
                        : insights.percentChange < 0
                          ? "text-emerald-500"
                          : "text-foreground"
                    }`}
                  >
                    {insights.percentChange > 0 ? "+" : ""}
                    {insights.percentChange}%
                  </span>
                  {insights.percentChange > 0 ? (
                    <TrendingUp className="size-3.5 text-destructive" />
                  ) : insights.percentChange < 0 ? (
                    <TrendingUp className="size-3.5 text-emerald-500 rotate-180" />
                  ) : null}
                </>
              ) : (
                <span className="text-sm font-semibold">-</span>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
