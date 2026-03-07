"use client";

import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs";
import { CityAnalysisContent } from "@/components/CityAnalysisContent";
import { type DashboardData } from "@/lib/data";

interface CityAnalysisWrapperProps {
  dataPromise: Promise<DashboardData>;
}

export function CityAnalysisWrapper({ dataPromise }: CityAnalysisWrapperProps) {
  return <CityAnalysisSync dataPromise={dataPromise} />;
}

function CityAnalysisSync({ dataPromise }: CityAnalysisWrapperProps) {
  const [activeCities, setActiveCities] = useQueryState(
    "city",
    parseAsArrayOf(parseAsString).withDefault([]),
  );

  return (
    <CityAnalysisContent
      dataPromise={dataPromise}
      activeCities={activeCities}
      setActiveCities={setActiveCities}
    />
  );
}
