"use client";

import {
  AlertTriangle,
  Map as MapIcon,
  Trophy,
  TrendingUp,
  MapPin,
  Calendar,
  Hash,
  Wind,
  CalendarDays,
  Clock,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

export function MapSkeleton() {
  return (
    <Card
      className="flex flex-col gap-4 py-4 text-card-foreground h-150 bg-card border border-border shadow-sm"
      dir="rtl"
    >
      <CardHeader className="px-6 py-4 border-b border-border bg-muted/5">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          מפת מוקדי התרעות
        </CardTitle>
      </CardHeader>
      <CardContent
        className="p-0 flex-1 relative overflow-hidden bg-muted/5"
        dir="ltr"
      >
        <div className="absolute inset-0 flex items-center justify-center z-10 animate-pulse">
          <div className="flex flex-col items-center gap-2">
            <MapIcon className="h-10 w-10 text-muted-foreground/20" />
            <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/40">
              טעינת מפה...
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardsSkeleton() {
  const staticLabels = [
    { label: 'סה"כ אזעקות', icon: AlertTriangle, subValue: "אירועים מתועדים" },
    { label: "העיר המטווחת", icon: MapPin, subValue: "אירועים" },
    { label: "ימי פעילות", icon: Calendar, subValue: "מתחילת המבצע" },
    { label: "יישובים בטווח", icon: Hash, subValue: "נקודות ציון" },
  ];
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border"
      dir="rtl"
    >
      {staticLabels.map((item) => (
        <Card
          key={`stat-skeleton-${item.label}`}
          className="rounded-none border-none shadow-none p-6 bg-card"
        >
          <CardContent className="p-0 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-md font-semibold uppercase text-muted-foreground">
                {item.label}
              </span>
              <item.icon className="h-3.5 w-3.5 text-muted-foreground/20" />
            </div>
            <div className="flex flex-col gap-1.5 animate-pulse">
              <div className="h-12 w-20 bg-muted rounded-md" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-tight">
                {item.subValue}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col h-full w-full" dir="rtl">
      <div className="grid grid-cols-2 w-full bg-muted/20 p-1 rounded-lg mb-4 animate-pulse">
        <div className="flex items-center justify-center gap-2 h-8 bg-background rounded-md shadow-sm border border-border/5">
          <Trophy className="h-3.5 w-3.5 text-muted-foreground/40" />
          <div className="h-3 w-16 bg-muted/40 rounded" />
        </div>
        <div className="flex items-center justify-center gap-2 h-8 bg-transparent">
          <Wind className="h-3.5 w-3.5 text-muted-foreground/20" />
          <div className="h-3 w-16 bg-muted/20 rounded" />
        </div>
      </div>
      <Card
        className="flex flex-col gap-4 py-4 text-card-foreground h-full bg-card border border-border shadow-sm"
        dir="rtl"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            הערים המטווחות ביותר
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <div className="flex flex-col animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={`leaderboard-item-skeleton-${i}`}
                className="w-full flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-muted/30 rounded" />
                  <div className="h-5 w-24 bg-muted rounded" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <div className="h-5 w-8 bg-muted rounded" />
                  <div className="h-3 w-10 bg-muted/20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export function TrendTabsSkeleton() {
  return (
    <div className="flex flex-col h-full w-full" dir="rtl">
      <div className="grid grid-cols-2 w-full bg-muted/20 p-1 rounded-lg mb-4 animate-pulse">
        <div className="flex items-center justify-center gap-2 h-8 bg-background rounded-md shadow-sm border border-border/5">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/40" />
          <div className="h-3 w-16 bg-muted/40 rounded" />
        </div>
        <div className="flex items-center justify-center gap-2 h-8 bg-transparent">
          <Clock className="h-3.5 w-3.5 text-muted-foreground/20" />
          <div className="h-3 w-16 bg-muted/20 rounded" />
        </div>
      </div>
      <TrendChartSkeleton footerCols={3} />
    </div>
  );
}

export function TrendChartSkeleton({
  title = "מגמת אזעקות",
  footerCols = 2,
}: {
  title?: string;
  footerCols?: number;
}) {
  const isHourly = title === "התפלגות שעתית";
  return (
    <Card
      className="flex flex-col gap-4 py-4 text-card-foreground h-full bg-card border border-border shadow-sm"
      dir="rtl"
    >
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            {isHourly ? (
              <Activity className="h-4 w-4 text-primary" />
            ) : (
              <TrendingUp className="h-4 w-4 text-primary" />
            )}
            {title}
          </CardTitle>
          {!isHourly && (
            <div className="h-4 w-48 bg-muted/50 animate-pulse rounded" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4 px-2">
        <div className="h-72 w-full bg-muted/5 animate-pulse rounded-md border border-dashed border-border/50 flex items-end justify-between px-8 py-4">
          {[40, 70, 45, 90, 65, 80, 50, 85, 35, 60, 55, 75].map((h, i) => (
            <div
              key={`bar-skeleton-${i}`}
              className={`w-4 md:w-6 bg-muted/10 rounded-t-sm md:rounded-t-md ${i > 7 ? "hidden md:block" : ""}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter
        className={`grid gap-4 pt-6 border-t border-border/50 bg-muted/5 ${
          footerCols === 3 ? "grid-cols-3" : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {Array.from({ length: footerCols }).map((_, i) => (
          <div
            key={`footer-item-skeleton-${i}`}
            className="flex flex-col gap-1.5 animate-pulse"
          >
            <div className="h-3 w-16 bg-muted/40 rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        ))}
      </CardFooter>
    </Card>
  );
}

export function CitySearchSkeleton() {
  return (
    <div className="w-full flex justify-center animate-pulse">
      <div className="h-9 w-full max-w-md bg-muted/40 rounded-md border border-border/50" />
    </div>
  );
}

export function CityMetricsCardsSkeleton() {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border w-full overflow-hidden animate-pulse"
      dir="rtl"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <Card
          key={`metric-skeleton-${i}`}
          className="rounded-none border-none shadow-none p-6 bg-card"
        >
          <CardContent className="p-0 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted/20 rounded" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-1">
                <div className="h-10 w-16 bg-muted rounded" />
                <div className="h-4 w-8 bg-muted/40 rounded" />
              </div>
              <div className="h-3 w-28 bg-muted/20 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CitySummarySkeleton() {
  return (
    <Card
      className="w-full bg-card border border-border overflow-hidden animate-pulse"
      dir="rtl"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-6 w-16 bg-muted/40 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted/60 rounded" />
            <div className="h-4 w-[90%] bg-muted/60 rounded" />
            <div className="h-4 w-[40%] bg-muted/60 rounded" />
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-border/50 pt-4 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="h-3 w-16 bg-muted/30 rounded" />
                <div className="h-6 w-12 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalysisEmptyStateSkeleton() {
  return (
    <div className="py-24 text-center border border-dashed bg-muted/5 flex flex-col items-center gap-4 w-full animate-pulse">
      <div className="p-4 bg-background rounded-full border shadow-sm">
        <div className="h-10 w-10 bg-muted/20 rounded-full" />
      </div>
      <div className="flex flex-col gap-2 items-center">
        <div className="h-7 w-32 bg-muted rounded" />
        <div className="h-5 w-64 bg-muted/40 rounded" />
      </div>
    </div>
  );
}

export function QuickButtonsSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-2 animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={`btn-skeleton-${i}`}
          className="h-9 w-20 bg-muted/40 rounded-full"
        />
      ))}
    </div>
  );
}
export function LastUpdatedSkeleton() {
  return (
    <div className="flex flex-col gap-1 items-center mb-8">
      <div className="flex gap-1">
        <span className="text-sm font-medium text-muted-foreground uppercase text-center">
          אזעקה אחרונה:
        </span>
        <div className="w-20 h-4 bg-muted animate-pulse rounded" />
      </div>

      <div className="flex gap-1">
        <span className="text-xs text-muted-foreground/60">סנכרון אחרון:</span>
        <div className="w-11 h-3.75 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

export function RegionSelectSkeleton() {
  return (
    <div className="w-fit h-9 animate-pulse bg-muted mx-auto rounded-lg">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`tab-${i + 1}`} className="inline-block w-12 h-full"></div>
      ))}
    </div>
  );
}
