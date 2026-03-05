"use client";

import {
  AlertTriangle,
  Map as MapIcon,
  Trophy,
  TrendingUp,
  MapPin,
  Calendar,
  Hash,
  Zap,
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
      className="w-full h-150 border border-border shadow-none rounded-sm overflow-hidden flex flex-col"
      dir="rtl"
    >
      <CardHeader className="px-6 py-4 border-b border-border bg-muted/5">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          מפת מוקדי התרעות
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative overflow-hidden bg-muted/5" dir="ltr">
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
    { label: 'סה"כ אזעקות', icon: AlertTriangle },
    { label: "העיר המטווחת", icon: MapPin },
    { label: "ימי פעילות", icon: Calendar },
    { label: "יישובים בטווח", icon: Hash },
  ];
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border"
      dir="rtl"
    >
      {staticLabels.map((item) => (
        <Card
          key={`stat-skeleton-${item.label}`}
          className="rounded-none border-none shadow-none p-6 bg-background"
        >
          <CardContent className="p-0 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-md font-semibold uppercase text-muted-foreground">
                {item.label}
              </span>
              <item.icon className="h-3.5 w-3.5 text-muted-foreground/10" />
            </div>
            <div className="flex flex-col gap-1 animate-pulse">
              <div className="h-10 md:h-14 w-24 bg-muted rounded-none" />
              <div className="h-4 w-32 bg-muted/20 rounded-none" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <Card
      className="h-full bg-card border-none shadow-sm ring-1 ring-border/50"
      dir="rtl"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Trophy className="h-4 w-4 text-muted-foreground" />
          הערים המטווחות ביותר
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <div className="flex flex-col animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div
              key={`leaderboard-item-skeleton-${i}`}
              className="w-full flex items-center justify-between p-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-5 bg-muted/30 rounded" />
                <div className="h-5 w-24 bg-muted rounded" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <div className="h-5 w-12 bg-muted rounded" />
                <div className="h-3 w-8 bg-muted/20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TrendChartSkeleton({
  title = "מגמת אזעקות יומית",
  footerCols = 2,
}: {
  title?: string;
  footerCols?: number;
}) {
  return (
    <Card
      className="h-full bg-card border-none shadow-sm ring-1 ring-border/50"
      dir="rtl"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              {title === "התפלגות שעתית" ? (
                <>
                  {title}
                  <div className="h-5 w-24 bg-muted animate-pulse rounded inline-block" />
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  {title}
                </>
              )}
            </CardTitle>
            <div className="h-4 w-48 bg-muted/50 animate-pulse rounded mt-1" />
          </div>
          {title === "התפלגות שעתית" && (
            <Zap className="h-4 w-4 text-muted-foreground/10" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4 px-2">
        <div className="h-60 w-full bg-muted/5 animate-pulse rounded-md border border-dashed border-border/50 flex items-center justify-center">
          <div className="h-32 w-3/4 bg-muted/10 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className={`grid grid-cols-${footerCols} gap-4 pt-4 border-t border-border`}>
        {Array.from({ length: footerCols }).map((_, i) => (
          <div key={`footer-item-skeleton-${i}`} className="flex flex-col gap-1 animate-pulse">
            <div className="h-3 w-16 bg-muted/40 rounded" />
            <div className="h-5 w-32 bg-muted rounded" />
          </div>
        ))}
      </CardFooter>
    </Card>
  );
}
