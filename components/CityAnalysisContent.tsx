"use client";

import * as React from "react";
import { useMemo, use } from "react";
import dynamic from "next/dynamic";
import {
  getHourlyDistribution,
  getCityDailyTrend,
  getCitySummary,
  type DashboardData,
} from "@/lib/data";
import { CitySearch } from "@/components/CitySearch";
import { CityMetricsCards } from "@/components/CityMetricsCards";
import { CitySummary } from "@/components/CitySummary";
import { TrendChartSkeleton } from "@/components/DashboardSkeletons";
import { Search as SearchIcon, Info, AlertCircle, X } from "lucide-react";
import { Button } from "./ui/button";

const MAX_CITIES = 5;

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

function formatLastSiren(rawDatetime: string | undefined): string | null {
  if (!rawDatetime) return null;
  try {
    const [datePart, timePart] = rawDatetime.split(" ");
    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");
    return `${day}/${month}/${year.slice(2)} ${hour}:${minute}`;
  } catch {
    return rawDatetime;
  }
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
  const [error, setError] = React.useState<string | null>(null);

  // Sync state with URL when it changes externally (e.g., back button or manual edit)
  // Also enforce the MAX_CITIES limit here
  React.useEffect(() => {
    if (initialCities.length > MAX_CITIES) {
      const truncated = initialCities.slice(0, MAX_CITIES);
      setActiveCities(truncated);
      updateUrl(truncated);
      setError(`ניתן להשוות עד ${MAX_CITIES} ערים. הרשימה צומצמה אוטומטית.`);
    } else {
      setActiveCities(initialCities);
    }
  }, [initialCities, updateUrl]);

  // Clear error after 3 seconds
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const toggleCity = (city: string) => {
    const isSelected = activeCities.includes(city);

    if (!isSelected && activeCities.length >= MAX_CITIES) {
      setError(`ניתן להשוות עד ${MAX_CITIES} ערים במקביל.`);
      return;
    }

    const updated = isSelected
      ? activeCities.filter((c) => c !== city)
      : [...activeCities, city];

    setActiveCities(updated); // Instant UI update
    updateUrl(updated); // Update URL in background
    setError(null);
  };

  const removeCity = (city: string) => {
    const updated = activeCities.filter((c) => c !== city);
    setActiveCities(updated);
    updateUrl(updated);
  };

  const multiCityData = useMemo(() => {
    if (!activeCities.length || !alarmsByCity) return [];
    return activeCities.map((city) => {
      const cityAlarms = alarmsByCity[city] || [];
      return {
        city,
        alarms: cityAlarms,
        metrics: cityMetrics?.[city],
        lastSiren: lastSirenPerCity?.[city],
        summary: getCitySummary(cityAlarms, city),
      };
    });
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

  const singleCityInfo = activeCities.length === 1 ? multiCityData[0] : null;

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

      {error && (
        <div className="w-full max-w-2xl bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-3 text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">{error}</p>
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
              <Button
                onClick={() => removeCity(city)}
                key={city}
                variant={"outline"}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm group"
              >
                <span>{city}</span>

                <X className="size-3.5 group-hover:text-destructive" />
              </Button>
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
                  <CitySummary data={d.summary} city={d.city} />
                </div>
              ))}
            </div>

            <AlarmChart multiData={hourlyData} city={singleCityInfo?.city} />
            <DailyTrendChart
              multiData={dailyTrendData}
              city={singleCityInfo?.city}
              lastSiren={
                singleCityInfo
                  ? formatLastSiren(singleCityInfo.lastSiren)
                  : null
              }
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
