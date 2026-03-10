"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, LucideIcon } from "lucide-react";

interface LeaderboardProps {
  data: { name: string; count: number }[];
  onSelect: (city: string) => void;
  title?: string;
  icon?: LucideIcon;
}

export function Leaderboard({
  data,
  onSelect,
  title = "הערים המטווחות ביותר",
  icon: Icon = Trophy,
}: LeaderboardProps) {
  return (
    <Card
      className="h-full bg-card border-none shadow-sm ring-1 ring-border/50 gap-1"
      dir="rtl"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <div className="flex flex-col">
          {data.map((city, index) => (
            <button
              key={city.name}
              className="group w-full flex items-center justify-between p-3 rounded-md transition-colors hover:bg-accent text-right cursor-pointer"
              onClick={() => onSelect(city.name)}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-muted-foreground w-5">
                  {index + 1}.
                </span>
                <span className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                  {city.name}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-foreground tabular-nums">
                  {city.count.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  אזעקות
                </span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
