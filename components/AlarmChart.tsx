'use client';

import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { AlertCircle, Zap, Moon } from "lucide-react";

interface AlarmChartProps {
  data: { hour: string; count: number }[];
  city: string;
}

const chartConfig = {
  count: {
    label: "כמות אזעקות",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function formatHourRanges(hours: string[]) {
  if (hours.length === 0) return "";
  
  // Convert "HH:00" to integers for sorting and calculation
  const hourNums = hours
    .map(h => parseInt(h.split(':')[0], 10))
    .sort((a, b) => a - b);
    
  const ranges: string[] = [];
  let start = hourNums[0];
  let end = hourNums[0];
  
  for (let i = 1; i <= hourNums.length; i++) {
    if (i < hourNums.length && hourNums[i] === end + 1) {
      end = hourNums[i];
    } else {
      const nextHour = (end + 1).toString().padStart(2, '0');
      ranges.push(`${start.toString().padStart(2, '0')}:00-${nextHour}:00`);
      
      if (i < hourNums.length) {
        start = hourNums[i];
        end = hourNums[i];
      }
    }
  }
  
  return ranges.join(', ');
}

export function AlarmChart({ data, city }: AlarmChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  const insights = useMemo(() => {
    if (total === 0) return null;

    const maxCount = Math.max(...data.map(d => d.count));
    const peakHours = data.filter(d => d.count === maxCount).map(d => d.hour);
    
    const minCount = Math.min(...data.map(d => d.count));
    const silentHours = data.filter(d => d.count === minCount).map(d => d.hour);

    return {
      peakHoursFormatted: formatHourRanges(peakHours),
      silentHoursFormatted: formatHourRanges(silentHours),
      maxCount,
      minCount
    };
  }, [data, total]);

  if (total === 0) {
    return (
      <Card className="w-full mt-8" dir="rtl">
        <CardContent className="pt-10 pb-10 text-center text-muted-foreground">
          לא נמצאו נתוני אזעקות עבור "{city}" החל מה-27 בפברואר.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mt-8" dir="rtl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="text-right">
            <CardTitle className="text-xl">
              התפלגות אזעקות לפי שעה עבור "{city}"
            </CardTitle>
            <CardDescription>
              סך הכל: {total} אזעקות
            </CardDescription>
          </div>
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              orientation="right"
              allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {insights && (
        <CardFooter className="flex flex-col gap-4 border-t pt-6 bg-muted/50 rounded-b-xl">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border shadow-sm">
              <div className="p-2 bg-primary/10 rounded-full shrink-0">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">שעות שיא (הכי הרבה אזעקות)</p>
                <p className="text-sm text-muted-foreground">
                  {insights.peakHoursFormatted} ({insights.maxCount} לשעה)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border shadow-sm">
              <div className="p-2 bg-blue-500/10 rounded-full shrink-0">
                <Moon className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">שעות שקטות (הכי פחות אזעקות)</p>
                <p className="text-sm text-muted-foreground">
                  {insights.silentHoursFormatted} ({insights.minCount} לשעה)
                </p>
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
