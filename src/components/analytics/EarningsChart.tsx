import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ClientEarning } from '@/hooks/useClientAnalytics';
import { format, parseISO } from 'date-fns';
import { TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface EarningsChartProps {
  earnings: ClientEarning[];
  selectedYear?: number | null;
}

export function EarningsChart({ earnings, selectedYear }: EarningsChartProps) {
  const isMobile = useIsMobile();
  const currentYear = new Date().getFullYear();
  const targetYear = selectedYear ?? currentYear;

  // If "All Time" (null), aggregate by year instead of month
  const isAllTime = selectedYear === null;

  if (isAllTime) {
    // Aggregate earnings by year
    const aggregatedByYear = earnings.reduce((acc, earning) => {
      const date = parseISO(earning.earning_period_start);
      const year = date.getFullYear();
      const entry = acc[year] || { paid: 0, upcoming: 0, trips: 0 };

      const amount = earning.client_profit_amount || 0;
      const status = (earning.payment_status || '').toLowerCase();

      if (status === 'paid') {
        entry.paid += amount;
      } else if (status === 'pending' || status === 'processing') {
        entry.upcoming += amount;
      } else {
        entry.paid += amount;
      }

      entry.trips += 1;
      acc[year] = entry;
      return acc;
    }, {} as Record<number, { paid: number; upcoming: number; trips: number }>);

    // Get all years from data
    const years = Object.keys(aggregatedByYear).map(Number).sort((a, b) => a - b);
    
    const chartData = years.map((year) => {
      const values = aggregatedByYear[year] || { paid: 0, upcoming: 0, trips: 0 };
      return {
        key: year.toString(),
        month: year.toString(),
        monthFull: year.toString(),
        monthInitial: year.toString().slice(-2),
        fullMonth: year.toString(),
        paid: values.paid,
        upcoming: values.upcoming,
        trips: values.trips,
      };
    });

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
              Earnings Over Time (All Years)
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
              <BarChart data={chartData} margin={{ top: 20, right: 24, left: 10, bottom: isMobile ? 36 : 18 }} barCategoryGap="25%">
                <CartesianGrid 
                  strokeDasharray="2 4" 
                  stroke="hsl(var(--border))" 
                  opacity={0.4}
                  vertical={false}
                />
                <XAxis 
                  dataKey="monthFull" 
                  interval={0}
                  fontSize={11}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickMargin={isMobile ? 16 : 12}
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
                  labelFormatter={(value) => `Year ${value}`}
                />
                <Bar dataKey="paid" stackId="a" fill="hsl(var(--chart-1))" barSize={isMobile ? 16 : 40} />
                <Bar dataKey="upcoming" stackId="a" fill="hsl(var(--chart-2))" barSize={isMobile ? 16 : 40} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    );
  }

  // Monthly view for specific year
  const aggregated = earnings.reduce((acc, earning) => {
    const date = parseISO(earning.earning_period_start);
    if (date.getFullYear() !== targetYear) return acc;

    const key = format(date, 'yyyy-MM');
    const entry = acc[key] || { paid: 0, upcoming: 0, trips: 0 };

    const amount = earning.client_profit_amount || 0;
    const status = (earning.payment_status || '').toLowerCase();

    if (status === 'paid') {
      entry.paid += amount;
    } else if (status === 'pending' || status === 'processing') {
      entry.upcoming += amount;
    } else {
      entry.paid += amount;
    }

    entry.trips += 1;
    acc[key] = entry;
    return acc;
  }, {} as Record<string, { paid: number; upcoming: number; trips: number }>);

  // Create a full set of months for the year so the X axis shows Jan-Dec
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(targetYear, i, 1);
    const key = format(d, 'yyyy-MM');
    const shortLabel = format(d, 'MMM');
    const fullLabel = format(d, 'MMMM yyyy');
    const monthFull = format(d, 'MMMM');
    const monthInitial = monthFull.charAt(0);

    const values = aggregated[key] || { paid: 0, upcoming: 0, trips: 0 };

    return {
      key,
      month: shortLabel,
      monthFull,
      monthInitial,
      fullMonth: fullLabel,
      paid: values.paid,
      upcoming: values.upcoming,
      trips: values.trips,
    };
  });

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
            Earnings Over Time ({targetYear})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {earnings.length === 0 ? (
          <div className="h-[260px] sm:h-[350px] flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl"></div>
                <div className="relative p-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
                  <TrendingUp className="h-12 w-12 mx-auto opacity-60" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-medium">No earnings data available for {targetYear}</p>
                <p className="text-sm opacity-75">Try selecting a different year or check back later</p>
              </div>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] sm:h-[350px]">
            <BarChart data={chartData} margin={{ top: 20, right: 24, left: 10, bottom: isMobile ? 36 : 18 }} barCategoryGap={isMobile ? '40%' : '25%'}>
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="hsl(var(--border))" 
                opacity={0.4}
                vertical={false}
              />
              <XAxis 
                dataKey={isMobile ? 'monthInitial' : 'monthFull'} 
                interval={0}
                fontSize={11}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickMargin={isMobile ? 16 : 12}
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
                labelFormatter={(value, payload) => payload?.[0]?.payload?.fullMonth ?? String(value)}
              />
              <Bar dataKey="paid" stackId="a" fill="hsl(var(--chart-1))" barSize={isMobile ? 8 : 14} />
              <Bar dataKey="upcoming" stackId="a" fill="hsl(var(--chart-2))" barSize={isMobile ? 8 : 14} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
