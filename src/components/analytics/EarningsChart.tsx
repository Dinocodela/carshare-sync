import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ClientEarning } from '@/hooks/useClientAnalytics';
import { format, parseISO } from 'date-fns';
import { TrendingUp } from 'lucide-react';

interface EarningsChartProps {
  earnings: ClientEarning[];
}

export function EarningsChart({ earnings }: EarningsChartProps) {
  // Group earnings by month, splitting Paid vs Upcoming (pending/processing)
  const monthlyData = earnings.reduce((acc, earning) => {
    const date = parseISO(earning.earning_period_start);
    const key = format(date, 'yyyy-MM');
    const label = format(date, 'MMM yyyy');

    if (!acc[key]) {
      acc[key] = { key, month: label, paid: 0, upcoming: 0, trips: 0 };
    }

    const amount = earning.client_profit_amount || 0;
    const status = (earning.payment_status || '').toLowerCase();

    if (status === 'paid') {
      acc[key].paid += amount;
    } else if (status === 'pending' || status === 'processing') {
      acc[key].upcoming += amount;
    } else {
      // Fallback: treat unknown statuses as paid
      acc[key].paid += amount;
    }

    acc[key].trips += 1;
    return acc;
  }, {} as Record<string, { key: string; month: string; paid: number; upcoming: number; trips: number }>);

  const chartData = Object.values(monthlyData).sort((a, b) => a.key.localeCompare(b.key));

  const chartConfig = {
    paid: {
      label: 'Paid',
      color: 'hsl(var(--chart-1))',
    },
    upcoming: {
      label: 'Upcoming',
      color: 'hsl(var(--chart-2))',
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
          <div className="h-[260px] sm:h-[350px] flex items-center justify-center text-muted-foreground">
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
          <ChartContainer config={chartConfig} className="h-[260px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 16, left: 8, bottom: 12 }}>
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
                    name === 'paid' ? 'Paid' : 'Upcoming'
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="paid" stackId="a" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="upcoming" stackId="a" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}