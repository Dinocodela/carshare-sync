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
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card via-card to-muted/20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-sm opacity-75"></div>
            <div className="relative p-2.5 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent font-semibold">
            Earnings Over Time
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {chartData.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl"></div>
                <div className="relative p-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
                  <TrendingUp className="h-12 w-12 mx-auto opacity-60" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-medium">No earnings data available yet</p>
                <p className="text-sm opacity-75">Earnings will appear here once you start hosting cars</p>
              </div>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4}/>
                    <stop offset="50%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05}/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid 
                  strokeDasharray="2 4" 
                  stroke="hsl(var(--border))" 
                  opacity={0.4}
                  vertical={false}
                />
                <XAxis 
                  dataKey="month" 
                  fontSize={11}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickMargin={10}
                />
                <YAxis 
                  fontSize={11}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickMargin={10}
                  width={60}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    className="rounded-xl border-0 bg-background/95 backdrop-blur-sm shadow-2xl ring-1 ring-border/50"
                  />}
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
                    'Monthly Earnings'
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={3}
                  fill="url(#earningsGradient)"
                  dot={{ 
                    fill: "hsl(var(--chart-1))", 
                    strokeWidth: 2, 
                    stroke: "hsl(var(--background))",
                    r: 5,
                    filter: "url(#glow)"
                  }}
                  activeDot={{ 
                    r: 8, 
                    strokeWidth: 3, 
                    stroke: "hsl(var(--background))",
                    fill: "hsl(var(--chart-1))",
                    filter: "url(#glow)"
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}