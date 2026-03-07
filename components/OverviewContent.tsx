"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsString } from "nuqs";
import { type DashboardData } from "@/lib/data";
import { StatCards } from "@/components/StatCards";
import { Leaderboard } from "@/components/Leaderboard";
import { DailyTrendChart } from "@/components/DailyTrendChart";
import MapChart from "@/components/MapChart";
import { Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OverviewContentProps {
  dataPromise: Promise<DashboardData>;
}

export function OverviewContent({ dataPromise }: OverviewContentProps) {
  const data = use(dataPromise);
  const [selectedRegion, setSelectedRegion] = useQueryState(
    "region",
    parseAsString.withDefault("all"),
  );

  const router = useRouter();

  const { stats, mapData, topCities, globalDailyTrend, regions, isFallback } =
    data;

  const handleCitySelect = (city: string) => {
    router.push(`/analysis?city=${encodeURIComponent(city)}`);
  };

  const currentData =
    selectedRegion === "all"
      ? { stats, mapData, topCities, globalDailyTrend }
      : regions[selectedRegion];

  const regionLabel = selectedRegion === "all" ? "ארצי" : selectedRegion;

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

      <div className="flex flex-col gap-4" dir="rtl">
        <Tabs
          defaultValue="all"
          value={selectedRegion}
          onValueChange={setSelectedRegion}
          className="w-fit mx-auto"
        >
          <TabsList className="bg-card gap-1">
            <TabsTrigger value="צפון">צפון</TabsTrigger>
            <TabsTrigger value="מרכז">מרכז</TabsTrigger>
            <TabsTrigger value="דרום">דרום</TabsTrigger>
            <TabsTrigger value="all">ארצי</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {currentData?.stats && <StatCards stats={currentData.stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Leaderboard
          data={currentData?.topCities || []}
          onSelect={handleCitySelect}
        />
        <DailyTrendChart
          data={currentData?.globalDailyTrend || []}
          city={regionLabel}
          title={`מגמת אזעקות יומית (${regionLabel})`}
          description={`כמות האזעקות ב${regionLabel === "ארצי" ? "כל הארץ" : "אזור " + regionLabel} לאורך זמן`}
        />
      </div>
      <MapChart data={currentData?.mapData || []} />
    </div>
  );
}
