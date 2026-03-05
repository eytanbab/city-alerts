'use client';

import { useState, useMemo, use, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getHourlyDistribution, getCityDailyTrend, type DashboardData } from '@/lib/data';
import { CitySearch } from '@/components/CitySearch';
// Dynamically import charts to reduce initial bundle size
const AlarmChart = dynamic(() => import('@/components/AlarmChart').then(mod => mod.AlarmChart), { 
  ssr: false,
  loading: () => <TrendChartSkeleton title="התפלגות שעתית" />
});
const DailyTrendChart = dynamic(() => import('@/components/DailyTrendChart').then(mod => mod.DailyTrendChart), { 
  ssr: false,
  loading: () => <TrendChartSkeleton />
});

import { StatCards } from '@/components/StatCards';
import { Leaderboard } from '@/components/Leaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Direct ESM imports for Lucide icons
import { 
  Search as SearchIcon, 
  LayoutDashboard, 
  MapPin, 
  Map as MapIcon, 
  Info, 
  AlertTriangle, 
  Trophy, 
  TrendingUp, 
  Zap 
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';

const MapChart = dynamic(() => import('@/components/MapChart'), { 
  ssr: false,
  loading: () => <MapSkeleton />
});

function MapSkeleton() {
  return (
    <Card className="w-full h-[600px] border border-border shadow-none rounded-sm overflow-hidden flex flex-col" dir="rtl">
      <CardHeader className="px-6 py-4 border-b border-border bg-muted/5">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">מפת מוקדי התרעות</CardTitle>
      </CardHeader>
      <div className="flex-1 bg-muted/10 animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <MapIcon className="h-10 w-10 text-muted-foreground/20" />
          <span className="text-sm text-muted-foreground/40 font-medium">טוען מפה...</span>
        </div>
      </div>
    </Card>
  );
}

function StatCardsSkeleton() {
  const staticLabels = ["סה\"כ אזעקות", "העיר המטווחת", "ימי פעילות", "יישובים בטווח"];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border" dir="rtl">
      {staticLabels.map((label, i) => (
        <div key={`stat-skeleton-${label}`} className="bg-background p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {label}
            </span>
            <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground/10" />
          </div>
          <div className="flex flex-col gap-1 animate-pulse">
            <div className="h-10 w-24 bg-muted rounded-none" />
            <div className="h-3 w-32 bg-muted/20 rounded-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <Card className="h-full bg-card border-none shadow-sm ring-1 ring-border/50" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Trophy className="h-4 w-4 text-muted-foreground" />
          הערים המטווחות ביותר
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <div className="flex flex-col gap-1 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={`leaderboard-item-skeleton-${i}`} className="w-full flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
              <div className="h-4 w-12 bg-muted rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TrendChartSkeleton({ title = "מגמת אזעקות יומית" }: { title?: string }) {
  return (
    <Card className="h-full bg-card border-none shadow-sm ring-1 ring-border/50" dir="rtl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <div className="h-3 w-48 bg-muted/50 animate-pulse rounded mt-1" />
      </CardHeader>
      <CardContent className="pb-4 px-2">
        <div className="h-60 w-full bg-muted/5 animate-pulse rounded-md border border-dashed border-border/50 flex items-center justify-center">
           <div className="h-32 w-3/4 bg-muted/10 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="flex flex-col gap-1 animate-pulse">
          <div className="h-2 w-12 bg-muted/50 rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
        <div className="flex flex-col gap-1 animate-pulse">
          <div className="h-2 w-12 bg-muted/50 rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
      </CardFooter>
    </Card>
  );
}

const POPULAR_CITIES = ['ירושלים', 'תל אביב', 'באר שבע', 'חיפה', 'אשקלון', 'אשדוד', 'אילת'];

interface DashboardClientProps {
  dataPromise: Promise<DashboardData>;
}

export function DashboardClient({ dataPromise }: DashboardClientProps) {
  const [activeCity, setActiveCity] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* Mobile View: Continuous Scroll */}
      <div className="lg:hidden flex flex-col gap-8">
        <Suspense fallback={
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <StatCardsSkeleton />
              <div className="h-3 w-24 bg-muted animate-pulse rounded mx-auto mt-2" />
            </div>
            
            <section className="flex flex-col gap-6 pt-6 border-t border-border/40">
              <div className="flex flex-col items-center gap-4">
                <h2 className="text-xl font-bold tracking-tight">ניתוח לפי עיר</h2>
                <div className="h-10 w-full max-w-md bg-muted animate-pulse rounded-md" />
                <div className="flex flex-wrap justify-center gap-2">
                  {POPULAR_CITIES.map((city) => (
                    <div key={`popular-city-skeleton-${city}`} className="h-8 w-20 bg-muted animate-pulse rounded-full" />
                  ))}
                </div>
              </div>
              <div className="py-12 border border-dashed rounded-2xl bg-muted/5 flex flex-col items-center gap-3">
                <SearchIcon className="h-8 w-8 text-muted-foreground/10" />
                <p className="text-base font-medium text-muted-foreground/20">חפש עיר כדי לצפות בנתונים מפורטים.</p>
              </div>
            </section>

            <section className="flex flex-col gap-4 pt-6 border-t border-border/40">
              <h2 className="text-xl font-bold tracking-tight px-1 text-right">מפת מוקדי אזעקות</h2>
              <MapSkeleton />
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-bold tracking-tight px-1 text-right">מגמה ארצית</h2>
              <TrendChartSkeleton />
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-bold tracking-tight px-1 text-right">הערים המטווחות ביותר</h2>
              <LeaderboardSkeleton />
            </section>
          </div>
        }>
          <MobileDataContent 
            dataPromise={dataPromise} 
            activeCity={activeCity} 
            setActiveCity={setActiveCity} 
          />
        </Suspense>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:flex flex-col gap-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <TabsList className="grid w-full max-md max-w-md grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl border border-border/50">
                <TabsTrigger value="overview" className="gap-2 text-sm font-semibold rounded-lg data-[state=active]:shadow-sm cursor-pointer">
                  <LayoutDashboard className="h-4 w-4" />
                  מבט כללי
                </TabsTrigger>
                <TabsTrigger value="city" className="gap-2 text-sm font-semibold rounded-lg data-[state=active]:shadow-sm cursor-pointer">
                  <MapPin className="h-4 w-4" />
                  ניתוח לפי עיר
                </TabsTrigger>
              </TabsList>
            </div>
            <Suspense fallback={<div className="h-3 w-24 bg-muted mx-auto animate-pulse rounded" />}>
              <LastUpdatedText dataPromise={dataPromise} />
            </Suspense>
          </div>

          <TabsContent value="overview" className="flex flex-col gap-8 mt-0 focus-visible:outline-none">
            <Suspense fallback={
              <div className="flex flex-col gap-8">
                <StatCardsSkeleton />
                <MapSkeleton />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <LeaderboardSkeleton />
                  <TrendChartSkeleton />
                </div>
              </div>
            }>
              <OverviewContent dataPromise={dataPromise} onCitySelect={(city) => {
                setActiveCity(city);
                setActiveTab('city');
              }} />
            </Suspense>
          </TabsContent>

          <TabsContent value="city" className="flex flex-col gap-8 mt-0 focus-visible:outline-none">
            <Suspense fallback={
              <div className="w-full flex flex-col items-center gap-6">
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="h-10 w-full max-w-md bg-muted animate-pulse rounded-md" />
                  <div className="flex flex-wrap justify-center gap-2">
                    {POPULAR_CITIES.map((city) => (
                      <div key={`desktop-popular-city-skeleton-${city}`} className="h-8 w-20 bg-muted animate-pulse rounded-full" />
                    ))}
                  </div>
                </div>
                <div className="w-full max-w-5xl grid grid-cols-1 gap-8">
                   <TrendChartSkeleton title="התפלגות שעתית" />
                   <TrendChartSkeleton />
                </div>
              </div>
            }>
              <CityAnalysisContent 
                dataPromise={dataPromise} 
                activeCity={activeCity} 
                setActiveCity={setActiveCity} 
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LastUpdatedText({ dataPromise }: { dataPromise: Promise<DashboardData> }) {
  const data = use(dataPromise);
  return (
    <div className="text-xs font-medium text-muted-foreground uppercase text-center">
      עדכון אחרון: {data.lastUpdated}
    </div>
  );
}

function OverviewContent({ dataPromise, onCitySelect }: { dataPromise: Promise<DashboardData>, onCitySelect: (city: string) => void }) {
  const data = use(dataPromise);
  const { stats, mapData, topCities, globalDailyTrend, isFallback } = data;

  return (
    <div className="flex flex-col gap-8">
      {isFallback && (
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-600 dark:text-amber-400">
          <Info className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">שימוש בנתונים שמורים: החיבור למקור הנתונים בזמן אמת נכשל. המידע המוצג עשוי להיות לא מעודכן.</p>
        </div>
      )}
      {stats && <StatCards stats={stats} />}
      <MapChart data={mapData} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Leaderboard data={topCities} onSelect={onCitySelect} />
        <DailyTrendChart data={globalDailyTrend} title="מגמת אזעקות יומית (ארצי)" description="כמות האזעקות בכל הארץ לאורך זמן" />
      </div>
    </div>
  );
}

function CityAnalysisContent({ 
  dataPromise, 
  activeCity, 
  setActiveCity 
}: { 
  dataPromise: Promise<DashboardData>, 
  activeCity: string, 
  setActiveCity: (city: string) => void 
}) {
  const data = use(dataPromise);
  const { alarms, citiesList } = data;

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
    <div className="w-full flex flex-col items-center gap-6">
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
  );
}

function MobileDataContent({ 
  dataPromise, 
  activeCity, 
  setActiveCity 
}: { 
  dataPromise: Promise<DashboardData>, 
  activeCity: string, 
  setActiveCity: (city: string) => void 
}) {
  const data = use(dataPromise);
  const { stats, citiesList, alarms, mapData, globalDailyTrend, topCities, lastUpdated, isFallback } = data;

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
    <div className="flex flex-col gap-8">
      {isFallback && (
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-600 dark:text-amber-400">
          <Info className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">שימוש בנתונים שמורים: החיבור למקור הנתונים בזמן אמת נכשל.</p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {stats && <StatCards stats={stats} />}
        <div className="text-xs font-medium text-muted-foreground uppercase text-center">
          עדכון אחרון: {lastUpdated}
        </div>
      </div>
      
      <section id="city-section" className="flex flex-col gap-6 pt-6 border-t border-border/40">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-xl font-bold tracking-tight">ניתוח לפי עיר</h2>
          <CitySearch cities={citiesList} onSearch={setActiveCity} selectedCity={activeCity} />
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
            <DailyTrendChart 
              data={cityDailyTrend} 
              title={`מגמת אזעקות: ${activeCity}`} 
              description="כמות האזעקות בעיר לאורך זמן" 
              lastSiren={lastSirenForCity}
            />
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
  );
}
