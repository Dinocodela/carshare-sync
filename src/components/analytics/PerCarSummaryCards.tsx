import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar, 
  Car, 
  FileText, 
  AlertTriangle,
  Activity,
  Target
} from 'lucide-react';
import { CarPerformance } from '@/hooks/usePerCarAnalytics';

interface PerCarSummaryCardsProps {
  performance: CarPerformance;
  loading?: boolean;
}

export function PerCarSummaryCards({ performance, loading }: PerCarSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {[...Array(7)].map((_, i) => (
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
      value: `$${performance.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      description: 'Total profit from this vehicle',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Fixed Costs',
      value: `$${performance.monthlyFixedCosts.toFixed(2)}`,
      icon: TrendingDown,
      description: 'Monthly fixed expenses',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      title: 'True Net Profit',
      value: `$${performance.trueNetProfit.toFixed(2)}`,
      icon: TrendingUp,
      description: 'Profit after all costs',
      valueClass: performance.trueNetProfit >= 0 ? 'text-emerald-600' : 'text-red-600',
      gradient: performance.trueNetProfit >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-red-600'
    },
    {
      title: 'Profit Margin',
      value: `${performance.profitMargin.toFixed(1)}%`,
      icon: Target,
      description: 'Profitability percentage',
      valueClass: performance.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Days',
      value: performance.activeDays.toString(),
      icon: Calendar,
      description: 'Days with earnings activity',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Total Trips',
      value: performance.totalTrips.toString(),
      icon: Car,
      description: 'Completed hosting trips',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Avg Per Trip',
      value: `$${performance.averagePerTrip.toFixed(0)}`,
      icon: DollarSign,
      description: 'Average earnings per trip',
      gradient: 'from-teal-500 to-teal-600'
    },
    {
      title: 'Utilization',
      value: `${performance.utilizationRate.toFixed(1)}%`,
      icon: Activity,
      description: 'Usage rate (last 30 days)',
      valueClass: performance.utilizationRate >= 50 ? 'text-emerald-600' : 
                  performance.utilizationRate >= 25 ? 'text-amber-600' : 'text-red-600',
      gradient: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'Risk Score',
      value: performance.riskScore.toFixed(0),
      icon: AlertTriangle,
      description: 'Overall risk assessment',
      valueClass: performance.riskScore < 30 ? 'text-emerald-600' :
                  performance.riskScore < 60 ? 'text-amber-600' : 'text-red-600',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {cards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`p-2 rounded-full bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
              <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative">
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