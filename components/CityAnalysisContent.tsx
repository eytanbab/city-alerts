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
  activeCity: string;
  setActiveCity: (city: string) => void;
}

export function CityAnalysisContent({
  dataPromise,
  activeCity: initialCity,
  setActiveCity: updateUrl,
}: CityAnalysisContentProps) {
  const data = use(dataPromise);
  const { alarmsByCity, lastSirenPerCity, citiesList, isFallback } = data;

  // Use local state for active city to ensure instantaneous switching
  const [activeCity, setActiveCity] = React.useState(initialCity);

  // Sync state with URL when it changes externally (e.g., back button)
  React.useEffect(() => {
    setActiveCity(initialCity);
  }, [initialCity]);

  const handleCityChange = (city: string) => {
    setActiveCity(city); // Instant UI update
    updateUrl(city); // Update URL in background
  };

  const cityAlarms = useMemo(() => {
    if (!activeCity || !alarmsByCity) return [];
    return alarmsByCity[activeCity] || [];
  }, [alarmsByCity, activeCity]);

  const hourlyData = useMemo(() => {
    if (!cityAlarms.length) return [];
    return getHourlyDistribution(cityAlarms);
  }, [cityAlarms]);

  const cityDailyTrend = useMemo(() => {
    if (!cityAlarms.length) return [];
    return getCityDailyTrend(cityAlarms);
  }, [cityAlarms]);

  const lastSirenFormatted = useMemo(() => {
    const rawDatetime = lastSirenPerCity?.[activeCity];
    if (!rawDatetime) return null;

    // Convert YYYY-MM-DD HH:mm:ss to DD/MM/YY HH:mm
    const [datePart, timePart] = rawDatetime.split(" ");
    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");

    return `${day}/${month}/${year.slice(2)} ${hour}:${minute}`;
  }, [lastSirenPerCity, activeCity]);

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
        <CitySearch
          cities={citiesList}
          onSearch={handleCityChange}
          selectedCity={activeCity}
        />
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => handleCityChange(city)}
              className={`h-9 px-4 py-1.5 rounded-full text-sm font-medium border transition-color duration-200 cursor-pointer ${
                activeCity === city
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent text-muted-foreground border-input"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full max-w-5xl">
        {activeCity ? (
          <div className="grid grid-cols-1 gap-8">
            <AlarmChart data={hourlyData} city={activeCity} />
            <DailyTrendChart
              data={cityDailyTrend}
              title={`מגמת אזעקות: ${activeCity}`}
              description="כמות האזעקות בעיר לאורך זמן"
              lastSiren={lastSirenFormatted}
            />
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
