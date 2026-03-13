"use client";

import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs";
import { CityAnalysisContent } from "@/components/features/analysis/CityAnalysisContent";
import { type DashboardData } from "@/lib/types";

interface CityAnalysisWrapperProps {
  dataPromise: Promise<DashboardData>;
  initialCities?: string[];
}

export function CityAnalysisWrapper({
  dataPromise,
  initialCities = [],
}: CityAnalysisWrapperProps) {
  return (
    <CityAnalysisSync
      dataPromise={dataPromise}
      initialCities={initialCities}
    />
  );
}

function CityAnalysisSync({
  dataPromise,
  initialCities,
}: CityAnalysisWrapperProps) {
  const [selectedCities, setSelectedCities] = useQueryState(
    "city",
    parseAsArrayOf(parseAsString).withDefault(initialCities || []),
  );

  return (
    <CityAnalysisContent
      dataPromise={dataPromise}
      activeCities={selectedCities}
      setActiveCities={setSelectedCities}
    />
  );
}
