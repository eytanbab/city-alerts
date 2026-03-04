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
    setIsMounted(true);
  }, []);

  // Center of Israel
  const center: [number, number] = [31.5, 34.75];
  
  // Find max count for scaling color intensity or radius fallback    
  const maxCount = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.count), 1);
  }, [data]);

  const getColor = (count: number) => {
    const ratio = count / maxCount;

    // RGB interpolation
    // Green: (34, 197, 94)  #22c55e
    // Yellow: (234, 179, 8) #eab308
    // Red: (239, 68, 68)    #ef4444

    let r, g, b;
    if (ratio < 0.5) {
      // Interpolate Green to Yellow
      const localRatio = ratio * 2;
      r = Math.floor(34 + (234 - 34) * localRatio);
      g = Math.floor(197 + (179 - 197) * localRatio);
      b = Math.floor(94 + (8 - 94) * localRatio);
    } else {
      // Interpolate Yellow to Red
      const localRatio = (ratio - 0.5) * 2;
      r = Math.floor(234 + (239 - 234) * localRatio);
      g = Math.floor(179 + (68 - 179) * localRatio);
      b = Math.floor(8 + (68 - 8) * localRatio);
    }

    return `rgb(${r}, ${g}, ${b})`;
  };

  const getStyle = (count: number) => {
    const color = getColor(count);
    return {
      fillColor: color,
      color: color,
      weight: 1.5,
      fillOpacity: 0.6,
    };
  };
  if (!isMounted) {
    return (
      <Card className="w-full h-[600px] flex flex-col overflow-hidden bg-card border-none shadow-sm ring-1 ring-border/50" dir="rtl">
        <CardHeader className="p-4 border-b border-border/50 bg-muted/20 flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-right w-full">מפת מוקדי אזעקות</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 relative min-h-0">
          <div className="w-full h-full bg-muted/20 animate-pulse flex items-center justify-center">
            <span className="text-muted-foreground font-medium">טוען מפה...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[600px] flex flex-col overflow-hidden bg-card border-none shadow-sm ring-1 ring-border/50" dir="rtl">
      <CardHeader className="p-4 border-b border-border/50 bg-muted/20 flex justify-between items-center">
        <CardTitle className="text-lg font-bold text-right w-full">מפת מוקדי אזעקות</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative min-h-0">
        <MapContainer 
          center={center} 
          zoom={8} 
          className="w-full h-full z-0"
          scrollWheelZoom={false}
          preferCanvas={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                    <div className="text-right font-sans" dir="rtl">
                      <div className="font-bold">{item.city}</div>
                      <div className="text-sm text-muted-foreground">{item.count.toLocaleString()} אזעקות</div>
                    </div>
                  </Tooltip>
                </Polygon>
              );
            }
            // Fallback to circle if no polygon data is available
            return (
              <CircleMarker
                key={item.city}
                center={[item.lat, item.lon]}
                radius={Math.max(5, (item.count / maxCount) * 20)}
                pathOptions={getStyle(item.count)}
              >
                <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                  <div className="text-right font-sans" dir="rtl">
                    <div className="font-bold">{item.city}</div>
                    <div className="text-sm text-muted-foreground">{item.count.toLocaleString()} אזעקות</div>
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
