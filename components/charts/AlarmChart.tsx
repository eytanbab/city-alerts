"use client";

import { useMemo, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";
import { Props as LegendProps } from "recharts/types/component/DefaultLegendContent";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Activity,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [view, setView] = useState<"bar" | "line">("bar");
  const isMulti = !!(multiData && multiData.length > 1);
  const isSingleFromMulti = !!(multiData && multiData.length === 1);

  // Auto-switch between line and bar based on selection count
  const [prevIsMulti, setPrevIsMulti] = useState(isMulti);
  if (isMulti !== prevIsMulti) {
    setPrevIsMulti(isMulti);
    setView(isMulti ? "line" : "bar");
  }

  // Map Hebrew city names to stable keys to avoid Recharts issues with Hebrew keys
  const cityKeys = useMemo(() => {
    if (!multiData) return {};
    const keys: Record<string, string> = {};
    multiData.forEach((d, i) => {
      keys[d.city] = `city${i}`;
    });
    return keys;
  }, [multiData]);

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
        const key = cityKeys[d.city];
        entry[key] = hourData ? hourData.count : 0;
      });
      return entry;
    });
  }, [data, multiData, isMulti, isSingleFromMulti, cityKeys]);

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
        const key = cityKeys[d.city];
        config[key] = {
          label: d.city,
          color: CITY_COLORS[i % CITY_COLORS.length],
        };
      });
    }
    return config;
  }, [multiData, isMulti, activeCityName, cityKeys]);

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

  const renderLegend = (props: LegendProps) => {
    const { payload } = props;
    if (!payload || !payload.length) return null;

    return (
      <div className="w-full flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pb-8 px-4">
        {payload.map((entry, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-semibold text-foreground leading-none">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (total === 0) {
    return (
      <Card
        className="flex flex-col gap-4 py-4 text-card-foreground h-full bg-card border border-border shadow-sm"
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
      className="flex flex-col gap-4 py-4 text-card-foreground h-full bg-card border border-border shadow-sm"
      dir="rtl"
    >
      <CardHeader className="pb-2 md:pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              התפלגות שעתית {isMulti ? "(השוואה)" : `: ${activeCityName}`}
            </CardTitle>
          </div>
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as typeof view)}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 md:w-40">
              <TabsTrigger value="bar" className="gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">עמודות</span>
              </TabsTrigger>
              <TabsTrigger value="line" className="gap-1.5">
                <LineIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">קו</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pb-4 px-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-72 w-full"
        >
          {view === "bar" ? (
            <BarChart
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
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="rounded border-border"
                    labelFormatter={(value) => {
                      if (typeof value !== "string") return value;
                      const hour = value.split(":")[0];
                      return (
                        <span dir="ltr" className="block text-right">
                          {hour}:00 - {hour}:59
                        </span>
                      );
                    }}
                  />
                }
              />
              {isMulti && <Legend verticalAlign="top" content={renderLegend} />}
              {isMulti ? (
                multiData!.map((d, i) => (
                  <Bar
                    key={d.city}
                    name={d.city}
                    dataKey={cityKeys[d.city]}
                    fill={CITY_COLORS[i % CITY_COLORS.length]}
                    radius={[2, 2, 0, 0]}
                  />
                ))
              ) : (
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        Number(entry.count) > 0 &&
                        Number(entry.count) === insights?.maxCount
                          ? "var(--destructive)"
                          : "var(--chart-1)"
                      }
                    />
                  ))}
                </Bar>
              )}
            </BarChart>
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
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="rounded border-border"
                    labelFormatter={(value) => {
                      if (typeof value !== "string") return value;
                      const hour = value.split(":")[0];
                      return (
                        <span dir="ltr" className="block text-right">
                          {hour}:00 - {hour}:59
                        </span>
                      );
                    }}
                  />
                }
              />
              {isMulti && <Legend verticalAlign="top" content={renderLegend} />}
              {isMulti ? (
                multiData!.map((d, i) => (
                  <Line
                    key={d.city}
                    name={d.city}
                    type="linear"
                    dataKey={cityKeys[d.city]}
                    stroke={CITY_COLORS[i % CITY_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))
              ) : (
                <Line
                  type="linear"
                  dataKey="count"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}
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
