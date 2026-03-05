'use client';

import { useMemo, use } from 'react';
import dynamic from 'next/dynamic';
import { getHourlyDistribution, getCityDailyTrend, type DashboardData } from '@/lib/data';
import { CitySearch } from '@/components/CitySearch';
import { TrendChartSkeleton } from '@/components/DashboardSkeletons';
import { Search as SearchIcon, Info } from 'lucide-react';

const AlarmChart = dynamic(() => import('@/components/AlarmChart').then(mod => mod.AlarmChart), { 
  ssr: false,
  loading: () => <TrendChartSkeleton title="התפלגות שעתית" />
});
const DailyTrendChart = dynamic(() => import('@/components/DailyTrendChart').then(mod => mod.DailyTrendChart), { 
  ssr: false,
  loading: () => <TrendChartSkeleton />
});

const POPULAR_CITIES = ['ירושלים', 'תל אביב', 'באר שבע', 'חיפה', 'אשקלון', 'אשדוד', 'אילת'];

interface CityAnalysisContentProps {
  dataPromise: Promise<DashboardData>;
  activeCity: string;
  setActiveCity: (city: string) => void;
}

export function CityAnalysisContent({ 
  dataPromise, 
  activeCity, 
  setActiveCity 
}: CityAnalysisContentProps) {
  const data = use(dataPromise);
  const { alarms, citiesList, isFallback } = data;

  const hourlyData = useMemo(() => {
    if (!alarms.length || !activeCity) return [];
    return getHourlyDistribution(alarms, activeCity);
  }, [alarms, activeCity]);

  const cityDailyTrend = useMemo(() => {
    if (!alarms.length || !activeCity) return [];
    return getCityDailyTrend(alarms, activeCity);
  }, [alarms, activeCity]);

  const lastSirenForCity = useMemo(() => {
    if (!alarms.length || !activeCity) return null;
    const cityAlarms = alarms.filter(a => a.city.includes(activeCity));
    if (cityAlarms.length === 0) return null;
    const latest = [...cityAlarms].sort((a, b) => b.datetime.localeCompare(a.datetime))[0];
    const date = new Date(latest.datetime.replace(/-/g, '/'));
    return date.toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [alarms, activeCity]);

  return (
    <div className="w-full flex flex-col items-center gap-6" dir="rtl">
      {isFallback && (
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-600 dark:text-amber-400">
          <Info className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">שימוש בנתונים שמורים: החיבור למקור הנתונים בזמן אמת נכשל.</p>
        </div>
      )}
      
      <div className="w-full flex flex-col items-center gap-4">
        <CitySearch cities={citiesList} onSearch={setActiveCity} selectedCity={activeCity} />
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
                activeCity === city ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105' : 'bg-background hover:bg-accent text-muted-foreground border-input'
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
              lastSiren={lastSirenForCity}
            />
          </div>
        ) : (
          <div className="py-24 text-center text-muted-foreground border border-dashed rounded-3xl bg-muted/5 flex flex-col items-center gap-4 w-full">
            <div className="p-4 bg-background rounded-full border shadow-sm">
              <SearchIcon className="h-10 w-10 opacity-20" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xl font-bold text-foreground">טרם נבחרה עיר</p>
              <p className="text-base font-medium">חפש עיר או בחר מהרשימה המהירה כדי לצפות בנתונים מפורטים.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
