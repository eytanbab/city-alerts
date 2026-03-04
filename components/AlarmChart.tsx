'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';

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

export function AlarmChart({ data, city }: AlarmChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

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
        <CardTitle className="text-xl text-right">
          התפלגות אזעקות לפי שעה עבור "{city}"
        </CardTitle>
        <CardDescription className="text-right">
          סך הכל: {total} אזעקות
        </CardDescription>
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
    </Card>
  );
}
