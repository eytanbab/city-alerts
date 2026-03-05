'use client';

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, MapPin, Calendar, Hash } from "lucide-react";

interface StatCardsProps {
  stats: {
    totalAlarms: number;
    topCityName: string;
    topCityCount: number;
    activeDays: number;
    affectedCitiesCount: number;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  const items = [
    {
      label: "סה\"כ אזעקות",
      value: stats.totalAlarms.toLocaleString(),
      subValue: "אירועים מתועדים",
      icon: AlertTriangle,
    },
    {
      label: "העיר המטווחת",
      value: stats.topCityName,
      subValue: `${stats.topCityCount.toLocaleString()} אירועים`,
      icon: MapPin,
    },
    {
      label: "ימי פעילות",
      value: stats.activeDays,
      subValue: "מתחילת המבצע",
      icon: Calendar,
    },
    {
      label: "יישובים בטווח",
      value: stats.affectedCitiesCount.toLocaleString(),
      subValue: "נקודות ציון",
      icon: Hash,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border" dir="rtl">
      {items.map((item) => (
        <Card key={item.label} className="bg-background rounded-none border-none shadow-none p-6">
          <CardContent className="p-0 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {item.label}
              </span>
              <item.icon className="h-3.5 w-3.5 text-muted-foreground/30" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground tabular-nums leading-none">
                {item.value}
              </div>
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-tight">
                {item.subValue}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
