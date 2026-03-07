"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { type DashboardData, normalizeCityName } from "@/lib/data";
import { StatCards } from "@/components/StatCards";
import { Leaderboard } from "@/components/Leaderboard";
import { DailyTrendChart } from "@/components/DailyTrendChart";
import MapChart from "@/components/MapChart";
import { RegionFilter } from "@/components/RegionFilter";
import { Info } from "lucide-react";

interface OverviewContentProps {
  dataPromise: Promise<DashboardData>;
}

export function OverviewContent({ dataPromise }: OverviewContentProps) {
  const data = use(dataPromise);
  const router = useRouter();
  const {
    stats,
    mapData,
    topCities,
    globalDailyTrend,
    regionsList,
    cityToRegion,
    alarms,
    isFallback,
  } = data;

  const [selectedRegion, setSelectedRegion] = useQueryState("region");

  const handleCitySelect = (city: string) => {
    router.push(`/analysis?city=${encodeURIComponent(city)}`);
  };

  // Filter based on selected region if any
  const filteredData = (() => {
    if (!selectedRegion) return { stats, mapData, topCities, globalDailyTrend };

    const filteredAlarms = alarms.filter(
      (a) => cityToRegion[normalizeCityName(a.city)] === selectedRegion,
    );

    // Recalculate derived data for the region
    const cityEventCounts: Record<string, number> = {};
    const citySirenCounts: Record<string, number> = {};
    const dailyCounts: Record<string, number> = {};
    const seenEvents = new Set<string>();
    const uniqueBaseCities = new Set<string>();

    filteredAlarms.forEach((a) => {
      const baseCity = normalizeCityName(a.city);
      const minKey = a.datetime.substring(0, 16);
      const datePart = a.datetime.substring(0, 10);

      uniqueBaseCities.add(baseCity);
      citySirenCounts[a.city] = (citySirenCounts[a.city] || 0) + 1;

      const eventKey = `${baseCity}|${minKey}`;
      if (!seenEvents.has(eventKey)) {
        seenEvents.add(eventKey);
        cityEventCounts[baseCity] = (cityEventCounts[baseCity] || 0) + 1;
        dailyCounts[datePart] = (dailyCounts[datePart] || 0) + 1;
      }
    });

    const sortedCityEvents = Object.entries(cityEventCounts).sort(
      ([, a], [, b]) => b - a,
    );

    const statsObj =
      filteredAlarms.length > 0
        ? {
            totalAlarms: filteredAlarms.length,
            topCityName: sortedCityEvents[0]?.[0] || "N/A",
            topCityCount: sortedCityEvents[0]?.[1] || 0,
            activeDays: Object.keys(dailyCounts).length,
            affectedCitiesCount: uniqueBaseCities.size,
          }
        : null;

    const topCitiesList = sortedCityEvents
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const mapDataList = Object.entries(citySirenCounts)
      .map(([city, count]) => {
        const alarm = filteredAlarms.find((a) => a.city === city);
        return {
          city,
          count,
          lat: alarm?.lat || 0,
          lon: alarm?.lon || 0,
          polygon: data.polygons[city],
        };
      })
      .filter((d) => d.lat !== 0);

    const dailyTrendList = Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return {
      stats: statsObj,
      mapData: mapDataList,
      topCities: topCitiesList,
      globalDailyTrend: dailyTrendList,
    };
  })();

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

      {/* <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <RegionFilter 
            regions={regionsList} 
            selectedRegion={selectedRegion} 
            onSelect={setSelectedRegion} 
        />
      </div> */}

      {filteredData.stats && <StatCards stats={filteredData.stats} />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Leaderboard
          data={filteredData.topCities}
          onSelect={handleCitySelect}
        />
        <DailyTrendChart
          data={filteredData.globalDailyTrend}
          city={selectedRegion || "ארצי"}
          title={
            selectedRegion
              ? `מגמת אזעקות: ${selectedRegion}`
              : "מגמת אזעקות יומית (ארצי)"
          }
          description={
            selectedRegion
              ? "כמות האזעקות באזור לאורך זמן"
              : "כמות האזעקות בכל הארץ לאורך זמן"
          }
        />
      </div>
      <MapChart data={filteredData.mapData} />
    </div>
  );
}
