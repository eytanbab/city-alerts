"use client";

import dynamic from "next/dynamic";
import { MapData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Dynamic import for the actual Leaflet logic.
 * We disable SSR for the internal map part to prevent 'window is not defined' errors.
 */
const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-muted/5 flex items-center justify-center z-10 animate-pulse">
      <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/40">
        טעינת מפה...
      </span>
    </div>
  ),
});

/**
 * MapChart - Shell Wrapper
 * 
 * This component renders the Card shell on the server (SSR), providing
 * an instant layout. The heavy interactive map part is then hydrated on the client.
 */
export default function MapChart({ data }: { data: MapData[] }) {
  return (
    <Card
      className="w-full h-150 border border-border shadow-none rounded-sm overflow-hidden flex flex-col"
      dir="rtl"
    >
      <CardHeader className="px-6 py-4 border-b border-border bg-muted/5">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          מפת מוקדי התרעות
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative overflow-hidden">
        <MapInner data={data} />
      </CardContent>
    </Card>
  );
}
