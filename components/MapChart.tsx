'use client';

import { useEffect, useRef, useState } from 'react';
import { MapData } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * MapChart - Manual Leaflet Implementation
 * 
 * We use vanilla Leaflet directly instead of react-leaflet components
 * to solve persistent hydration and route-transition DOM errors 
 * (appendChild of undefined / Map container is being reused).
 * 
 * This gives us 100% control over initialization and cleanup.
 */
export default function MapChart({ data }: { data: MapData[] }) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only initialize on the client
    if (typeof window === 'undefined' || !containerRef.current) return;

    let mapInstance: any = null;

    async function initMap() {
      // Dynamically import Leaflet to ensure no SSR issues
      const L = (await import('leaflet')).default;

      if (!containerRef.current) return;

      // 1. Force cleanup of the container
      const container = containerRef.current;
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }
      container.innerHTML = '';

      // 2. Initialize Map
      mapInstance = L.map(container, {
        center: [31.5, 34.75],
        zoom: 8,
        scrollWheelZoom: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapInstance);

      mapRef.current = mapInstance;
      setIsReady(true);
    }

    initMap();

    // 3. Robust Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (containerRef.current) {
        const container = containerRef.current;
        container.innerHTML = '';
        if ((container as any)._leaflet_id) {
          delete (container as any)._leaflet_id;
        }
      }
      setIsReady(false);
    };
  }, []);

  // 4. Reactive Data Updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isReady || !data) return;

    async function updateMarkers() {
      const L = (await import('leaflet')).default;
      
      // Remove previous markers/polygons
      map.eachLayer((layer: any) => {
        if (layer instanceof L.CircleMarker || layer instanceof L.Polygon) {
          map.removeLayer(layer);
        }
      });

      const maxCount = Math.max(...data.map(d => d.count), 1);

      data.forEach((item) => {
        const ratio = item.count / maxCount;
        const l = 0.85 + (0.55 - 0.85) * ratio;
        const c = 0.05 + (0.2 - 0.05) * ratio;
        const h = 240 + (25 - 240) * ratio;
        const color = `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(3)})`;

        const style = {
          fillColor: color,
          color: 'white',
          weight: 0.5,
          fillOpacity: 0.7,
        };

        let layer: any;

        if (item.polygon && item.polygon.length > 0) {
          layer = L.polygon(item.polygon as any, style);
        } else {
          layer = L.circleMarker([item.lat, item.lon], {
            ...style,
            radius: Math.max(4, (item.count / maxCount) * 20),
          });
        }

        const tooltipContent = `
          <div dir="rtl" style="text-align: right; font-family: system-ui, -apple-system, sans-serif; padding: 2px;">
            <div style="font-weight: 800; font-size: 13px; margin-bottom: 2px; color: #111;">${item.city}</div>
            <div style="font-weight: 600; font-size: 11px; color: #666;">${item.count.toLocaleString()} אזעקות</div>
          </div>
        `;

        layer.bindTooltip(tooltipContent, { 
          sticky: true, 
          direction: 'top', 
          offset: [0, -5],
          className: 'custom-map-tooltip'
        });

        layer.addTo(map);
      });
    }

    updateMarkers();
  }, [data, isReady]);

  return (
    <Card className="w-full h-[600px] border border-border shadow-none rounded-sm overflow-hidden flex flex-col" dir="rtl">
      <CardHeader className="px-6 py-4 border-b border-border bg-muted/5">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">מפת מוקדי התרעות</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative overflow-hidden" dir="ltr">
        <div ref={containerRef} className="w-full h-full z-0" />
        {!isReady && (
          <div className="absolute inset-0 bg-muted/5 flex items-center justify-center z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">טעינת מפה...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
