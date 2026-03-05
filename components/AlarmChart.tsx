"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
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
import { Zap, Moon, AlertCircle } from "lucide-react";

interface AlarmChartProps {
  data: { hour: string; count: number }[];
  city: string;
}

const chartConfig = {
  count: {
    label: "כמות אזעקות",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

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

export function AlarmChart({ data, city }: AlarmChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  const insights = useMemo(() => {
    if (total === 0) return null;
    const maxCount = Math.max(...data.map((d) => d.count));
    const peakHours = data
      .filter((d) => d.count === maxCount)
      .map((d) => d.hour);
    const minCount = Math.min(...data.map((d) => d.count));
    const silentHours = data
      .filter((d) => d.count === minCount)
      .map((d) => d.hour);

    return {
      peakHoursFormatted: formatHourRanges(peakHours),
      silentHoursFormatted: formatHourRanges(silentHours),
      maxCount,
      minCount,
    };
  }, [data, total]);

  if (total === 0) {
    return (
      <Card
        className="w-full bg-card border-none shadow-sm ring-1 ring-border/50"
        dir="rtl"
      >
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-20" />
          <p className="text-base text-muted-foreground font-medium">
            לא נמצאו נתוני אזעקות עבור &quot;{city}&quot;
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
            <CardTitle className="text-lg font-bold">
              התפלגות שעתית: {city}
            </CardTitle>
            <CardDescription className="text-sm font-normal">
              סך הכל: {total.toLocaleString()} אזעקות בתקופה
            </CardDescription>
          </div>
          <Zap className="h-4 w-4 text-muted-foreground/50" />
        </div>
      </CardHeader>
      <CardContent className="pb-4 px-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <BarChart
            data={data}
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
            <Bar
              dataKey="count"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
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
