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
import { RefreshCw, BarChart3, Car, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

export default function ClientAnalytics() {
  const { earnings, expenses, claims, summary, loading, error, refetch } =
    useClientAnalytics();
  const [selectedCarId, setSelectedCarId] = useState<string | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState("portfolio");
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [selectedCarForManagement, setSelectedCarForManagement] = useState<{
    id: string;
    year: number;
    make: string;
    model: string;
    status: string;
  } | null>(null);

  const { toast } = useToast();

  const {
    cars,
    carPerformanceData,
    selectedCarData,
    selectedCarPerformance,
    loading: perCarLoading,
    error: perCarError,
    refetch: refetchPerCar,
  } = usePerCarAnalytics(selectedCarId);

  // Auto-refresh every 30s (avoid spinning while already loading)
  useEffect(() => {
    const t = setInterval(() => {
      if (!loading && !perCarLoading) {
        refetch();
        refetchPerCar();
      }
    }, 30_000);
    return () => clearInterval(t);
  }, [loading, perCarLoading, refetch, refetchPerCar]);

  const handleRefresh = () => {
    refetch();
    refetchPerCar();
  };

  const handleViewDetails = (carId: string) => {
    setSelectedCarId(carId);
    setActiveTab("per-car");

    // Find car details for toast
    const carData = carPerformanceData.find((car) => car.car_id === carId);
    if (carData) {
      toast({
        title: "Car Selected",
        description: `Viewing details for ${carData.car_year} ${carData.car_make} ${carData.car_model}`,
      });
    }
  };

  const handleManageStatus = (carId: string) => {
    const carData = carPerformanceData.find((car) => car.car_id === carId);
    if (carData) {
      setSelectedCarForManagement({
        id: carId,
        year: carData.car_year,
        make: carData.car_make,
        model: carData.car_model,
        status: carData.car_status,
      });
      setManageDialogOpen(true);
    }
  };

  const handleCarUpdated = () => {
    refetch();
    refetchPerCar();
  };

  if (error || perCarError) {
    return (
      <DashboardLayout>
        <PageContainer>
          <div className="space-y-4">
            <div className="rounded-xl border bg-destructive/10 p-4 text-destructive">
              {error || perCarError}
            </div>
            <Button onClick={handleRefresh}>Try Again</Button>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  // Helper for blocks that must never cause horizontal scroll
  const EDGE = "w-full max-w-full overflow-hidden";

  return (
    <DashboardLayout>
      <PageContainer>
        <SEO
          title="Client Analytics | TESLYS"
          description="Track vehicle performance, earnings, expenses, and claims."
        />

        {/* Add bottom padding so content never hides behind bottom nav */}
        <div className="space-y-5 pb-24">
          {/* --- Compact banner (no huge H1 needed on mobile) --- */}
          <section className="rounded-2xl border bg-muted/40 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                <Info className="h-5 w-5 text-primary" />
              </div>
              {/* <h1 className="text-3xl font-bold">Analytics Dashboard</h1> */}

              <p className="min-w-0 text-sm leading-relaxed text-muted-foreground">
                Track your vehicle’s performance and earnings. For expense
                management, visit{" "}
                <Link
                  to="/host-car-management"
                  className="text-primary underline underline-offset-4"
                >
                  Hosted Cars Management
                </Link>
                .
              </p>
            </div>

            {/* Controls row: selector grows, refresh stays small */}
            <div className="mt-3 flex items-center gap-2 sm:mt-4">
              <div className="flex-1 min-w-0">
                <CarSelector
                  cars={cars}
                  selectedCarId={selectedCarId}
                  onCarSelect={setSelectedCarId}
                  loading={perCarLoading}
                />
              </div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="icon"
                aria-label="Refresh analytics"
                disabled={loading || perCarLoading}
                className="h-9 w-9 shrink-0"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading || perCarLoading ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
          </section>

          {/* --- Tabs: sticky & horizontally scrollable on mobile --- */}
          <section className="sticky top-[env(safe-area-inset-top,0)] z-10 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 -mx-4 px-4 sm:mx-0 sm:px-0 py-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex w-full overflow-x-auto no-scrollbar gap-2">
                <TabsTrigger
                  value="portfolio"
                  className="min-w-max whitespace-nowrap px-3 py-2"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Portfolio Overview
                </TabsTrigger>
                <TabsTrigger
                  value="per-car"
                  className="min-w-max whitespace-nowrap px-3 py-2"
                >
                  <Car className="mr-2 h-4 w-4" />
                  Per-Car Analysis
                </TabsTrigger>
                <TabsTrigger
                  value="comparison"
                  className="min-w-max whitespace-nowrap px-3 py-2"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Car Comparison
                </TabsTrigger>
              </TabsList>

              {/* --- Portfolio content --- */}
              <TabsContent value="portfolio" className="space-y-5 pt-3">
                <div className={EDGE}>
                  <SummaryCards
                    summary={summary}
                    loading={loading}
                    hideNetProfit
                  />
                </div>
                <div className={EDGE}>
                  <ClaimsSummary claims={claims} loading={loading} />
                </div>
                <div className={`grid gap-5 lg:grid-cols-2 ${EDGE}`}>
                  <EarningsChart earnings={earnings} />
                  <ExpenseBreakdown expenses={expenses} />
                </div>
                <div className={`grid gap-5 lg:grid-cols-1 ${EDGE}`}>
                  <RecentTrips earnings={earnings} />
                  <RecentClaims claims={claims} />
                </div>
              </TabsContent>

              {/* --- Per-Car content --- */}
              <TabsContent value="per-car" className="space-y-5 pt-3">
                {selectedCarId && selectedCarPerformance ? (
                  <>
                    <div className={EDGE}>
                      <PerCarSummaryCards
                        performance={selectedCarPerformance}
                        loading={perCarLoading}
                      />
                    </div>
                    <div className={EDGE}>
                      <ClaimsSummary
                        claims={selectedCarData?.claims || []}
                        loading={perCarLoading}
                      />
                    </div>
                    <div className={`grid gap-5 lg:grid-cols-2 ${EDGE}`}>
                      <EarningsChart
                        earnings={selectedCarData?.earnings || []}
                      />
                      <ExpenseBreakdown
                        expenses={selectedCarData?.expenses || []}
                      />
                    </div>
                    <div className={`grid gap-5 lg:grid-cols-2 ${EDGE}`}>
                      <RecentTrips earnings={selectedCarData?.earnings || []} />
                      <RecentClaims claims={selectedCarData?.claims || []} />
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <Car className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">Select a Car</h3>
                    <p className="text-muted-foreground">
                      Choose a vehicle from the dropdown above to view details.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* --- Comparison content --- */}
              <TabsContent value="comparison" className="space-y-5 pt-3">
                <div
                  className={`grid gap-5 md:grid-cols-2 lg:grid-cols-3 ${EDGE}`}
                >
                  {carPerformanceData.map((p) => (
                    <CarPerformanceCard
                      key={p.car_id}
                      performance={p}
                      onViewDetails={handleViewDetails}
                      onManageStatus={handleManageStatus}
                    />
                  ))}
                </div>
                <div className={EDGE}>
                  <h3 className="mb-2 text-lg font-semibold">
                    Detailed Comparison
                  </h3>
                  <CarComparisonTable
                    carPerformanceData={carPerformanceData}
                    onViewDetails={handleViewDetails}
                    onManageStatus={handleManageStatus}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>

        {/* Car Management Dialog */}
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
