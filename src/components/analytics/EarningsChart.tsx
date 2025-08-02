import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ClientEarning } from '@/hooks/useClientAnalytics';
import { format, parseISO } from 'date-fns';

interface EarningsChartProps {
  earnings: ClientEarning[];
}

export function EarningsChart({ earnings }: EarningsChartProps) {
  // Group earnings by month
  const monthlyData = earnings.reduce((acc, earning) => {
    const date = parseISO(earning.earning_period_start);
    const monthKey = format(date, 'yyyy-MM');
    const monthLabel = format(date, 'MMM yyyy');
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthLabel,
        earnings: 0,
        trips: 0
      };
    }
    
    acc[monthKey].earnings += earning.client_profit_amount || 0;
    acc[monthKey].trips += 1;
    
    return acc;
  }, {} as Record<string, { month: string; earnings: number; trips: number }>);

  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  const chartConfig = {
    earnings: {
      label: 'Earnings',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="month" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value) => [`$${value}`, 'Earnings']}
              />
              <Line 
                type="monotone" 
                dataKey="earnings" 
                stroke="var(--color-earnings)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-earnings)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}