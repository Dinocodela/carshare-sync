import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Car, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function InvestorDashboard() {
  const navigate = useNavigate();
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
          <StatCard label="Total invested" value="$0" Icon={DollarSign} />
          <StatCard label="Returns received" value="$0" Icon={TrendingUp} />
          <StatCard label="Active vehicles" value="0" Icon={Car} />
          <StatCard label="Months remaining" value="—" Icon={Clock} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get started</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p className="mb-4">
              The investor portal is now live. The marketplace, checkout, payout history,
              and tax documents are being wired up in the next phase.
            </p>
            <Button variant="outline" onClick={() => navigate("/welcome/investor")}>
              How it works
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
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
