import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, Car, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useMyInvestments,
  useInvestorVehicles,
  fmtCurrency,
} from "@/hooks/useInvestor";

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const { data: investments, isLoading } = useMyInvestments();
  const { data: vehicles } = useInvestorVehicles();

  const vehicleMap = new Map((vehicles ?? []).map((v) => [v.id, v]));

  const totalInvested = (investments ?? [])
    .filter((i) => i.status !== "cancelled")
    .reduce((s, i) => s + Number(i.amount), 0);
  const returnsReceived = (investments ?? []).reduce(
    (s, i) => s + Number(i.total_returns_paid),
    0
  );
  const activeVehicles = (investments ?? []).filter(
    (i) => i.status === "active"
  ).length;
  const monthsRemaining = (investments ?? [])
    .filter((i) => i.status === "active")
    .reduce((max, i) => Math.max(max, i.term_months - i.months_completed), 0);

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Investor Portfolio</h1>
            <p className="text-muted-foreground">
              Your Tesla fleet investments at a glance.
            </p>
          </div>
          <Button onClick={() => navigate("/investor/marketplace")}>
            Browse vehicles
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total invested" value={fmtCurrency(totalInvested)} Icon={DollarSign} />
          <StatCard label="Returns received" value={fmtCurrency(returnsReceived)} Icon={TrendingUp} />
          <StatCard label="Active vehicles" value={String(activeVehicles)} Icon={Car} />
          <StatCard
            label="Months remaining"
            value={monthsRemaining ? String(monthsRemaining) : "—"}
            Icon={Clock}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Your investments</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/investor/payouts")}>
              View payouts
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : !investments || investments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <p className="text-muted-foreground">
                  You haven't made any investments yet.
                </p>
                <Button onClick={() => navigate("/investor/marketplace")}>
                  Explore the marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {investments.map((inv) => {
                const v = vehicleMap.get(inv.vehicle_id);
                const pct = inv.term_months
                  ? Math.round((inv.months_completed / inv.term_months) * 100)
                  : 0;
                return (
                  <Card key={inv.id}>
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {v ? `${v.year} ${v.make} ${v.model}` : "Tesla investment"}
                          </h3>
                          <StatusBadge status={inv.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {fmtCurrency(inv.amount)} · {fmtCurrency(inv.monthly_return)}/mo ·{" "}
                          {inv.term_months} mo term
                        </p>
                        {inv.status === "active" && (
                          <div className="mt-2 max-w-xs">
                            <Progress value={pct} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {inv.months_completed} / {inv.term_months} months ·{" "}
                              {fmtCurrency(inv.total_returns_paid)} received
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Resale upside</p>
                        <p className="font-semibold">{inv.resale_upside_pct}%</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    pending: { label: "Pending funding", variant: "secondary" },
    active: { label: "Active", variant: "default" },
    completed: { label: "Completed", variant: "outline" },
    sold: { label: "Sold", variant: "outline" },
    cancelled: { label: "Cancelled", variant: "outline" },
  };
  const s = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function StatCard({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-primary opacity-70" />
        </div>
      </CardContent>
    </Card>
  );
}
