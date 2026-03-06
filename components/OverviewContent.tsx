"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { type DashboardData } from "@/lib/data";
import { StatCards } from "@/components/StatCards";
import { Leaderboard } from "@/components/Leaderboard";
import { DailyTrendChart } from "@/components/DailyTrendChart";
import MapChart from "@/components/MapChart";
import { Info } from "lucide-react";

interface OverviewContentProps {
  dataPromise: Promise<DashboardData>;
}

export function OverviewContent({ dataPromise }: OverviewContentProps) {
  const data = use(dataPromise);
  const router = useRouter();
  const { stats, mapData, topCities, globalDailyTrend, isFallback } = data;

  const handleCitySelect = (city: string) => {
    router.push(`/analysis?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="flex flex-col gap-8">
      {isFallback && (
        <div
          className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-600 dark:text-amber-400"
          dir="rtl"
        >
          <Info className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">
            שימוש בנתונים שמורים: החיבור למקור הנתונים בזמן אמת נכשל. המידע
            המוצג עשוי להיות לא מעודכן.
          </p>
        </div>
      )}
      {stats && <StatCards stats={stats} />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Leaderboard data={topCities} onSelect={handleCitySelect} />
        <DailyTrendChart
          data={globalDailyTrend}
          title="מגמת אזעקות יומית (ארצי)"
          description="כמות האזעקות בכל הארץ לאורך זמן"
        />
      </div>
      <MapChart data={mapData} />
    </div>
  );
}
