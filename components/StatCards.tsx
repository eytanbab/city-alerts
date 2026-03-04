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
      subValue: "אזעקות מתחילת התקופה",
      icon: AlertTriangle,
    },
    {
      label: "העיר המטווחת",
      value: stats.topCityName,
      subValue: `${stats.topCityCount.toLocaleString()} אזעקות`,
      icon: MapPin,
    },
    {
      label: "ימי פעילות",
      value: stats.activeDays,
      subValue: "ימים מתחילת המבצע",
      icon: Calendar,
    },
    {
      label: "יישובים",
      value: stats.affectedCitiesCount.toLocaleString(),
      subValue: "ערים ויישובים שונים",
      icon: Hash,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full" dir="rtl">
      {items.map((item) => (
        <Card key={item.label} className="bg-card px-2 border-none shadow-sm ring-1 ring-border/50 p-2">
          <CardContent className="p-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {item.label}
              </span>
              <item.icon className="h-4 w-4 text-muted-foreground/40" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-none">
                {item.value}
              </div>
              <span className="text-sm text-muted-foreground font-normal">
                {item.subValue}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
