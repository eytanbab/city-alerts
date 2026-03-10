"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { RegionTabs } from "@/components/features/overview/RegionTabs";
import { useQueryState, parseAsString } from "nuqs";
import { type DashboardData } from "@/lib/types";

interface OverviewHeaderProps {
  dataPromise: Promise<DashboardData>;
}

export function OverviewHeader({ dataPromise }: OverviewHeaderProps) {
  const [selectedRegion, setSelectedRegion] = useQueryState(
    "region",
    parseAsString.withDefault("all"),
  );

  return (
    <PageHeader dataPromise={dataPromise} currentPath="/">
      <RegionTabs value={selectedRegion} onValueChange={setSelectedRegion} />
    </PageHeader>
  );
}
