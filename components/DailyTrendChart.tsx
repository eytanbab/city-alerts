'use client';

import { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { TrendingUp, Calendar, Hash } from "lucide-react";
import { CardFooter } from '@/components/ui/card';

interface DailyTrendChartProps {
  data: { date: string; count: number }[];
  city?: string;
}

const chartConfig = {
  count: {
    label: "כמות אזעקות",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}`;
}

export function DailyTrendChart({ data, city }: DailyTrendChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  const insights = useMemo(() => {
    if (data.length === 0) return null;
    
    const maxDay = [...data].sort((a, b) => b.count - a.count)[0];
    
    return {
      peakDay: formatDate(maxDay.date),
      peakCount: maxDay.count,
      avgCount: Math.round(total / data.length)
    };
  }, [data, total]);

  if (total === 0) {
    return null;
  }

  return (
    <Card className="w-full mt-8" dir="rtl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="text-right">
            <CardTitle className="text-xl">
              מגמת אזעקות יומית כללית
            </CardTitle>
            <CardDescription>
              כמות האזעקות בכל הארץ לאורך זמן
            </CardDescription>
          </div>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <AreaChart 
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 10,
              bottom: 10
            }}
          >
            <defs>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-count)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-count)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={15}
              axisLine={false}
              tickFormatter={formatDate}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              orientation="right"
              allowDecimals={false}
              tickMargin={15}
              width={40}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-count)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#fillCount)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {insights && (
        <CardFooter className="flex flex-col gap-4 border-t pt-6 bg-muted/50 rounded-b-xl">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">יום שיא</p>
                <p className="text-sm text-muted-foreground">
                  {insights.peakDay} ({insights.peakCount} אזעקות)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border shadow-sm">
              <div className="p-2 bg-blue-500/10 rounded-full shrink-0">
                <Hash className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">ממוצע יומי</p>
                <p className="text-sm text-muted-foreground">
                  {insights.avgCount} אזעקות ליום
                </p>
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
