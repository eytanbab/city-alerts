"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsString } from "nuqs";
import { type DashboardData } from "@/lib/types";
import { StatCards } from "@/components/features/overview/StatCards";
import { Leaderboard } from "@/components/features/overview/Leaderboard";
import dynamic from "next/dynamic";
import { TrendChartSkeleton } from "@/components/ui/dashboard-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapChart from "@/components/charts/MapChart";
import { Info, CalendarDays, Clock, Trophy, Wind } from "lucide-react";
import { RegionTabs } from "@/components/features/overview/RegionTabs";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const AlarmChart = dynamic(
  () => import("@/components/charts/AlarmChart").then((mod) => mod.AlarmChart),
  {
    ssr: false,
    loading: () => <TrendChartSkeleton title="התפלגות שעתית" />,
  },
);

const DailyTrendChart = dynamic(
  () =>
    import("@/components/charts/DailyTrendChart").then(
      (mod) => mod.DailyTrendChart,
    ),
  {
    ssr: false,
    loading: () => <TrendChartSkeleton title="מגמה יומית" />,
  },
);

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

  const {
    stats,
    mapData,
    topCities,
    bottomCities,
    globalDailyTrend,
    hourlyDistribution,
    regions,
    isFallback,
  } = data;

  const handleCitySelect = (city: string) => {
    router.push(`/analysis?city=${encodeURIComponent(city)}`);
  };

  const currentData =
    selectedRegion === "all"
      ? {
          stats,
          mapData,
          topCities,
          bottomCities,
          globalDailyTrend,
          hourlyDistribution,
        }
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

      <RegionTabs value={selectedRegion} onValueChange={setSelectedRegion} />

      {currentData?.stats && <StatCards stats={currentData.stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Tabs
          defaultValue="top"
          dir="rtl"
          className="w-full flex flex-col h-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="top" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              המטווחות ביותר
            </TabsTrigger>
            <TabsTrigger value="bottom" className="flex items-center gap-2">
              <Wind className="h-4 w-4" />
              השקטות ביותר
            </TabsTrigger>
          </TabsList>
          <TabsContent value="top" className="mt-0 flex-1">
            <Leaderboard
              data={currentData?.topCities || []}
              onSelect={handleCitySelect}
              title="הערים המטווחות ביותר"
              icon={Trophy}
            />
          </TabsContent>
          <TabsContent value="bottom" className="mt-0 flex-1">
            <Leaderboard
              data={currentData?.bottomCities || []}
              onSelect={handleCitySelect}
              title="הערים השקטות ביותר"
              icon={Wind}
            />
          </TabsContent>
        </Tabs>
        <Tabs
          defaultValue="daily"
          dir="rtl"
          className="w-full flex flex-col h-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              מגמה יומית
            </TabsTrigger>
            <TabsTrigger value="hourly" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              התפלגות שעתית
            </TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="mt-0 flex-1">
            <DailyTrendChart
              data={currentData?.globalDailyTrend || []}
              city={regionLabel}
              title={`מגמת אזעקות יומית (${regionLabel})`}
              description={`כמות האזעקות ב${regionLabel === "ארצי" ? "כל הארץ" : "אזור " + regionLabel} לאורך זמן`}
            />
          </TabsContent>
          <TabsContent value="hourly" className="mt-0 flex-1">
            <AlarmChart
              data={currentData?.hourlyDistribution || []}
              city={regionLabel}
            />
          </TabsContent>
        </Tabs>
      </div>
      <ErrorBoundary name="המפה">
        <MapChart data={currentData?.mapData || []} />
      </ErrorBoundary>
    </div>
  );
}
