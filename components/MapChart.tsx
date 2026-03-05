'use client';

import { MapContainer, TileLayer, CircleMarker, Tooltip, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapData } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo, useState, useEffect } from 'react';

interface MapChartProps {
  data: MapData[];
}

export default function MapChart({ data }: MapChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const center: [number, number] = [31.5, 34.75];
  
  const maxCount = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.count), 1);
  }, [data]);

  const getColor = (count: number) => {
    const ratio = count / maxCount;
    const l = 0.85 + (0.55 - 0.85) * ratio;
    const c = 0.05 + (0.2 - 0.05) * ratio;
    const h = 240 + (25 - 240) * ratio;
    return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(3)})`;
  };

  const getStyle = (count: number) => {
    const color = getColor(count);
    return {
      fillColor: color,
      color: 'var(--border)',
      weight: 0.5,
      fillOpacity: 0.7,
    };
  };

  if (!isMounted) {
    return (
      <div className="w-full h-[600px] border border-border bg-muted/5 flex items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">טעינת מפה...</span>
      </div>
    );
  }

  return (
    <Card className="w-full h-[600px] border border-border shadow-none rounded-sm overflow-hidden flex flex-col" dir="rtl">
      <CardHeader className="px-6 py-4 border-b border-border bg-muted/5">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">מפת מוקדי התרעות</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative min-h-0" dir="ltr">
        <MapContainer 
          center={center} 
          zoom={8} 
          className="w-full h-full z-0"
          scrollWheelZoom={true}
          wheelPxPerZoomLevel={70}
          preferCanvas={true}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.map((item) => {
            if (item.polygon && item.polygon.length > 0) {
              return (
                <Polygon
                  key={item.city}
                  positions={item.polygon}
                  pathOptions={getStyle(item.count)}
                >
                  <Tooltip direction="top" offset={[0, -5]} sticky>
                    <div dir="rtl" className="text-right">
                      <div className="text-[12px] font-bold text-foreground mb-1">{item.city}</div>
                      <div className="text-[12px] font-bold text-muted-foreground tabular-nums">
                        {item.count.toLocaleString()} אזעקות
                      </div>
                    </div>
                  </Tooltip>
                </Polygon>
              );
            }
            return (
              <CircleMarker
                key={item.city}
                center={[item.lat, item.lon]}
                radius={Math.max(4, (item.count / maxCount) * 20)}
                pathOptions={getStyle(item.count)}
              >
                <Tooltip direction="top" offset={[0, -5]}>
                  <div className="bg-background border border-border p-2 shadow-lg text-right" dir="rtl">
                    <div className="text-[10px] font-black text-foreground mb-1">{item.city}</div>
                    <div className="text-[10px] font-bold text-muted-foreground tabular-nums">
                      {item.count.toLocaleString()} אזעקות
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </CardContent>
    </Card>
  );
}
