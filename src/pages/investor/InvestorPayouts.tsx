import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  useMyPayouts,
  useMyInvestments,
  useInvestorVehicles,
  fmtCurrency,
} from "@/hooks/useInvestor";

export default function InvestorPayouts() {
  const navigate = useNavigate();
  const { data: payouts, isLoading } = useMyPayouts();
  const { data: investments } = useMyInvestments();
  const { data: vehicles } = useInvestorVehicles();

  const invMap = new Map((investments ?? []).map((i) => [i.id, i]));
  const vehMap = new Map((vehicles ?? []).map((v) => [v.id, v]));

  const labelFor = (investmentId: string) => {
    const inv = invMap.get(investmentId);
    const v = inv ? vehMap.get(inv.vehicle_id) : undefined;
    return v ? `${v.year} ${v.make} ${v.model}` : "Investment";
  };

  const totalPaid = (payouts ?? [])
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + Number(p.amount), 0);
  const upcoming = (payouts ?? [])
    .filter((p) => p.status !== "paid" && p.status !== "skipped")
    .reduce((s, p) => s + Number(p.amount), 0);

  const fmtDate = (d: string | null) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString() : "—";

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/investor")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to portfolio
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Payout history</h1>
          <p className="text-muted-foreground">
            Your monthly returns and resale distributions.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total received</p>
              <p className="text-2xl font-bold mt-1">{fmtCurrency(totalPaid)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Scheduled / upcoming</p>
              <p className="text-2xl font-bold mt-1">{fmtCurrency(upcoming)}</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-lg" />
        ) : !payouts || payouts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No payouts yet. Once your investment is funded and active, monthly
              payouts will appear here.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {labelFor(p.investment_id)}
                      </TableCell>
                      <TableCell>#{p.payout_month}</TableCell>
                      <TableCell>{fmtCurrency(p.amount)}</TableCell>
                      <TableCell>{fmtDate(p.scheduled_date)}</TableCell>
                      <TableCell>{fmtDate(p.paid_date)}</TableCell>
                      <TableCell>
                        <PayoutStatus status={p.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function PayoutStatus({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "outline"> = {
    paid: "default",
    scheduled: "secondary",
    pending: "outline",
    skipped: "outline",
  };
  return (
    <Badge variant={map[status] ?? "outline"} className="capitalize">
      {status}
    </Badge>
  );
}
