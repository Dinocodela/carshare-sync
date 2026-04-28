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
import { RefreshCw, Calendar, Shield, Car, Filter, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Transform host data to match component interfaces
const transformSummaryForDisplay = (hostSummary: any) => ({
  totalEarnings: hostSummary.totalEarnings,
  totalExpenses: hostSummary.totalExpenses,
  netProfit: hostSummary.netProfit,
  totalFixedCosts: 0,
  trueNetProfit: hostSummary.netProfit,
  totalTrips: hostSummary.totalTrips,
  activeDays: hostSummary.activeHostingDays,
  totalClaims: hostSummary.totalClaims,
  totalClaimAmount: hostSummary.totalClaimAmount,
  approvedClaimsAmount: hostSummary.approvedClaimsAmount,
  pendingClaims: hostSummary.pendingClaims,
  averagePerTrip: hostSummary.averageTripEarning,
});

const transformEarningsForDisplay = (hostEarnings: any[], hostExpenses: any[] = []) =>
  hostEarnings.map((earning) => {
    const relatedExpenses = earning.trip_id
      ? hostExpenses.filter((exp: any) => exp.trip_id === earning.trip_id)
      : [];
    const totalExpenses = relatedExpenses.reduce((sum: number, exp: any) =>
      sum + (exp.amount || 0) + (exp.delivery_cost || 0) + (exp.toll_cost || 0) +
      (exp.ev_charge_cost || 0) + (exp.carwash_cost || 0), 0);
    const netProfit = (earning.amount || 0) - totalExpenses;
    const hostPct = earning.host_profit_percentage || 30;
    const hostProfit = (netProfit * hostPct) / 100;
    return {
      ...earning,
      host_id: earning.host_id || "",
      commission: earning.commission ?? 0,
      net_amount: hostProfit,
      gross_earnings: earning.amount,
      client_profit_percentage: earning.host_profit_percentage ?? 30,
      host_profit_percentage: earning.host_profit_percentage ?? 30,
      client_profit_amount: hostProfit,
    };
  });

const transformExpensesForDisplay = (hostExpenses: any[]) =>
  hostExpenses.map((expense) => ({ ...expense, host_id: expense.host_id || "" }));

const transformClaimsForDisplay = (hostClaims: any[]) =>
  hostClaims.map((claim) => ({ ...claim, host_id: claim.host_id || "" }));

export default function HostAnalytics() {
  const {
    earnings, expenses, claims, summary,
    loading, error, refetch,
    selectedYear, setSelectedYear, availableYears,
    selectedCarId, setSelectedCarId,
    selectedPaymentSource, setSelectedPaymentSource,
    selectedPaymentStatus, setSelectedPaymentStatus,
    selectedMonth, setSelectedMonth,
    hostCars, availablePaymentSources,
    clearFilters, hasActiveFilters,
  } = useHostAnalytics();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => { if (!loading) refetch(); }, 30000);
    return () => clearInterval(interval);
  }, [loading, refetch]);

  const handleYearChange = (value: string) => {
    setSelectedYear(value === "all" ? null : parseInt(value, 10));
    if (value === "all") setSelectedMonth(null);
  };

  const fadeIn = (idx: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(12px)",
    transition: `all 500ms cubic-bezier(0.23,1,0.32,1) ${idx * 80}ms`,
  } as React.CSSProperties);

  if (error) {
    return (
      <DashboardLayout>
        <PageContainer>
          <div className="space-y-4">
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm p-5">
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <Button onClick={refetch} className="rounded-xl">Try Again</Button>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  const uiSummary = transformSummaryForDisplay(summary);
  const grossTotal = (earnings || []).reduce(
    (acc: number, e: any) => acc + (e?.amount ?? e?.gross_earnings ?? 0), 0
  );
  const hostPct = grossTotal > 0 ? Math.round((uiSummary.totalEarnings / grossTotal) * 100) : 0;
  const tooltips = {
    totalEarnings: `Sum of your host share (~${hostPct}% of gross) across all trips. Gross: $${grossTotal.toFixed(2)} • Your share: $${uiSummary.totalEarnings.toFixed(2)}`,
    totalExpenses: `Sum of all expenses you've recorded. Total: $${(uiSummary.totalExpenses ?? 0).toFixed(2)}`,
  };

  return (
    <DashboardLayout>
      <PageContainer>
        <div className="space-y-5 pb-24">
          {/* ─── Trust Banner ─── */}
          <div
            style={fadeIn(0)}
            className="relative overflow-hidden rounded-2xl bg-gradient-primary p-5 text-primary-foreground"
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium opacity-90 uppercase tracking-wider">
                  Host Analytics
                </span>
              </div>
              <p className="text-lg font-bold leading-snug">
                Track your hosting performance
              </p>
              <p className="text-xs opacity-80">
                Real-time data · Verified earnings · Full transparency
              </p>

              <div className="flex items-center gap-2 pt-1">
                <Select value={selectedYear?.toString() ?? "all"} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-[100px] shrink-0 bg-white/10 border-white/20 text-primary-foreground text-xs h-9">
                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={refetch}
                  variant="ghost"
                  size="icon"
                  disabled={loading}
                  className="h-9 w-9 shrink-0 bg-white/10 hover:bg-white/20 text-primary-foreground"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* ─── Filter Bar ─── */}
          <div
            style={fadeIn(1)}
            className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Filters
              </span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {/* Car Filter */}
              <Select
                value={selectedCarId ?? "all"}
                onValueChange={(v) => setSelectedCarId(v === "all" ? null : v)}
              >
                <SelectTrigger className="h-9 text-xs bg-background/50 border-border/50">
                  <Car className="mr-1.5 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="All Cars" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cars</SelectItem>
                  {hostCars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.year} {car.make} {car.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Payment Source Filter */}
              <Select
                value={selectedPaymentSource ?? "all"}
                onValueChange={(v) => setSelectedPaymentSource(v === "all" ? null : v)}
              >
                <SelectTrigger className="h-9 text-xs bg-background/50 border-border/50">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {availablePaymentSources.map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Payment Status Filter */}
              <Select
                value={selectedPaymentStatus ?? "all"}
                onValueChange={(v) => setSelectedPaymentStatus(v === "all" ? null : v)}
              >
                <SelectTrigger className="h-9 text-xs bg-background/50 border-border/50">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              {/* Month Filter (only when a specific year is selected) */}
              <Select
                value={selectedMonth !== null ? selectedMonth.toString() : "all"}
                onValueChange={(v) => setSelectedMonth(v === "all" ? null : parseInt(v, 10))}
                disabled={!selectedYear}
              >
                <SelectTrigger className="h-9 text-xs bg-background/50 border-border/50">
                  <SelectValue placeholder={selectedYear ? "All Months" : "Select year first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {MONTH_NAMES.map((name, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ─── Summary Cards ─── */}
          <div style={fadeIn(2)}>
            <SummaryCards
              summary={uiSummary}
              loading={loading}
              replaceNetProfitWithTotalExpenses
              tooltips={tooltips}
            />
          </div>

          {/* ─── Claims Summary ─── */}
          <div style={fadeIn(3)}>
            <ClaimsSummary claims={transformClaimsForDisplay(claims)} loading={loading} />
          </div>

          {/* ─── Charts ─── */}
          <div style={fadeIn(4)} className="grid gap-5 lg:grid-cols-2">
            <EarningsChart earnings={transformEarningsForDisplay(earnings, expenses)} selectedYear={selectedYear} />
            <ExpenseBreakdown expenses={transformExpensesForDisplay(expenses)} />
          </div>

          {/* ─── Recent Data ─── */}
          <div style={fadeIn(5)} className="grid gap-5 lg:grid-cols-1">
            <RecentTrips earnings={transformEarningsForDisplay(earnings, expenses)} />
            <RecentClaims claims={transformClaimsForDisplay(claims)} />
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
