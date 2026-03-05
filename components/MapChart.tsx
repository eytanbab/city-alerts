"use client";

import { useEffect, useRef, useState } from "react";
import type L from "leaflet";
import { MapData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * MapChart - Manual Leaflet Implementation
 *
 * We use vanilla Leaflet directly instead of react-leaflet components
 * to solve persistent hydration and route-transition DOM errors
 * (appendChild of undefined / Map container is being reused).
 */
export default function MapChart({ data }: { data: MapData[] }) {
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.FeatureGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mapInstance: L.Map | null = null;
    let isMounted = true;

    async function initMap() {
      const Leaflet = (await import("leaflet")).default;

      if (!isMounted || !containerRef.current) return;

      const container = containerRef.current;

      // Force cleanup of any existing leaflet state on this DOM element
      if ((container as unknown as Record<string, unknown>)._leaflet_id) {
        delete (container as unknown as Record<string, string>)._leaflet_id;
      }
      container.innerHTML = "";

      // Initialize Map
      mapInstance = Leaflet.map(container, {
        center: [31.5, 34.75],
        zoom: 8,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapInstance);

      // Initialize a dedicated group for data layers
      const dataLayers = Leaflet.featureGroup().addTo(mapInstance);
      layersRef.current = dataLayers;

      // If we unmounted while the map was being created, kill it immediately
      if (!isMounted) {
        mapInstance.remove();
        return;
      }

      mapRef.current = mapInstance;
      setIsReady(true);

      // Ensure the map recognizes its container size
      setTimeout(() => {
        if (isMounted && mapInstance) {
          mapInstance.invalidateSize();
        }
      }, 100);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstance) {
        mapInstance.remove();
        mapRef.current = null;
        layersRef.current = null;
      }
      setIsReady(false);
    };
  }, []);

  // 4. Reactive Data Updates
  useEffect(() => {
    const map = mapRef.current;
    const dataLayers = layersRef.current;
    if (!map || !dataLayers || !isReady || !data) return;

    async function updateMarkers() {
      const Leaflet = (await import("leaflet")).default;

      if (!layersRef.current) return;
      const dataLayersInstance = layersRef.current;

      // Simple: Clear the group instead of searching all map layers
      dataLayersInstance.clearLayers();

      const maxCount = Math.max(...data.map((d) => d.count), 1);

      data.forEach((item) => {
        const ratio = item.count / maxCount;
        const l = 0.85 + (0.55 - 0.85) * ratio;
        const c = 0.05 + (0.2 - 0.05) * ratio;
        const h = 240 + (25 - 240) * ratio;
        const color = `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(3)})`;

        const style: L.PathOptions = {
          fillColor: color,
          color: "white",
          weight: 0.5,
          fillOpacity: 0.7,
        };

        let layer: L.Layer;

        if (item.polygon && item.polygon.length > 0) {
          layer = Leaflet.polygon(item.polygon as L.LatLngExpression[], style);
        } else {
          layer = Leaflet.circleMarker([item.lat, item.lon], {
            ...style,
            radius: Math.max(4, (item.count / maxCount) * 20),
          });
        }

        const tooltipContent = `
          <div dir="rtl" style="text-align: right; padding: 2px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px; color: #111;">${item.city}</div>
            <div style="font-weight: 600; font-size: 12px; color: #666;">${item.count.toLocaleString()} אזעקות</div>
          </div>
        `;

        layer.bindTooltip(tooltipContent, {
          sticky: true,
          direction: "top",
          offset: [0, -5],
          className: "custom-map-tooltip",
        });

        layer.addTo(dataLayersInstance);
      });
    }

    updateMarkers();
  }, [data, isReady]);

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
      <CardContent className="p-0 flex-1 relative overflow-hidden" dir="ltr">
        <div ref={containerRef} className="w-full h-full z-0" />
        {!isReady && (
          <div className="absolute inset-0 bg-muted/5 flex items-center justify-center z-10">
            <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/40">
              טעינת מפה...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
