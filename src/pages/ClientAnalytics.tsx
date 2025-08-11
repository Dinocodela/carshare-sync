import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SummaryCards } from '@/components/analytics/SummaryCards';
import { PerCarSummaryCards } from '@/components/analytics/PerCarSummaryCards';
import { EarningsChart } from '@/components/analytics/EarningsChart';
import { RecentTrips } from '@/components/analytics/RecentTrips';
import { ExpenseBreakdown } from '@/components/analytics/ExpenseBreakdown';
import { ClaimsSummary } from '@/components/analytics/ClaimsSummary';
import { RecentClaims } from '@/components/analytics/RecentClaims';
import { CarSelector } from '@/components/analytics/CarSelector';
import { CarPerformanceCard } from '@/components/analytics/CarPerformanceCard';
import { CarComparisonTable } from '@/components/analytics/CarComparisonTable';
import { useClientAnalytics } from '@/hooks/useClientAnalytics';
import { usePerCarAnalytics } from '@/hooks/usePerCarAnalytics';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, BarChart3, Car } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export default function ClientAnalytics() {
  const { earnings, expenses, claims, summary, loading, error, refetch } = useClientAnalytics();
  const [selectedCarId, setSelectedCarId] = useState<string | undefined>(undefined);
  const { 
    cars, 
    carPerformanceData, 
    selectedCarData, 
    selectedCarPerformance,
    loading: perCarLoading, 
    error: perCarError, 
    refetch: refetchPerCar 
  } = usePerCarAnalytics(selectedCarId);

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !perCarLoading) {
        refetch();
        refetchPerCar();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, perCarLoading, refetch, refetchPerCar]);

  const handleRefresh = () => {
    refetch();
    refetchPerCar();
  };

  const handleViewDetails = (carId: string) => {
    setSelectedCarId(carId);
  };

  const handleManageStatus = (carId: string) => {
    // TODO: Implement car status management modal
    console.log('Manage status for car:', carId);
  };

  if (error || perCarError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <div className="text-center py-8">
            <p className="text-destructive">{error || perCarError}</p>
            <Button onClick={handleRefresh} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageContainer>
        <SEO title="Client Analytics | TESLYS" description="Track vehicle performance, earnings, expenses, and claims in your TESLYS client analytics dashboard." />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Track your vehicle's performance and earnings. For expense management, visit <Link to="/host-car-management" className="text-primary underline">Hosted Cars Management</Link>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <CarSelector 
                cars={cars}
                selectedCarId={selectedCarId}
                onCarSelect={setSelectedCarId}
                loading={perCarLoading}
              />
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm" 
                disabled={loading || perCarLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(loading || perCarLoading) ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <Tabs defaultValue="portfolio" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="portfolio" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Portfolio Overview</span>
              </TabsTrigger>
              <TabsTrigger value="per-car" className="flex items-center space-x-2">
                <Car className="h-4 w-4" />
                <span>Per-Car Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Car Comparison</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="space-y-6">
              <SummaryCards summary={summary} loading={loading} hideNetProfit />
              <ClaimsSummary claims={claims} loading={loading} />
              <div className="grid gap-6 lg:grid-cols-2">
                <EarningsChart earnings={earnings} />
                <ExpenseBreakdown expenses={expenses} />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <RecentTrips earnings={earnings} />
                <RecentClaims claims={claims} />
              </div>
            </TabsContent>

            <TabsContent value="per-car" className="space-y-6">
              {selectedCarId && selectedCarPerformance ? (
                <>
                  <PerCarSummaryCards 
                    performance={selectedCarPerformance} 
                    loading={perCarLoading} 
                  />
                  <ClaimsSummary 
                    claims={selectedCarData?.claims || []} 
                    loading={perCarLoading} 
                  />
                  <div className="grid gap-6 lg:grid-cols-2">
                    <EarningsChart earnings={selectedCarData?.earnings || []} />
                    <ExpenseBreakdown expenses={selectedCarData?.expenses || []} />
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <RecentTrips earnings={selectedCarData?.earnings || []} />
                    <RecentClaims claims={selectedCarData?.claims || []} />
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Car</h3>
                  <p className="text-muted-foreground">
                    Choose a specific vehicle from the dropdown above to view detailed analytics
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {carPerformanceData.map((performance) => (
                  <CarPerformanceCard
                    key={performance.car_id}
                    performance={performance}
                    onViewDetails={handleViewDetails}
                    onManageStatus={handleManageStatus}
                  />
                ))}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Detailed Comparison</h3>
                <CarComparisonTable
                  carPerformanceData={carPerformanceData}
                  onViewDetails={handleViewDetails}
                  onManageStatus={handleManageStatus}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>
    </DashboardLayout>

  );
}