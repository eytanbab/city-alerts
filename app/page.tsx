import { Suspense } from "react";
import { getDashboardData } from "@/lib/services/dashboard";
import { OverviewContent } from "@/components/features/overview/OverviewContent";
import { Navigation } from "@/components/layout/Navigation";
import { LastUpdated } from "@/components/features/overview/LastUpdated";
import {
  StatCardsSkeleton,
  MapSkeleton,
  LeaderboardSkeleton,
  TrendChartSkeleton,
  LastUpdatedSkeleton,
  RegionSelectSkeleton,
} from "@/components/ui/dashboard-skeletons";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "סקירה כללית - מבצע שאגת הארי",
  description:
    "מבט על התפלגות האזעקות, מפת התרעות ומובילי האזעקות במבצע שאגת הארי.",
};

export default function Home() {
  const dataPromise = getDashboardData();

  return (
    <>
      <div className="w-full text-center flex flex-col gap-3">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
          התפלגות אזעקות במבצע שאגת הארי
        </h1>
        <p className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
          ויזואליזציה של תדירות אזעקות ומגמות עם נתונים מעודכנים לכל עיר ויישוב.
        </p>
      </div>

      <div className="w-full">
        <Navigation currentPath="/" />

        <Suspense fallback={<LastUpdatedSkeleton />}>
          <LastUpdated dataPromise={dataPromise} />
        </Suspense>

        <Suspense
          fallback={
            <div className="flex flex-col gap-8">
              <RegionSelectSkeleton />
              <StatCardsSkeleton />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <LeaderboardSkeleton />
                <TrendChartSkeleton />
              </div>
              <MapSkeleton />
            </div>
          }
        >
          <OverviewContent dataPromise={dataPromise} />
        </Suspense>
      </div>

      <footer className="text-sm text-muted-foreground text-center flex flex-col gap-3 w-full border-t border-border/40 mt-auto pt-8">
        <div className="flex flex-col md:flex-row items-center justify-center p-4 gap-2 md:gap-6">
          <p className="font-medium">הנתונים מתעדכנים בזמן אמת</p>
          <span className="hidden md:block opacity-30">•</span>
          <p>
            מקור:{" "}
            <a
              href="https://www.tzevaadom.co.il"
              className="underline underline-offset-4 hover:text-foreground transition-all font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              צבע אדום
            </a>
          </p>
          <span className="hidden md:block opacity-30">•</span>
          <p>
            פותח על ידי{" "}
            <a
              href="https://github.com/eytanbab"
              className="underline underline-offset-4 hover:text-foreground transition-all font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              eytanbab
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
