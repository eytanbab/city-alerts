'use client';

import { useState, use, useMemo, Suspense } from 'react';
import { fetchAlarms, getHourlyDistribution, getUniqueCities, Alarm } from '@/lib/data';
import { CitySearch } from '@/components/CitySearch';
import { AlarmChart } from '@/components/AlarmChart';
import { Skeleton } from '@/components/ui/skeleton';

const alarmsPromise = fetchAlarms();

function DashboardSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto space-y-8" dir="rtl">
      <Skeleton className="h-10 w-full rounded-md" />
      <div className="mt-8 space-y-4">
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  );
}

function Dashboard() {
  const alarms = use(alarmsPromise);
  const cities = useMemo(() => getUniqueCities(alarms), [alarms]);
  const [activeCity, setActiveCity] = useState('');

  const hourlyData = useMemo(() => {
    if (!activeCity) return [];
    return getHourlyDistribution(alarms, activeCity);
  }, [alarms, activeCity]);

  return (
    <div className="w-full flex flex-col items-center" dir="rtl">
      <CitySearch cities={cities} onSearch={setActiveCity} selectedCity={activeCity} />

      {activeCity ? (
        <AlarmChart data={hourlyData} city={activeCity} />
      ) : (
        <div className="mt-12 text-center text-muted-foreground">
          <p>בחר עיר מהרשימה כדי לצפות בהתפלגות האזעקות שלה.</p>
        </div>
      )}
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
