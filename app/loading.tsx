import {
  StatCardsSkeleton,
  MapSkeleton,
  LeaderboardSkeleton,
  TrendChartSkeleton,
  CitySearchSkeleton,
} from "@/components/DashboardSkeletons";

export default function Loading() {
  return (
    <div
      className="container mx-auto px-4 py-6 md:py-10 max-w-6xl min-h-screen flex flex-col items-center gap-8 md:gap-12 animate-pulse"
      dir="rtl"
    >
      <div className="w-full flex justify-end">
        <div className="h-10 w-10 bg-muted rounded-md" />
      </div>

      <div className="w-full text-center flex flex-col gap-3">
        <div className="h-12 w-3/4 max-w-2xl mx-auto bg-muted rounded-xl" />
        <div className="h-6 w-1/2 max-w-md mx-auto bg-muted rounded-lg" />
      </div>

      <div className="w-full flex flex-col gap-8 md:gap-12">
        <div className="flex justify-center">
          <CitySearchSkeleton />
        </div>

        <div className="flex flex-col gap-8">
          <StatCardsSkeleton />
          <MapSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LeaderboardSkeleton />
            <TrendChartSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
