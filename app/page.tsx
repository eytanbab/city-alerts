'use client';

import { useState, use, useMemo, Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { fetchAlarms, getHourlyDistribution, getDailyTrend, getUniqueCities, getGlobalStats, getTopCities, getMapData, type Alarm } from '@/lib/data';
import { CitySearch } from '@/components/CitySearch';
import { AlarmChart } from '@/components/AlarmChart';
import { DailyTrendChart } from '@/components/DailyTrendChart';
import { StatCards } from '@/components/StatCards';
import { Leaderboard } from '@/components/Leaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search as SearchIcon, LayoutDashboard, MapPin } from 'lucide-react';

const MapChart = dynamic(() => import('@/components/MapChart'), { 
  ssr: false,
  loading: () => <Skeleton className="w-full h-[600px] rounded-2xl" />
});

function DashboardSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      <div className="flex justify-center">
        <Skeleton className="h-12 w-full max-w-sm rounded-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-100 w-full rounded-xl" />
        <Skeleton className="h-100 w-full rounded-xl" />
      </div>
    </div>
  );
}

const POPULAR_CITIES = ['ירושלים', 'תל אביב', 'באר שבע', 'חיפה', 'אשקלון', 'אשדוד', 'אילת'];

function Dashboard() {
  const [alarms, setAlarms] = useState<Alarm[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCity, setActiveCity] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAlarms()
      .then(setAlarms)
      .catch(err => {
        console.error(err);
        setError('נכשל בטעינת נתונים. אנא נסה שוב מאוחר יותר.');
      });
  }, []);

  const cities = useMemo(() => alarms ? getUniqueCities(alarms) : [], [alarms]);
  const stats = useMemo(() => alarms ? getGlobalStats(alarms) : null, [alarms]);
  const topCities = useMemo(() => alarms ? getTopCities(alarms) : [], [alarms]);
  const mapData = useMemo(() => alarms ? getMapData(alarms) : [], [alarms]);

  const hourlyData = useMemo(() => {
    if (!alarms || !activeCity) return [];
    return getHourlyDistribution(alarms, activeCity);
  }, [alarms, activeCity]);

  const globalDailyTrend = useMemo(() => {
    return alarms ? getDailyTrend(alarms) : [];
  }, [alarms]);

  if (error) {
    return (
      <div className="w-full py-12 text-center text-destructive bg-destructive/10 rounded-2xl border border-destructive/20">
        <p className="text-lg font-bold">{error}</p>
      </div>
    );
  }

  if (!alarms) return <DashboardSkeleton />;

  const handleCitySelect = (city: string) => {
    setActiveCity(city);
    setActiveTab('city');
  };

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* Mobile View: Continuous Scroll */}
      <div className="lg:hidden flex flex-col gap-8">
        {stats && <StatCards stats={stats} />}
        
        <section id="city-section" className="flex flex-col gap-6 pt-6 border-t border-border/40">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-xl font-bold tracking-tight">ניתוח לפי עיר</h2>
            <CitySearch cities={cities} onSearch={setActiveCity} selectedCity={activeCity} />
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => setActiveCity(city)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                    activeCity === city ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105' : 'bg-background text-muted-foreground border-input hover:bg-accent'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
          {activeCity ? (
            <AlarmChart data={hourlyData} city={activeCity} />
          ) : (
            <div className="py-12 text-center text-muted-foreground border border-dashed rounded-2xl bg-muted/5 flex flex-col items-center gap-3">
              <SearchIcon className="h-8 w-8 opacity-20" />
              <p className="text-base font-medium">חפש עיר כדי לצפות בנתונים מפורטים.</p>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4 pt-6 border-t border-border/40">
          <h2 className="text-xl font-bold tracking-tight px-1 text-right">מפת מוקדי אזעקות</h2>
          <MapChart data={mapData} />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight px-1 text-right">מגמה ארצית</h2>
          <DailyTrendChart data={globalDailyTrend} />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight px-1 text-right">הערים המטווחות ביותר</h2>
          <Leaderboard data={topCities} onSelect={(city) => {
            setActiveCity(city);
            document.getElementById('city-section')?.scrollIntoView({ behavior: 'smooth' });
          }} />
        </section>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:flex flex-col gap-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl border border-border/50">
              <TabsTrigger value="overview" className="gap-2 text-sm font-semibold rounded-lg data-[state=active]:shadow-sm">
                <LayoutDashboard className="h-4 w-4" />
                מבט כללי
              </TabsTrigger>
              <TabsTrigger value="city" className="gap-2 text-sm font-semibold rounded-lg data-[state=active]:shadow-sm">
                <MapPin className="h-4 w-4" />
                ניתוח לפי עיר
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="flex flex-col gap-8 mt-0 focus-visible:outline-none">
            {stats && <StatCards stats={stats} />}
            <MapChart data={mapData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Leaderboard data={topCities} onSelect={handleCitySelect} />
              <DailyTrendChart data={globalDailyTrend} />
            </div>
          </TabsContent>

          <TabsContent value="city" className="flex flex-col gap-8 mt-0 focus-visible:outline-none">
            <div className="w-full flex flex-col items-center gap-6">
              <div className="w-full flex flex-col items-center gap-4">
                <CitySearch cities={cities} onSearch={setActiveCity} selectedCity={activeCity} />
                <div className="flex flex-wrap justify-center gap-2">
                  {POPULAR_CITIES.map((city) => (
                    <button
                      key={city}
                      onClick={() => setActiveCity(city)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
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
                  <AlarmChart data={hourlyData} city={activeCity} />
                ) : (
                  <div className="py-24 text-center text-muted-foreground border border-dashed rounded-3xl bg-muted/5 flex flex-col items-center gap-4">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-6 md:py-10 max-w-6xl min-h-screen flex flex-col items-center gap-8 md:gap-12" dir="rtl">
      <div className="w-full text-center flex flex-col gap-3">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
          התפלגות אזעקות במבצע שאגת הארי
        </h1>
        <p className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
          ויזואליזציה של תדירות אזעקות ומגמות עם נתונים מעודכנים לכל עיר ויישוב.
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
      <footer className="text-sm text-muted-foreground text-center flex flex-col gap-3 w-full border-t border-border/40">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
          <p className="font-medium">הנתונים מתעדכנים בזמן אמת</p>
          <span className="hidden md:block opacity-30">•</span>
          <p>
            מקור: <a href="https://www.tzevaadom.co.il" className="underline underline-offset-4 hover:text-foreground transition-all font-medium" target="_blank" rel="noopener noreferrer">צבע אדום</a>
          </p>
          <span className="hidden md:block opacity-30">•</span>
          <p>
            פותח על ידי <a href="https://github.com/eytanbab" className="underline underline-offset-4 hover:text-foreground transition-all font-medium" target="_blank" rel="noopener noreferrer">eytanbab</a>
          </p>
        </div>
      </footer>

    </main>
  );
}
