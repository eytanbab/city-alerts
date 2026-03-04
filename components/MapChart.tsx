'use client';

import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
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
  
  // Find max count for scaling radius
  const maxCount = useMemo(() => Math.max(...data.map(d => d.count), 1), [data]);

  if (!isMounted) {
    return (
      <Card className="w-full h-[600px] flex flex-col overflow-hidden bg-card border-none shadow-sm ring-1 ring-border/50">
        <CardContent className="p-0 flex-1 relative min-h-0">
          <div className="w-full h-full bg-muted/20 animate-pulse flex items-center justify-center">
            <span className="text-muted-foreground font-medium">טוען מפה...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[600px] flex flex-col overflow-hidden bg-card border-none shadow-sm ring-1 ring-border/50">
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
          {data.map((item) => (
            <CircleMarker
              key={item.city}
              center={[item.lat, item.lon]}
              radius={Math.max(5, (item.count / maxCount) * 25)}
              pathOptions={{
                fillColor: '#ef4444',
                color: '#b91c1c',
                weight: 1,
                fillOpacity: 0.6,
              }}
            >
              <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                <div className="text-right font-sans" dir="rtl">
                  <div className="font-bold">{item.city}</div>
                  <div className="text-sm text-muted-foreground">{item.count.toLocaleString()} אזעקות</div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </CardContent>
    </Card>
  );
}
