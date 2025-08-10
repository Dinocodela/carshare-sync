import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SummaryCards } from '@/components/analytics/SummaryCards';
import { EarningsChart } from '@/components/analytics/EarningsChart';
import { RecentTrips } from '@/components/analytics/RecentTrips';
import { ExpenseBreakdown } from '@/components/analytics/ExpenseBreakdown';
import { ClaimsSummary } from '@/components/analytics/ClaimsSummary';
import { RecentClaims } from '@/components/analytics/RecentClaims';
import { useHostAnalytics } from '@/hooks/useHostAnalytics';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

// Transform host data to match component interfaces
const transformSummaryForDisplay = (hostSummary: any) => ({
  totalEarnings: hostSummary.totalEarnings,
  totalExpenses: hostSummary.totalExpenses,
  netProfit: hostSummary.netProfit,
  totalTrips: hostSummary.totalTrips,
  activeDays: hostSummary.activeHostingDays,
  totalClaims: hostSummary.totalClaims,
  totalClaimAmount: hostSummary.totalClaimAmount,
  approvedClaimsAmount: hostSummary.approvedClaimAmount,
  pendingClaims: hostSummary.pendingClaims,
  averagePerTrip: hostSummary.averageTripEarning,
});

const transformEarningsForDisplay = (hostEarnings: any[]) => 
  hostEarnings.map(earning => ({
    ...earning,
    host_id: earning.host_id || '',
    commission: earning.commission ?? 0,
    // For host view, treat host's share as the primary/net amount
    net_amount: earning.host_profit_amount,
    gross_earnings: earning.amount,
    // Map host share into the expected fields so UI shows 30%
    client_profit_percentage: earning.host_profit_percentage ?? 30,
    host_profit_percentage: earning.host_profit_percentage ?? 30,
    client_profit_amount: earning.host_profit_amount,
  }));

const transformExpensesForDisplay = (hostExpenses: any[]) =>
  hostExpenses.map(expense => ({
    ...expense,
    host_id: expense.host_id || '',
  }));

const transformClaimsForDisplay = (hostClaims: any[]) =>
  hostClaims.map(claim => ({
    ...claim,
    host_id: claim.host_id || '',
  }));

export default function HostAnalytics() {
  const { earnings, expenses, claims, summary, loading, error, refetch } = useHostAnalytics();

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refetch();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, refetch]);

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Host Analytics Dashboard</h1>
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button onClick={refetch} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  const uiSummary = transformSummaryForDisplay(summary);
  const grossTotal = (earnings || []).reduce((acc: number, e: any) => acc + (e?.amount ?? e?.gross_earnings ?? 0), 0);
  const hostPct = grossTotal > 0 ? Math.round((uiSummary.totalEarnings / grossTotal) * 100) : 0;
  const tooltips = {
    totalEarnings: `Sum of your host share (~${hostPct}% of gross) across all trips. Gross: $${grossTotal.toFixed(2)} • Your share: $${uiSummary.totalEarnings.toFixed(2)}`,
    totalExpenses: `Sum of all expenses you’ve recorded across your vehicles. Total: $${(uiSummary.totalExpenses ?? 0).toFixed(2)}`
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Host Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track your hosting performance and profitability
            </p>
          </div>
          <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <SummaryCards summary={uiSummary} loading={loading} replaceNetProfitWithTotalExpenses tooltips={tooltips} />

        <ClaimsSummary claims={transformClaimsForDisplay(claims)} loading={loading} />

        <div className="grid gap-6 lg:grid-cols-2">
          <EarningsChart earnings={transformEarningsForDisplay(earnings)} />
          <ExpenseBreakdown expenses={transformExpensesForDisplay(expenses)} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentTrips earnings={transformEarningsForDisplay(earnings)} />
          <RecentClaims claims={transformClaimsForDisplay(claims)} />
        </div>
      </div>
    </DashboardLayout>
  );
}