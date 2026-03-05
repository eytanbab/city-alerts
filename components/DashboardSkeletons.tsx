'use client';

import { AlertTriangle, Map as MapIcon, Trophy, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export function MapSkeleton() {
  return (
    <Card className="w-full h-[600px] border border-border shadow-none rounded-sm overflow-hidden flex flex-col" dir="rtl">
      <CardHeader className="px-6 py-4 border-b border-border bg-muted/5">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">מפת מוקדי התרעות</CardTitle>
      </CardHeader>
      <div className="flex-1 bg-muted/10 animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <MapIcon className="h-10 w-10 text-muted-foreground/20" />
          <span className="text-sm text-muted-foreground/40 font-medium">טוען מפה...</span>
        </div>
      </div>
    </Card>
  );
}

export function StatCardsSkeleton() {
  const staticLabels = ["סה\"כ אזעקות", "העיר המטווחת", "ימי פעילות", "יישובים בטווח"];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border" dir="rtl">
      {staticLabels.map((label) => (
        <div key={`stat-skeleton-${label}`} className="bg-background p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {label}
            </span>
            <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground/10" />
          </div>
          <div className="flex flex-col gap-1 animate-pulse">
            <div className="h-10 w-24 bg-muted rounded-none" />
            <div className="h-3 w-32 bg-muted/20 rounded-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <Card className="h-full bg-card border-none shadow-sm ring-1 ring-border/50" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Trophy className="h-4 w-4 text-muted-foreground" />
          הערים המטווחות ביותר
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <div className="flex flex-col gap-1 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={`leaderboard-item-skeleton-${i}`} className="w-full flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
              <div className="h-4 w-12 bg-muted rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TrendChartSkeleton({ title = "מגמת אזעקות יומית" }: { title?: string }) {
  return (
    <Card className="h-full bg-card border-none shadow-sm ring-1 ring-border/50" dir="rtl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <div className="h-3 w-48 bg-muted/50 animate-pulse rounded mt-1" />
      </CardHeader>
      <CardContent className="pb-4 px-2">
        <div className="h-60 w-full bg-muted/5 animate-pulse rounded-md border border-dashed border-border/50 flex items-center justify-center">
           <div className="h-32 w-3/4 bg-muted/10 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="flex flex-col gap-1 animate-pulse">
          <div className="h-2 w-12 bg-muted/50 rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
        <div className="flex flex-col gap-1 animate-pulse">
          <div className="h-2 w-12 bg-muted/50 rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
      </CardFooter>
    </Card>
  );
}
