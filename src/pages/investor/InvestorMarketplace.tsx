import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Car, MapPin, TrendingUp } from "lucide-react";
import { useInvestorVehicles, fmtCurrency, InvestorVehicle } from "@/hooks/useInvestor";

export default function InvestorMarketplace() {
  const navigate = useNavigate();
  const { data: vehicles, isLoading } = useInvestorVehicles();

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">
            Teslas open for investment. Each unit is a fixed $50K position with a
            fixed monthly return plus resale upside.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 w-full rounded-lg" />
            ))}
          </div>
        ) : !vehicles || vehicles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No vehicles listed yet. Check back soon — our team is preparing the
              first cohort of investable vehicles.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onClick={() => navigate(`/investor/marketplace/${v.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function VehicleCard({
  vehicle,
  onClick,
}: {
  vehicle: InvestorVehicle;
  onClick: () => void;
}) {
  const isAvailable = vehicle.status === "available";
  const photo = vehicle.photos?.[0];
  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="aspect-video bg-muted relative">
        {photo ? (
          <img
            src={photo}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <Car className="h-12 w-12 opacity-40" />
          </div>
        )}
        <Badge
          className="absolute top-2 right-2 capitalize"
          variant={isAvailable ? "default" : "secondary"}
        >
          {vehicle.status === "available"
            ? "Open"
            : vehicle.status === "funded"
            ? "Funded"
            : vehicle.status}
        </Badge>
      </div>
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-lg">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          {vehicle.location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {vehicle.location}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Investment</p>
            <p className="font-semibold">{fmtCurrency(vehicle.investment_amount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Monthly</p>
            <p className="font-semibold text-primary flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {fmtCurrency(vehicle.monthly_return)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Term</p>
            <p className="font-semibold">{vehicle.term_months} mo</p>
          </div>
          <div>
            <p className="text-muted-foreground">Resale upside</p>
            <p className="font-semibold">{vehicle.resale_upside_pct}%</p>
          </div>
        </div>
        <Button className="mt-auto" onClick={onClick} disabled={!isAvailable}>
          {isAvailable ? "View & invest" : "View details"}
        </Button>
      </CardContent>
    </Card>
  );
}
