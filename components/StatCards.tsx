'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full" dir="rtl">
      <Card className="bg-primary/5 border-primary/20 shadow-none transition-colors hover:bg-primary/8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
          <CardTitle className="text-xs md:text-sm font-semibold text-muted-foreground">סה&quot;כ אזעקות</CardTitle>
          <AlertTriangle className="h-4 w-4 text-primary opacity-70" />
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-primary">{stats.totalAlarms.toLocaleString()}</div>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">אזעקות מתחילת התקופה</p>
        </CardContent>
      </Card>

      <Card className="bg-red-500/5 border-red-500/20 shadow-none transition-colors hover:bg-red-500/8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
          <CardTitle className="text-xs md:text-sm font-semibold text-muted-foreground">העיר המטווחת</CardTitle>
          <MapPin className="h-4 w-4 text-red-500 opacity-70" />
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-red-600 truncate">{stats.topCityName}</div>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{stats.topCityCount.toLocaleString()} אזעקות</p>
        </CardContent>
      </Card>

      <Card className="bg-blue-500/5 border-blue-500/20 shadow-none transition-colors hover:bg-blue-500/8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
          <CardTitle className="text-xs md:text-sm font-semibold text-muted-foreground">ימי פעילות</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500 opacity-70" />
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-blue-600">{stats.activeDays}</div>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">ימי לחימה עם נתונים</p>
        </CardContent>
      </Card>

      <Card className="bg-amber-500/5 border-amber-500/20 shadow-none transition-colors hover:bg-amber-500/8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
          <CardTitle className="text-xs md:text-sm font-semibold text-muted-foreground">יישובים</CardTitle>
          <Hash className="h-4 w-4 text-amber-500 opacity-70" />
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-amber-600">{stats.affectedCitiesCount.toLocaleString()}</div>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">ערים ויישובים שונים</p>
        </CardContent>
      </Card>
    </div>
  );
}
