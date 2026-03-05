"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CityAnalysisContent } from "@/components/CityAnalysisContent";
import { type DashboardData } from "@/lib/data";

interface CityAnalysisWrapperProps {
  dataPromise: Promise<DashboardData>;
}

export function CityAnalysisWrapper({ dataPromise }: CityAnalysisWrapperProps) {
  return (
    <Suspense>
      <CityAnalysisSync dataPromise={dataPromise} />
    </Suspense>
  );
}

function CityAnalysisSync({ dataPromise }: CityAnalysisWrapperProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeCity = searchParams.get("city") || "";

  const setActiveCity = (city: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (city) {
      params.set("city", city);
    } else {
      params.delete("city");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <CityAnalysisContent
      dataPromise={dataPromise}
      activeCity={activeCity}
      setActiveCity={setActiveCity}
    />
  );
}
