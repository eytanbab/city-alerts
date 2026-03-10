"use client";

import { Suspense } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { LastUpdated } from "@/components/features/overview/LastUpdated";
import { LastUpdatedSkeleton } from "@/components/ui/dashboard-skeletons";
import { type DashboardData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  dataPromise: Promise<DashboardData>;
  currentPath: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  dataPromise,
  currentPath,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-50 bg-background/80 backdrop-blur-md -mx-4 px-4 pt-4 pb-6 border-b border-border/5 mb-8",
        className,
      )}
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        <Navigation currentPath={currentPath} />

        <div className="flex flex-col items-center gap-4">
          <Suspense fallback={<LastUpdatedSkeleton />}>
            <LastUpdated dataPromise={dataPromise} />
          </Suspense>

          {children}
        </div>
      </div>
    </div>
  );
}
