import { Suspense, use } from "react";
import { getDashboardData } from "@/lib/server-data";
import { ModeToggle } from "@/components/ModeToggle";
import { Navigation } from "@/components/Navigation";
import { TrendChartSkeleton } from "@/components/DashboardSkeletons";
import { CityAnalysisWrapper } from "@/components/CityAnalysisWrapper";
import { type DashboardData } from "@/lib/data";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "ניתוח לפי עיר",
  description:
    "נתונים מפורטים, התפלגות שעתית ומגמות של אזעקות עבור כל עיר ויישוב בישראל.",
};

export default function AnalysisPage() {
  const dataPromise = getDashboardData();

  return (
    <main
      className="container mx-auto px-4 py-6 md:py-10 max-w-6xl min-h-screen flex flex-col items-center gap-8 md:gap-12"
      dir="rtl"
    >
      <div className="w-full text-center flex flex-col gap-3">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
          ניתוח לפי עיר
        </h1>
        <p className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
          מידע מפורט על התפלגות אזעקות ומגמות עבור כל עיר ויישוב.
        </p>
      </div>

      <div className="w-full">
        <Navigation />

        <Suspense
          fallback={
            <div className="h-3 w-24 bg-muted mx-auto animate-pulse rounded mb-8" />
          }
        >
          <LastUpdated dataPromise={dataPromise} />
        </Suspense>

        <Suspense
          fallback={
            <div className="w-full flex flex-col items-center gap-6">
              <div className="h-10 w-full max-w-md bg-muted animate-pulse rounded-md" />
              <div className="flex flex-wrap justify-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={`btn-skeleton-${i}`}
                    className="h-8 w-20 bg-muted animate-pulse rounded-full"
                  />
                ))}
              </div>
              <div className="w-full max-w-5xl grid grid-cols-1 gap-8">
                <TrendChartSkeleton title="התפלגות שעתית" />
                <TrendChartSkeleton />
              </div>
            </div>
          }
        >
          <CityAnalysisWrapper dataPromise={dataPromise} />
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
    </main>
  );
}

function LastUpdated({ dataPromise }: { dataPromise: Promise<DashboardData> }) {
  const data = use(dataPromise);
  return (
    <div className="flex flex-col gap-1 items-center mb-8">
      <div className="text-xs font-medium text-muted-foreground uppercase text-center">
        אזעקה אחרונה: {data.lastUpdated}
      </div>
      {data.lastSync && (
        <div className="text-[10px] text-muted-foreground/60">
          סנכרון אחרון: {data.lastSync}
        </div>
      )}
    </div>
  );
}
