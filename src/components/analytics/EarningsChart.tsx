import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { ClientEarning } from '@/hooks/useClientAnalytics';
import { format, parseISO } from 'date-fns';
import { TrendingUp } from 'lucide-react';

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
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-600/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
            <TrendingUp className="h-4 w-4" />
          </div>
          Earnings Over Time
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No earnings data available yet.</p>
              <p className="text-sm mt-1">Earnings will appear here once you start hosting.</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [`$${Number(value).toFixed(2)}`, 'Earnings']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={3}
                  fill="url(#earningsGradient)"
                  dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}