'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface LeaderboardProps {
  data: { name: string; count: number }[];
  onSelect: (city: string) => void;
}

export function Leaderboard({ data, onSelect }: LeaderboardProps) {
  return (
    <Card className="h-full flex flex-col border shadow-sm min-h-100" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-500" />
          הערים המטווחות ביותר
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          {data.map((city, index) => (
            <div 
              key={city.name} 
              className="flex items-center justify-between p-3 bg-background rounded-lg border shadow-sm group hover:border-primary/50 transition-colors cursor-pointer" 
              onClick={() => onSelect(city.name)}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {index + 1}
                </span>
                <span className="font-semibold">{city.name}</span>
              </div>
              <span className="text-sm font-mono font-medium text-muted-foreground">{city.count.toLocaleString()} אזעקות</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
