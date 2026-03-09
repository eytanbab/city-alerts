"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type CitySummaryData } from "@/lib/utils/data-processor";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

interface CitySummaryProps {
  data: CitySummaryData;
  city: string;
}

export function CitySummary({ data, city }: CitySummaryProps) {
  const {
    last24h,
    percentChange,
    summaryText,
    longestQuietStreakDays,
    isPeakIntensity,
  } = data;

  const getTrendIcon = () => {
    if (percentChange === null || percentChange === 0)
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (percentChange > 0)
      return <TrendingUp className="h-4 w-4 text-destructive" />;
    return <TrendingDown className="h-4 w-4 text-emerald-500" />;
  };

  return (
    <Card
      className="w-full bg-card border border-border overflow-hidden"
      dir="rtl"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Info className="size-4.5 text-primary" />
            סקירה מהירה: {city}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isPeakIntensity && (
              <div className="bg-destructive/10 text-destructive text-[10px] md:text-xs px-2 py-0.5 rounded-full font-bold border border-destructive/20 animate-pulse">
                יום שיא
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md border text-xs font-bold tabular-nums">
              {getTrendIcon()}
              {percentChange !== null ? `${Math.abs(percentChange)}%` : "0%"}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm md:text-base leading-relaxed font-medium text-foreground/90">
            {summaryText}
          </p>

          <div className="grid grid-cols-3 gap-4 border-t border-border/50 pt-4 mt-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                ביממה האחרונה
              </span>
              <span className="text-xl font-bold tabular-nums">{last24h}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                ממוצע יומי
              </span>
              <span className="text-xl font-bold tabular-nums">
                {data.weeklyAvg.toFixed(1)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                שיא שקט
              </span>
              <span className="text-xl font-bold tabular-nums">
                {longestQuietStreakDays}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ימים
                </span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
