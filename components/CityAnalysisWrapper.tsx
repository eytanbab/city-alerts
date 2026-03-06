"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CityAnalysisContent } from "@/components/CityAnalysisContent";
import { type DashboardData } from "@/lib/data";

interface CityAnalysisWrapperProps {
  dataPromise: Promise<DashboardData>;
}

export function CityAnalysisWrapper({ dataPromise }: CityAnalysisWrapperProps) {
  return <CityAnalysisSync dataPromise={dataPromise} />;
}

function CityAnalysisSync({ dataPromise }: CityAnalysisWrapperProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeCity = searchParams.get("city") || "";

  const setActiveCity = (city: string) => {
    const url = new URL(window.location.href);
    if (city) {
      url.searchParams.set("city", city);
    } else {
      url.searchParams.delete("city");
    }
    window.history.pushState(null, "", url.toString());
  };

  return (
    <CityAnalysisContent
      dataPromise={dataPromise}
      activeCity={activeCity}
      setActiveCity={setActiveCity}
    />
  );
}
