import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar, Car } from 'lucide-react';
import { AnalyticsSummary } from '@/hooks/useClientAnalytics';

interface SummaryCardsProps {
  summary: AnalyticsSummary;
  loading?: boolean;
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Earnings',
      value: `$${summary.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      description: 'Total profit from your vehicles'
    },
    {
      title: 'Net Profit',
      value: `$${summary.netProfit.toFixed(2)}`,
      icon: TrendingUp,
      description: 'Earnings minus expenses',
      valueClass: summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Active Days',
      value: summary.activeDays.toString(),
      icon: Calendar,
      description: 'Days with earnings activity'
    },
    {
      title: 'Total Trips',
      value: summary.totalTrips.toString(),
      icon: Car,
      description: 'Completed hosting trips'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.valueClass || ''}`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}