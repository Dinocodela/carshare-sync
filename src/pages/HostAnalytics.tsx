import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SummaryCards } from "@/components/analytics/SummaryCards";
import { EarningsChart } from "@/components/analytics/EarningsChart";
import { RecentTrips } from "@/components/analytics/RecentTrips";
import { ExpenseBreakdown } from "@/components/analytics/ExpenseBreakdown";
import { ClaimsSummary } from "@/components/analytics/ClaimsSummary";
import { RecentClaims } from "@/components/analytics/RecentClaims";
import { useHostAnalytics } from "@/hooks/useHostAnalytics";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, RefreshCw, Calendar } from "lucide-react";
import { useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";

// Transform host data to match component interfaces
const transformSummaryForDisplay = (hostSummary: any) => ({
  totalEarnings: hostSummary.totalEarnings,
  totalExpenses: hostSummary.totalExpenses,
  netProfit: hostSummary.netProfit,
  totalTrips: hostSummary.totalTrips,
  activeDays: hostSummary.activeHostingDays,
  totalClaims: hostSummary.totalClaims,
  totalClaimAmount: hostSummary.totalClaimAmount,
  approvedClaimsAmount: hostSummary.approvedClaimsAmount,
  pendingClaims: hostSummary.pendingClaims,
  averagePerTrip: hostSummary.averageTripEarning,
});

const transformEarningsForDisplay = (hostEarnings: any[]) =>
  hostEarnings.map((earning) => {
    const gross = earning.gross_earnings || earning.amount || 0;
    const hostPct = earning.host_profit_percentage || 30;
    const hostProfit = (gross * hostPct) / 100;
    return {
      ...earning,
      host_id: earning.host_id || "",
      commission: earning.commission ?? 0,
      // For host view, treat host's share as the primary/net amount
      net_amount: hostProfit,
      gross_earnings: earning.amount,
      // Map host share into the expected fields so UI shows 30%
      client_profit_percentage: earning.host_profit_percentage ?? 30,
      host_profit_percentage: earning.host_profit_percentage ?? 30,
      client_profit_amount: hostProfit,
    };
  });

const transformExpensesForDisplay = (hostExpenses: any[]) =>
  hostExpenses.map((expense) => ({
    ...expense,
    host_id: expense.host_id || "",
  }));

const transformClaimsForDisplay = (hostClaims: any[]) =>
  hostClaims.map((claim) => ({
    ...claim,
    host_id: claim.host_id || "",
  }));

export default function HostAnalytics() {
  const {
    earnings,
    expenses,
    claims,
    summary,
    loading,
    error,
    refetch,
    selectedYear,
    setSelectedYear,
    availableYears,
  } = useHostAnalytics();

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refetch();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, refetch]);

  const handleYearChange = (value: string) => {
    if (value === "all") {
      setSelectedYear(null);
    } else {
      setSelectedYear(parseInt(value, 10));
    }
  };

  const YearSelector = () => (
    <Select
      value={selectedYear?.toString() ?? "all"}
      onValueChange={handleYearChange}
    >
      <SelectTrigger className="w-[130px]">
        <Calendar className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Select year" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Time</SelectItem>
        {availableYears.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (error) {
    return (
      <DashboardLayout>
        <PageContainer>
          {/* Header (matches the new style) */}
          <section className="mb-4">
            {/* md+ : title + subtitle + refresh on one row */}
            <div className="hidden md:flex items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold">Host Analytics Dashboard</h1>
                <p className="text-muted-foreground">
                  Track your hosting performance and profitability
                </p>
              </div>
              <div className="flex items-center gap-2">
                <YearSelector />
                <Button
                  onClick={refetch}
                  variant="outline"
                  size="sm"
                  aria-label="Refresh analytics"
                  className="flex items-center"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="ml-2">Refresh</span>
                </Button>
              </div>
            </div>

            {/* sm and below : compact banner + refresh inline */}
            <div className="md:hidden">
              <div className="rounded-2xl border bg-muted/40 p-3 flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed grow">
                  Track your hosting performance and profitability.
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <YearSelector />
                  <Button
                    onClick={refetch}
                    variant="outline"
                    size="icon"
                    aria-label="Refresh analytics"
                    className="h-9 w-9"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Error card */}
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>

          {/* Primary action */}
          <div className="mt-4">
            <Button onClick={refetch}>Try Again</Button>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }
  const uiSummary = transformSummaryForDisplay(summary);
  const grossTotal = (earnings || []).reduce(
    (acc: number, e: any) => acc + (e?.amount ?? e?.gross_earnings ?? 0),
    0
  );
  const hostPct =
    grossTotal > 0
      ? Math.round((uiSummary.totalEarnings / grossTotal) * 100)
      : 0;
  const tooltips = {
    totalEarnings: `Sum of your host share (~${hostPct}% of gross) across all trips. Gross: $${grossTotal.toFixed(
      2
    )} • Your share: $${uiSummary.totalEarnings.toFixed(2)}`,
    totalExpenses: `Sum of all expenses you've recorded across your vehicles. Total: $${(
      uiSummary.totalExpenses ?? 0
    ).toFixed(2)}`,
  };
  return (
    <DashboardLayout>
      <PageContainer>
        <div className="space-y-6">
          <section className="mb-4">
            {/* Desktop / tablet (md+): title + subtitle + refresh */}
            <div className="hidden md:flex items-center justify-between gap-3">
              <div>
                {/* <h1 className="text-3xl font-bold">Host Analytics Dashboard</h1> */}
                <p className="text-muted-foreground">
                  Track your hosting performance and profitability
                </p>
              </div>

              <div className="flex items-center gap-2">
                <YearSelector />
                <Button
                  onClick={refetch}
                  variant="outline"
                  size="sm"
                  aria-label="Refresh analytics"
                  disabled={loading}
                  className="flex items-center"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  <span className="ml-2">Refresh</span>
                </Button>
              </div>
            </div>

            {/* Mobile (sm and below): compact banner + refresh in one row */}
            <div className="md:hidden">
              <div className="rounded-2xl border bg-muted/40 p-3 flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed grow">
                  Track your hosting performance and profitability.
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <YearSelector />
                  <Button
                    onClick={refetch}
                    variant="outline"
                    size="icon"
                    aria-label="Refresh analytics"
                    disabled={loading}
                    className="h-9 w-9"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </section>
          <SummaryCards
            summary={uiSummary}
            loading={loading}
            replaceNetProfitWithTotalExpenses
            tooltips={tooltips}
          />

          <ClaimsSummary
            claims={transformClaimsForDisplay(claims)}
            loading={loading}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <EarningsChart
              earnings={transformEarningsForDisplay(earnings)}
              selectedYear={selectedYear}
            />
            <ExpenseBreakdown
              expenses={transformExpensesForDisplay(expenses)}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-1">
            <RecentTrips earnings={transformEarningsForDisplay(earnings)} />
            <RecentClaims claims={transformClaimsForDisplay(claims)} />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
