"use client";

import { use } from "react";
import { type DashboardData } from "@/lib/types";

interface LastUpdatedProps {
  dataPromise: Promise<DashboardData>;
}

export function LastUpdated({ dataPromise }: LastUpdatedProps) {
  const data = use(dataPromise);
  return (
    <div className="flex flex-col gap-1 items-center">
      <span className="text-sm font-medium text-muted-foreground uppercase text-center">
        אזעקה אחרונה: {data.lastUpdated}
      </span>
      {data.lastSync && (
        <span className="text-xs text-muted-foreground/60">
          סנכרון אחרון: {data.lastSync}
        </span>
      )}
    </div>
  );
}
