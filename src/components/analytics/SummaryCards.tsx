import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar, Car, FileText, AlertTriangle, Info, Receipt } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AnalyticsSummary } from '@/hooks/useClientAnalytics';
interface SummaryCardsProps {
  summary: AnalyticsSummary & { totalExpenses?: number };
  loading?: boolean;
  hideNetProfit?: boolean;
  replaceNetProfitWithTotalExpenses?: boolean;
  tooltips?: {
    totalEarnings?: string;
    netProfit?: string;
    totalExpenses?: string;
  };
}

export function SummaryCards({ summary, loading, hideNetProfit, replaceNetProfitWithTotalExpenses, tooltips }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(hideNetProfit ? 5 : 6)].map((_, i) => (
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
      description: 'Total profit from your vehicles',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Net Profit',
      value: `$${summary.netProfit.toFixed(2)}`,
      icon: TrendingUp,
      description: 'Earnings minus expenses',
      valueClass: summary.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600',
      gradient: summary.netProfit >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-red-600'
    },
    {
      title: 'Active Days',
      value: summary.activeDays.toString(),
      icon: Calendar,
      description: 'Days with earnings activity',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Trips',
      value: summary.totalTrips.toString(),
      icon: Car,
      description: 'Completed hosting trips',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Total Claims',
      value: summary.totalClaims.toString(),
      icon: FileText,
      description: 'Insurance claims submitted',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Pending Claims',
      value: summary.pendingClaims.toString(),
      icon: AlertTriangle,
      description: 'Claims awaiting approval',
      gradient: 'from-amber-500 to-yellow-600'
    }
  ];

  // Replace Net Profit with Total Expenses if requested
  let displayCards = cards;
  if (replaceNetProfitWithTotalExpenses) {
    displayCards = cards.map((c) =>
      c.title === 'Net Profit'
        ? {
            title: 'Total Expenses',
            value: `$${(summary.totalExpenses ?? 0).toFixed(2)}`,
            icon: Receipt,
            description: 'All recorded expenses',
            valueClass: 'text-red-600',
            gradient: 'from-red-500 to-red-600',
          }
        : c
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {(hideNetProfit ? displayCards.filter((c) => c.title !== 'Net Profit') : displayCards).map((card, index) => {
        const tooltipText = card.title === 'Total Earnings'
          ? tooltips?.totalEarnings
          : card.title === 'Net Profit'
          ? tooltips?.netProfit
          : card.title === 'Total Expenses'
          ? tooltips?.totalExpenses
          : undefined;

        return (
          <Card key={index} className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                {tooltipText && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label={`Info about ${card.title}`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        {tooltipText}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className={`p-1.5 sm:p-2 rounded-full bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className={`text-xl md:text-2xl font-bold ${card.valueClass || ''}`}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}