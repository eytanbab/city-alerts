"use client";

import * as React from "react";
import { useMemo, use } from "react";
import dynamic from "next/dynamic";
import {
  getHourlyDistribution,
  getCityDailyTrend,
  type DashboardData,
} from "@/lib/data";
import { CitySearch } from "@/components/CitySearch";
import { CityMetricsCards } from "@/components/CityMetricsCards";
import { TrendChartSkeleton } from "@/components/DashboardSkeletons";
import { Search as SearchIcon, Info } from "lucide-react";

const AlarmChart = dynamic(
  () => import("@/components/AlarmChart").then((mod) => mod.AlarmChart),
  {
    ssr: false,
    loading: () => <TrendChartSkeleton title="התפלגות שעתית" />,
  },
);
const DailyTrendChart = dynamic(
  () =>
    import("@/components/DailyTrendChart").then((mod) => mod.DailyTrendChart),
  {
    ssr: false,
    loading: () => <TrendChartSkeleton />,
  },
);

const POPULAR_CITIES = [
  "ירושלים",
  "תל אביב",
  "באר שבע",
  "חיפה",
  "אשקלון",
  "אשדוד",
  "אילת",
];

interface CityAnalysisContentProps {
  dataPromise: Promise<DashboardData>;
  activeCities: string[];
  setActiveCities: (cities: string[]) => void;
}

export function CityAnalysisContent({
  dataPromise,
  activeCities: initialCities,
  setActiveCities: updateUrl,
}: CityAnalysisContentProps) {
  const data = use(dataPromise);
  const {
    alarmsByCity,
    lastSirenPerCity,
    citiesList,
    cityMetrics,
    isFallback,
  } = data;

  // Use local state for active cities to ensure instantaneous switching
  const [activeCities, setActiveCities] = React.useState(initialCities);

  // Sync state with URL when it changes externally (e.g., back button)
  React.useEffect(() => {
    setActiveCities(initialCities);
  }, [initialCities]);

  const toggleCity = (city: string) => {
    const updated = activeCities.includes(city)
      ? activeCities.filter((c) => c !== city)
      : [...activeCities, city];

    setActiveCities(updated); // Instant UI update
    updateUrl(updated); // Update URL in background
  };

  const removeCity = (city: string) => {
    const updated = activeCities.filter((c) => c !== city);
    setActiveCities(updated);
    updateUrl(updated);
  };

  const multiCityData = useMemo(() => {
    if (!activeCities.length || !alarmsByCity) return [];
    return activeCities.map((city) => ({
      city,
      alarms: alarmsByCity[city] || [],
      metrics: cityMetrics?.[city],
      lastSiren: lastSirenPerCity?.[city],
    }));
  }, [alarmsByCity, cityMetrics, lastSirenPerCity, activeCities]);

  const hourlyData = useMemo(() => {
    return multiCityData.map((d) => ({
      city: d.city,
      data: getHourlyDistribution(d.alarms),
    }));
  }, [multiCityData]);

  const dailyTrendData = useMemo(() => {
    return multiCityData.map((d) => ({
      city: d.city,
      data: getCityDailyTrend(d.alarms),
    }));
  }, [multiCityData]);

  return (
    <div className="w-full flex flex-col items-center gap-6" dir="rtl">
      {isFallback && (
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-600 dark:text-amber-400">
          <Info className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">
            שימוש בנתונים שמורים: החיבור למקור הנתונים בזמן אמת נכשל.
          </p>
        </div>
      )}

      <div className="w-full flex flex-col items-center gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl justify-center items-center">
          <CitySearch
            cities={citiesList}
            onSearch={toggleCity}
            selectedCities={activeCities}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => toggleCity(city)}
              className={`h-9 px-4 py-1.5 rounded-full text-sm font-medium border transition-color duration-200 cursor-pointer ${
                activeCities.includes(city)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent text-muted-foreground border-input"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {activeCities.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {activeCities.map((city) => (
              <div
                key={city}
                className="flex items-center gap-1.5 px-3 py-2 bg-accent/50 rounded-full border text-sm font-bold text-accent-foreground"
              >
                {city}
                <button
                  onClick={() => removeCity(city)}
                  className="hover:text-destructive transition-colors cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setActiveCities([]);
                updateUrl([]);
              }}
              className="text-sm font-medium text-muted-foreground hover:text-destructive px-2 cursor-pointer"
            >
              נקה הכל
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-5xl">
        {activeCities.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            <div className="flex flex-col gap-4">
              {multiCityData.map((d) => (
                <div key={d.city} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    <h3 className="text-lg font-semibold">{d.city}</h3>
                  </div>
                  <CityMetricsCards metrics={d.metrics} />
                </div>
              ))}
            </div>

            <AlarmChart multiData={hourlyData} />
            <DailyTrendChart multiData={dailyTrendData} />
          </div>
        ) : (
          <div className="py-24 text-center text-muted-foreground border border-dashed rounded-3xl bg-muted/5 flex flex-col items-center gap-4 w-full">
            <div className="p-4 bg-background rounded-full border shadow-sm">
              <SearchIcon className="h-10 w-10 opacity-20" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xl font-bold text-foreground">טרם נבחרה עיר</p>
              <p className="text-base font-medium">
                חפש עיר או בחר מהרשימה המהירה כדי לצפות בנתונים מפורטים.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
