import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SummaryCards } from "@/components/analytics/SummaryCards";
import { PerCarSummaryCards } from "@/components/analytics/PerCarSummaryCards";
import { EarningsChart } from "@/components/analytics/EarningsChart";
import { RecentTrips } from "@/components/analytics/RecentTrips";
import { ExpenseBreakdown } from "@/components/analytics/ExpenseBreakdown";
import { ClaimsSummary } from "@/components/analytics/ClaimsSummary";
import { RecentClaims } from "@/components/analytics/RecentClaims";
import { CarSelector } from "@/components/analytics/CarSelector";
import { CarPerformanceCard } from "@/components/analytics/CarPerformanceCard";
import { CarComparisonTable } from "@/components/analytics/CarComparisonTable";
import { CarManagementDialog } from "@/components/cars/CarManagementDialog";
import { useClientAnalytics } from "@/hooks/useClientAnalytics";
import { usePerCarAnalytics } from "@/hooks/usePerCarAnalytics";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, BarChart3, Car, Calendar, Shield, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ClientAnalytics() {
  const {
    earnings, expenses, claims, carsMap, summary,
    loading, error, refetch,
    selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, availableYears,
  } = useClientAnalytics();
  const [selectedCarId, setSelectedCarId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("portfolio");
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [selectedCarForManagement, setSelectedCarForManagement] = useState<{
    id: string; year: number; make: string; model: string; status: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const {
    cars, carPerformanceData, selectedCarData, selectedCarPerformance,
    loading: perCarLoading, error: perCarError, refetch: refetchPerCar,
    setSelectedYear: setPerCarSelectedYear,
    setSelectedMonth: setPerCarSelectedMonth,
  } = usePerCarAnalytics(selectedCarId, selectedYear, selectedMonth);

  const handleRefresh = () => { refetch(); refetchPerCar(); };

  const handleViewDetails = (carId: string) => {
    setSelectedCarId(carId);
    setActiveTab("per-car");
    const carData = carPerformanceData.find((car) => car.car_id === carId);
    if (carData) {
      toast({ title: "Car Selected", description: `Viewing details for ${carData.car_year} ${carData.car_make} ${carData.car_model}` });
    }
  };

  const handleManageStatus = (carId: string) => {
    const carData = carPerformanceData.find((car) => car.car_id === carId);
    if (carData) {
      setSelectedCarForManagement({ id: carId, year: carData.car_year, make: carData.car_make, model: carData.car_model, status: carData.car_status });
      setManageDialogOpen(true);
    }
  };

  const handleCarUpdated = () => { refetch(); refetchPerCar(); };

  const fadeIn = (idx: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(12px)",
    transition: `all 500ms cubic-bezier(0.23,1,0.32,1) ${idx * 80}ms`,
  } as React.CSSProperties);

  if (error || perCarError) {
    return (
      <DashboardLayout>
        <PageContainer>
          <div className="space-y-4">
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm p-5">
              <p className="text-sm text-destructive">{error || perCarError}</p>
            </div>
            <Button onClick={handleRefresh} className="rounded-xl">Try Again</Button>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  const EDGE = "w-full max-w-full overflow-hidden";

  return (
    <DashboardLayout>
      <PageContainer>
        <SEO title="Analytics | TESLYS" description="Track vehicle performance, earnings, expenses, and claims." />

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
                  Analytics Dashboard
                </span>
              </div>
              <p className="text-lg font-bold leading-snug">
                Your fleet's performance at a glance
              </p>
              <p className="text-xs opacity-80">
                Real-time tracking · Verified data · Insured vehicles
              </p>

              {/* Controls */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 min-w-0">
                  <CarSelector
                    cars={cars}
                    selectedCarId={selectedCarId}
                    onCarSelect={setSelectedCarId}
                    loading={perCarLoading}
                  />
                </div>
                <Select
                  value={selectedYear?.toString() ?? "all"}
                  onValueChange={(value) => {
                    const year = value === "all" ? null : parseInt(value);
                    setSelectedYear(year);
                    setPerCarSelectedYear(year);
                    if (year === null) {
                      setSelectedMonth(null);
                      setPerCarSelectedMonth(null);
                    }
                  }}
                >
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
                <Select
                  value={selectedMonth?.toString() ?? "all"}
                  disabled={selectedYear === null}
                  onValueChange={(value) => {
                    const month = value === "all" ? null : parseInt(value);
                    setSelectedMonth(month);
                    setPerCarSelectedMonth(month);
                  }}
                >
                  <SelectTrigger className="w-[116px] shrink-0 bg-white/10 border-white/20 text-primary-foreground text-xs h-9 disabled:opacity-50">
                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={month} value={(index + 1).toString()}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleRefresh}
                  variant="ghost"
                  size="icon"
                  disabled={loading || perCarLoading}
                  className="h-9 w-9 shrink-0 bg-white/10 hover:bg-white/20 text-primary-foreground"
                >
                  <RefreshCw className={`h-4 w-4 ${loading || perCarLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* ─── Tabs ─── */}
          <div style={fadeIn(1)}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex w-full overflow-x-auto no-scrollbar gap-1 bg-muted/50 backdrop-blur-sm rounded-xl p-1">
                <TabsTrigger value="portfolio" className="min-w-max whitespace-nowrap px-3 py-2 rounded-lg text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="per-car" className="min-w-max whitespace-nowrap px-3 py-2 rounded-lg text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  <Car className="mr-1.5 h-3.5 w-3.5" />
                  Per-Car
                </TabsTrigger>
                <TabsTrigger value="comparison" className="min-w-max whitespace-nowrap px-3 py-2 rounded-lg text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
                  <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                  Compare
                </TabsTrigger>
              </TabsList>

              {/* Portfolio */}
              <TabsContent value="portfolio" className="space-y-5 pt-4">
                <div style={fadeIn(2)} className={EDGE}>
                  <SummaryCards summary={summary} loading={loading} hideNetProfit />
                </div>
                <div style={fadeIn(3)} className={EDGE}>
                  <ClaimsSummary claims={claims} loading={loading} />
                </div>
                <div style={fadeIn(4)} className={`grid gap-5 lg:grid-cols-2 ${EDGE}`}>
                  <EarningsChart earnings={earnings} expenses={expenses} selectedYear={selectedYear} />
                  <ExpenseBreakdown expenses={expenses} />
                </div>
                <div style={fadeIn(5)} className={`grid gap-5 lg:grid-cols-1 ${EDGE}`}>
                   <RecentTrips earnings={earnings} expenses={expenses} carsMap={carsMap} />
                   <RecentClaims claims={claims} carsMap={carsMap} />
                </div>
              </TabsContent>

              {/* Per-Car */}
              <TabsContent value="per-car" className="space-y-5 pt-4">
                {selectedCarId && selectedCarPerformance ? (
                  <>
                    <div style={fadeIn(2)} className={EDGE}>
                      <PerCarSummaryCards performance={selectedCarPerformance} loading={perCarLoading} />
                    </div>
                    <div style={fadeIn(3)} className={EDGE}>
                      <ClaimsSummary claims={selectedCarData?.claims || []} loading={perCarLoading} />
                    </div>
                    <div style={fadeIn(4)} className={`grid gap-5 lg:grid-cols-2 ${EDGE}`}>
                      <EarningsChart earnings={selectedCarData?.earnings || []} expenses={selectedCarData?.expenses || []} selectedYear={selectedYear} />
                      <ExpenseBreakdown expenses={selectedCarData?.expenses || []} />
                    </div>
                    <div style={fadeIn(5)} className={`grid gap-5 lg:grid-cols-2 ${EDGE}`}>
                      <RecentTrips earnings={selectedCarData?.earnings || []} expenses={selectedCarData?.expenses || []} carsMap={carsMap} />
                      <RecentClaims claims={selectedCarData?.claims || []} carsMap={carsMap} />
                    </div>
                  </>
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Car className="w-7 h-7 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">Select a Car</h3>
                    <p className="text-sm text-muted-foreground">Choose a vehicle from the dropdown above</p>
                  </div>
                )}
              </TabsContent>

              {/* Comparison */}
              <TabsContent value="comparison" className="space-y-5 pt-4">
                <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${EDGE}`}>
                  {carPerformanceData.map((p) => (
                    <CarPerformanceCard key={p.car_id} performance={p} onViewDetails={handleViewDetails} onManageStatus={handleManageStatus} />
                  ))}
                </div>
                <div className={EDGE}>
                  <div className="flex items-center gap-2 px-1 mb-3">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Detailed Comparison</h3>
                  </div>
                  <CarComparisonTable carPerformanceData={carPerformanceData} onViewDetails={handleViewDetails} onManageStatus={handleManageStatus} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {selectedCarForManagement && (
          <CarManagementDialog
            open={manageDialogOpen}
            onOpenChange={setManageDialogOpen}
            carId={selectedCarForManagement.id}
            carInfo={selectedCarForManagement}
            onCarUpdated={handleCarUpdated}
          />
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
