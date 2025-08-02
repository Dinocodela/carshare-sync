import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SummaryCards } from '@/components/analytics/SummaryCards';
import { EarningsChart } from '@/components/analytics/EarningsChart';
import { RecentTrips } from '@/components/analytics/RecentTrips';
import { ExpenseBreakdown } from '@/components/analytics/ExpenseBreakdown';
import { useClientAnalytics } from '@/hooks/useClientAnalytics';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function ClientAnalytics() {
  const { earnings, expenses, summary, loading, error, refetch } = useClientAnalytics();

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track your vehicle's performance and earnings
            </p>
          </div>
          <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <SummaryCards summary={summary} loading={loading} />

        <div className="grid gap-6 lg:grid-cols-2">
          <EarningsChart earnings={earnings} />
          <ExpenseBreakdown expenses={expenses} />
        </div>

        <RecentTrips earnings={earnings} />
      </div>
    </DashboardLayout>
  );
}