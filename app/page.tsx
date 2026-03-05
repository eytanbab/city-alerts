'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { fetchDashboardData, getHourlyDistribution, getCityDailyTrend, type DashboardData } from '@/lib/data';
import { CitySearch } from '@/components/CitySearch';
import { AlarmChart } from '@/components/AlarmChart';
import { DailyTrendChart } from '@/components/DailyTrendChart';
import { StatCards } from '@/components/StatCards';
import { Leaderboard } from '@/components/Leaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search as SearchIcon, LayoutDashboard, MapPin, Map as MapIcon, Info } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';

const MapChart = dynamic(() => import('@/components/MapChart'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl bg-card border border-border/50 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border/50 bg-muted/20">
        <div className="h-6 w-32 bg-muted animate-pulse rounded-md" />
      </div>
      <div className="flex-1 bg-muted/10 animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <MapIcon className="h-10 w-10 text-muted-foreground/20" />
          <span className="text-sm text-muted-foreground/40 font-medium">טוען מפה...</span>
        </div>
      </div>
    </div>
  )
});

function DashboardSkeleton() {
  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 animate-pulse" dir="rtl">
      {/* Tabs Skeleton - Desktop Only */}
      <div className="hidden lg:flex justify-center">
        <div className="h-12 w-full max-w-md bg-muted/50 rounded-xl border border-border/50" />
      </div>

      <div className="flex flex-col gap-8 md:gap-12">
        {/* StatCards Skeleton: grid-px matches the approve sharp design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-background h-32 md:h-44 p-6 md:p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-muted rounded-none" />
                <div className="h-4 w-4 bg-muted/20 rounded-none" />
              </div>
              <div className="flex flex-col gap-2 mt-auto">
                <div className="h-8 w-24 bg-muted rounded-none" />
                <div className="h-3 w-32 bg-muted/20 rounded-none" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Map Skeleton */}
        <div className="w-full h-[600px] bg-muted/5 border border-border flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <MapIcon className="h-6 w-6 text-muted-foreground/20" />
            <div className="h-3 w-24 bg-muted/20 rounded-none" />
          </div>
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="h-[400px] border border-border bg-background" />
          <div className="h-[400px] border border-border bg-background" />
        </div>
      </div>
    </div>
  );
}

const POPULAR_CITIES = ['ירושלים', 'תל אביב', 'באר שבע', 'חיפה', 'אשקלון', 'אשדוד', 'אילת'];

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCity, setActiveCity] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch(err => {
        console.error(err);
        setError('נכשל בטעינת נתונים. אנא נסה שוב מאוחר יותר.');      
      });
  }, []);

  const alarms = useMemo(() => data?.alarms || [], [data]);
  const cities = useMemo(() => data?.citiesList || [], [data]);
  const stats = useMemo(() => data?.stats || null, [data]);
  const topCities = useMemo(() => data?.topCities || [], [data]);
  const mapData = useMemo(() => data?.mapData || [], [data]);
  const globalDailyTrend = useMemo(() => data?.globalDailyTrend || [], [data]);

  const hourlyData = useMemo(() => {
    if (!alarms.length || !activeCity) return [];
    return getHourlyDistribution(alarms, activeCity);
  }, [alarms, activeCity]);

  const cityDailyTrend = useMemo(() => {
    if (!alarms.length || !activeCity) return [];
    return getCityDailyTrend(alarms, activeCity);
  }, [alarms, activeCity]);

  if (error) {
    return (
      <div className="w-full py-12 text-center text-destructive bg-destructive/10 rounded-2xl border border-destructive/20">
        <p className="text-lg font-bold">{error}</p>
      </div>
    );
  }

  if (!data) return <DashboardSkeleton />;

  const handleCitySelect = (city: string) => {
    setActiveCity(city);
    setActiveTab('city');
  };

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {data.isFallback && (
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-600 dark:text-amber-400">
          <Info className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">שימוש בנתונים שמורים: החיבור למקור הנתונים בזמן אמת נכשל. המידע המוצג עשוי להיות לא מעודכן.</p>
        </div>
      )}

      {/* Mobile View: Continuous Scroll */}
      <div className="lg:hidden flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          {stats && <StatCards stats={stats} />}
          <div className="text-[10px] font-bold text-muted-foreground uppercase text-center">
            עדכון אחרון: {data.lastUpdated}
          </div>
        </div>
        
        <section id="city-section" className="flex flex-col gap-6 pt-6 border-t border-border/40">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-xl font-bold tracking-tight">ניתוח לפי עיר</h2>
            <CitySearch cities={cities} onSearch={setActiveCity} selectedCity={activeCity} />
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => setActiveCity(city)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
                    activeCity === city ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105' : 'bg-background text-muted-foreground border-input hover:bg-accent'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
          {activeCity ? (
            <div className="flex flex-col gap-6">
              <AlarmChart data={hourlyData} city={activeCity} />
              <DailyTrendChart data={cityDailyTrend} title={`מגמת אזעקות: ${activeCity}`} description="כמות האזעקות בעיר לאורך זמן" />
            </div>
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
          <DailyTrendChart data={globalDailyTrend} title="מגמת אזעקות יומית (ארצי)" description="כמות האזעקות בכל הארץ לאורך זמן" />
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
          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <TabsList className="grid w-full max-md max-w-md grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl border border-border/50">
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
            <div className="text-[10px] font-bold text-muted-foreground uppercase text-center">
              עדכון אחרון: {data.lastUpdated}
            </div>
          </div>

          <TabsContent value="overview" className="flex flex-col gap-8 mt-0 focus-visible:outline-none">
            {stats && <StatCards stats={stats} />}
            <MapChart data={mapData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Leaderboard data={topCities} onSelect={handleCitySelect} />
              <DailyTrendChart data={globalDailyTrend} title="מגמת אזעקות יומית (ארצי)" description="כמות האזעקות בכל הארץ לאורך זמן" />
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
                    <DailyTrendChart data={cityDailyTrend} title={`מגמת אזעקות: ${activeCity}`} description="כמות האזעקות בעיר לאורך זמן" />
                  </div>
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
      <div className="w-full flex justify-end">
        <ModeToggle />
      </div>
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
