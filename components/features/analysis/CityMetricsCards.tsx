"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Zap, ShieldCheck, Activity, TrendingUp } from "lucide-react";
import { type CityMetrics } from "@/lib/types";

interface CityMetricsCardsProps {
  metrics: CityMetrics | undefined;
}

export function CityMetricsCards({ metrics }: CityMetricsCardsProps) {
  if (!metrics) return null;

  const items = [
    {
      label: "זמן שקט ממוצע",
      value: metrics.avgQuietTimeHours.toFixed(1),
      unit: "שעות",
      subValue: "בין אירועים",
      icon: Clock,
    },
    {
      label: "זמן שקט מקסימלי",
      value: metrics.maxQuietTimeHours.toFixed(1),
      unit: "שעות",
      subValue: "הפוגה ארוכה ביותר",
      icon: ShieldCheck,
    },
    {
      label: "עצימות שיא",
      value: metrics.peakIntensity10Min,
      unit: "אזעקות",
      subValue: "בחלון של 10 דקות",
      icon: Zap,
    },
    {
      label: "קצב נוכחי",
      value: metrics.last24hFreqHours ? metrics.last24hFreqHours.toFixed(1) : "—",
      unit: "שעות",
      subValue: "בין אזעקה לאזעקה (24ש')",
      icon: TrendingUp,
    },
    {
      label: 'סה"כ התרעות',
      value: metrics.totalEvents,
      unit: "אזעקות",
      subValue: "מתחילת המבצע",
      icon: Activity,
    },
  ];

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-border border border-border w-full overflow-hidden"
      dir="rtl"
    >
      {items.map((item) => (
        <Card
          key={item.label}
          className="rounded-none border-none shadow-none p-6 bg-card"
        >
          <CardContent className="p-0 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold uppercase text-muted-foreground">
                {item.label}
              </span>
              <item.icon className="h-4 w-4 text-primary/50" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-5xl font-semibold tracking-tighter text-foreground tabular-nums leading-none">
                  {item.value}
                </span>
                <span className="text-sm font-bold text-muted-foreground">
                  {item.unit}
                </span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">
                {item.subValue}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
