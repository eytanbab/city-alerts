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
  Zap,
  Moon,
  AlertCircle,
  BarChart3,
  LineChart as LineIcon,
} from "lucide-react";

interface AlarmChartProps {
  data?: { hour: string; count: number }[];
  city?: string;
  multiData?: { city: string; data: { hour: string; count: number }[] }[];
}

interface ChartDataEntry {
  hour: string;
  [key: string]: string | number;
}

const CITY_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function formatHourRanges(hours: string[]) {
  if (hours.length === 0) return "";
  const hourNums = hours
    .map((h) => parseInt(h.split(":")[0], 10))
    .sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = hourNums[0];
  let end = hourNums[0];

  for (let i = 1; i <= hourNums.length; i++) {
    if (i < hourNums.length && hourNums[i] === end + 1) {
      end = hourNums[i];
    } else {
      const nextHour = (end + 1).toString().padStart(2, "0");
      ranges.push(`${start.toString().padStart(2, "0")}:00-${nextHour}:00`);
      if (i < hourNums.length) {
        start = hourNums[i];
        end = hourNums[i];
      }
    }
  }
  return ranges.join(", ");
}

export function AlarmChart({ data, city, multiData }: AlarmChartProps) {
  const isMulti = !!(multiData && multiData.length > 1);
  const isSingleFromMulti = !!(multiData && multiData.length === 1);

  const chartData = useMemo(() => {
    if (isSingleFromMulti) {
      return multiData![0].data as ChartDataEntry[];
    }
    if (!isMulti) return (data || []) as ChartDataEntry[];

    const hours = Array.from(
      { length: 24 },
      (_, i) => `${i.toString().padStart(2, "0")}:00`,
    );
    return hours.map((hour) => {
      const entry: ChartDataEntry = { hour };
      multiData!.forEach((d) => {
        const hourData = d.data.find((h) => h.hour === hour);
        entry[d.city] = hourData ? hourData.count : 0;
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
    const counts = chartData.map((d) => Number(d.count) || 0);
    const maxCount = Math.max(...counts);
    const peakHours = chartData
      .filter((d) => (Number(d.count) || 0) === maxCount)
      .map((d) => d.hour);
    const minCount = Math.min(...counts);
    const silentHours = chartData
      .filter((d) => (Number(d.count) || 0) === minCount)
      .map((d) => d.hour);

    return {
      peakHoursFormatted: formatHourRanges(peakHours),
      silentHoursFormatted: formatHourRanges(silentHours),
      maxCount,
      minCount,
    };
  }, [chartData, total, isMulti]);

  if (total === 0) {
    return (
      <Card
        className="w-full bg-card border-none shadow-sm ring-1 ring-border/50"
        dir="rtl"
      >
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-20" />
          <p className="text-base text-muted-foreground font-medium">
            לא נמצאו נתוני אזעקות עבור{" "}
            {isMulti || isSingleFromMulti ? "הערים שנבחרו" : `"${city}"`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="w-full bg-card border-none shadow-sm ring-1 ring-border/50"
      dir="rtl"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg font-semibold">
              התפלגות שעתית {isMulti ? "(השוואה)" : `: ${activeCityName}`}
            </CardTitle>
            <CardDescription className="text-sm font-normal">
              סך הכל: {total.toLocaleString()} אזעקות בתקופה
            </CardDescription>
          </div>
          {isMulti ? (
            <LineIcon className="h-4 w-4 text-muted-foreground/50" />
          ) : (
            <BarChart3 className="h-4 w-4 text-muted-foreground/50" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4 px-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full"
        >
          {isMulti ? (
            <LineChart
              data={chartData}
              margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-muted"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="hour"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                minTickGap={10}
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
                width={35}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent className="rounded-lg border-border" />
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
              margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-muted"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="hour"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                minTickGap={10}
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
                width={35}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent className="rounded-lg border-border" />
                }
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          )}
        </ChartContainer>
      </CardContent>
      {insights && (
        <CardFooter className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
          <div className="flex items-start gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-3 w-3" />
                שעות שיא
              </p>
              <p className="text-sm font-semibold text-foreground">
                {insights.peakHoursFormatted}{" "}
                <span className="text-muted-foreground font-normal">
                  ({insights.maxCount} אזעקות)
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Moon className="h-3 w-3" />
                שעות שקטות
              </p>
              <p className="text-sm font-semibold text-foreground">
                {insights.silentHoursFormatted}{" "}
                <span className="text-muted-foreground font-normal">
                  ({insights.minCount} אזעקות)
                </span>
              </p>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
