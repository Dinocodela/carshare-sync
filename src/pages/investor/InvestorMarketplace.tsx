import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function InvestorMarketplace() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">
            Available Teslas open for investment.
          </p>
        </div>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No vehicles listed yet. Check back soon — our admin team is preparing
            the first cohort of investable vehicles.
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
