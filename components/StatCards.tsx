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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full" dir="rtl">
      <Card className="bg-primary/5 border-primary/20 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">סה"כ אזעקות</CardTitle>
          <AlertTriangle className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAlarms.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">אזעקות מתחילת התקופה</p>
        </CardContent>
      </Card>

      <Card className="bg-red-500/5 border-red-500/20 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">העיר המטווחת ביותר</CardTitle>
          <MapPin className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{stats.topCityName}</div>
          <p className="text-xs text-muted-foreground mt-1">{stats.topCityCount.toLocaleString()} אזעקות</p>
        </CardContent>
      </Card>

      <Card className="bg-blue-500/5 border-blue-500/20 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ימי פעילות</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeDays}</div>
          <p className="text-xs text-muted-foreground mt-1">ימים עם נתוני אזעקות</p>
        </CardContent>
      </Card>

      <Card className="bg-amber-500/5 border-amber-500/20 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">יישובים שהותקפו</CardTitle>
          <Hash className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.affectedCitiesCount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">ערים ויישובים שונים</p>
        </CardContent>
      </Card>
    </div>
  );
}
