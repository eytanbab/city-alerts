'use client';

import { useState, use, useMemo, Suspense } from 'react';
import { fetchAlarms, getHourlyDistribution, getDailyTrend, getUniqueCities, getGlobalStats, getTopCities } from '@/lib/data';
import { CitySearch } from '@/components/CitySearch';
import { AlarmChart } from '@/components/AlarmChart';
import { DailyTrendChart } from '@/components/DailyTrendChart';
import { StatCards } from '@/components/StatCards';
import { Leaderboard } from '@/components/Leaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

const alarmsPromise = fetchAlarms();

function DashboardSkeleton() {
  return (
    <div className="w-full space-y-8" dir="rtl">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      {/* Search Input Skeleton */}
      <div className="w-full max-w-md mx-auto pt-4">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      
      <div className="space-y-8 mt-8">
        <Skeleton className="h-112.5 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-112.5 w-full rounded-xl" />
          <Skeleton className="h-112.5 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

const POPULAR_CITIES = ['ירושלים', 'תל אביב', 'באר שבע', 'חיפה', 'אילת'];

function Dashboard() {
  const alarms = use(alarmsPromise);
  const cities = useMemo(() => getUniqueCities(alarms), [alarms]);
  const stats = useMemo(() => getGlobalStats(alarms), [alarms]);
  const topCities = useMemo(() => getTopCities(alarms), [alarms]);
  const [activeCity, setActiveCity] = useState('');

  const hourlyData = useMemo(() => {
    if (!activeCity) return [];
    return getHourlyDistribution(alarms, activeCity);
  }, [alarms, activeCity]);

  const globalDailyTrend = useMemo(() => {
    return getDailyTrend(alarms);
  }, [alarms]);

  return (
    <div className="w-full flex flex-col items-center gap-12" dir="rtl">
      {stats && <StatCards stats={stats} />}
      
      <div className="w-full flex flex-col items-center space-y-6">
        <div className="w-full flex flex-col items-center space-y-4">
          <CitySearch cities={cities} onSearch={setActiveCity} selectedCity={activeCity} />
          
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setActiveCity(city)}
                className={`px-3 py-1 rounded-full text-sm border transition-all duration-200 ${
                  activeCity === city
                    ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                    : 'bg-background hover:bg-muted text-muted-foreground border-input hover:border-primary/50'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full space-y-8 pt-4">
          {/* Active City Detail Chart */}
          {activeCity ? (
            <AlarmChart data={hourlyData} city={activeCity} />
          ) : (
            <div className="py-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/5 flex flex-col items-center gap-2">
              <Search className="h-5 w-5 opacity-20" />
              <p className="text-sm">חפש עיר כדי לצפות בפירוט שעת המטחים שלה.</p>
            </div>
          )}

          {/* Global Comparison & Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Leaderboard data={topCities} onSelect={setActiveCity} />
            <DailyTrendChart data={globalDailyTrend} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl min-h-screen flex flex-col items-center" dir="rtl">
      <div className="w-full text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          התפלגות אזעקות במבצע שאגת הארי לפי עיר
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          ויזואליזציה של תדירות אזעקות שעתית לכל עיר.
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>

      <footer className="mt-auto pt-12 text-sm text-muted-foreground text-center space-y-2">
        <p>הנתונים מתעדכנים על בסיס יומי.</p>
        <p>
          הנתונים מקורם ב-<a href="https://github.com/yuval-harpaz/alarms" className="underline underline-offset-4 hover:text-foreground" target="_blank" rel="noopener noreferrer">yuval-harpaz/alarms</a>
        </p>
      </footer>
    </main>
  );
}
