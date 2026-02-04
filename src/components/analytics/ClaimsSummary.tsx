import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { ClientClaim } from "@/hooks/useClientAnalytics";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  FileWarning,
} from "lucide-react";
import * as React from "react";

interface ClaimsSummaryProps {
  claims: ClientClaim[];
  loading?: boolean;
}

/* ------------------------- small helpers ------------------------- */
const fMoney = (n = 0) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const COLORS: Record<string, string> = {
  approved: "hsl(var(--chart-2))",
  pending: "hsl(var(--chart-1))",
  denied: "hsl(var(--chart-3))",
  closed: "hsl(var(--chart-4))",
};

const StatusIcon: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  approved: CheckCircle,
  pending: Clock,
  denied: XCircle,
  closed: AlertCircle,
};

/* ----------------------------- component ----------------------------- */
export function ClaimsSummary({ claims, loading }: ClaimsSummaryProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Claims Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-36 rounded-xl bg-muted animate-pulse" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Claims by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-36 rounded-xl bg-muted animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* --- aggregations --- */
  const statusCounts = claims.reduce<Record<string, number>>((acc, c) => {
    const s = c.claim_status || "pending";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const totalClaims = claims.length;
  const totalAmount = claims.reduce((s, c) => s + (c.claim_amount || 0), 0);
  const approvedAmount = claims
    .filter((c) => c.claim_status === "approved")
    .reduce((s, c) => s + (c.claim_amount || 0), 0);
  const paidAmount = claims
    .filter((c) => (c as any).is_paid === true)
    .reduce((s, c) => s + (c.claim_amount || 0), 0);

  const chartData = Object.entries(statusCounts).map(([status, value]) => ({
    status,
    name: status[0].toUpperCase() + status.slice(1),
    value,
    percent: totalClaims ? Math.round((value / totalClaims) * 100) : 0,
    color: COLORS[status] || "hsl(var(--muted))",
  }));

  const chartConfig = {
    value: { label: "Claims" },
  };

  /* ----------------------------- UI ----------------------------- */
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {/* Claims Overview */}
      <Card className="min-w-0">
        <CardHeader className="pb-2 mt-2">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Claims Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 gap-2 sm:gap-6">
            {/* Total Claims */}
            <div className="rounded-xl border bg-background p-3 sm:p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileWarning className="h-4 w-4" />
                Total Claims
              </div>
              <div className="mt-1 text-2xl font-extrabold tracking-tight">
                {totalClaims}
              </div>
            </div>

            {/* Total Amount */}
            <div className="rounded-xl border bg-background p-3 sm:p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Total Amount
              </div>
              <div className="mt-1 text-2xl font-extrabold tracking-tight">
                {fMoney(totalAmount)}
              </div>
            </div>

            {/* Approved Amount */}
            <div className="rounded-xl border bg-background p-3 sm:p-4">
              <div className="text-xs text-muted-foreground">
                Approved Amount
              </div>
              <div className="mt-1 text-xl font-semibold text-emerald-600">
                {fMoney(approvedAmount)}
              </div>
            </div>

            {/* Amount Paid */}
            <div className="rounded-xl border bg-background p-3 sm:p-4">
              <div className="text-xs text-muted-foreground">
                Amount Paid
              </div>
              <div className="mt-1 text-xl font-semibold text-primary">
                {fMoney(paidAmount)}
              </div>
            </div>

            {/* Pending Count */}
            <div className="rounded-xl border bg-background p-3 sm:p-4">
              <div className="text-xs text-muted-foreground">
                Pending Claims
              </div>
              <div className="mt-1 text-xl font-semibold text-amber-600">
                {statusCounts.pending || 0}
              </div>
            </div>
          </div>

          {/* Tiny status strip */}
          {chartData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {chartData.map((d) => {
                const Ico = StatusIcon[d.status] || AlertCircle;
                return (
                  <div
                    key={d.status}
                    className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1.5"
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <Ico className="h-3.5 w-3.5" />
                    <span className="truncate">{d.name}</span>
                    <span className="ml-auto tabular-nums">{d.value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claims by Status */}
      <Card className="min-w-0">
        <CardHeader className="pb-2 mt-2">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Claims by Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {totalClaims === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-sm text-muted-foreground">
              🎉 No claims yet — all clear!
            </div>
          ) : (
            <>
              <ChartContainer
                config={chartConfig}
                className="mx-auto h-48 w-full sm:h-56"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart role="img" aria-label="Claims by status">
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={70}
                      startAngle={90}
                      endAngle={-270}
                      isAnimationActive
                      strokeWidth={2}
                    >
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                      {/* Center label with total */}
                      <Label
                        position="center"
                        content={({ viewBox }) => {
                          if (
                            !viewBox ||
                            !("cx" in viewBox) ||
                            !("cy" in viewBox)
                          )
                            return null;
                          const { cx, cy } = viewBox;
                          return (
                            <g>
                              <text
                                x={cx}
                                y={cy - 6}
                                textAnchor="middle"
                                className="fill-foreground text-xl font-extrabold"
                              >
                                {totalClaims}
                              </text>
                              <text
                                x={cx}
                                y={cy + 12}
                                textAnchor="middle"
                                className="fill-muted-foreground text-[10px]"
                              >
                                total
                              </text>
                            </g>
                          );
                        }}
                      />
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(v, _n, p) => [
                        `${v} • ${p?.payload?.percent ?? 0}%`,
                        p?.payload?.name ?? "Claims",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Legend */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                {chartData.map((d) => {
                  const Ico = StatusIcon[d.status] || AlertCircle;
                  return (
                    <div
                      key={d.status}
                      className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1.5"
                    >
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: d.color }}
                        aria-hidden
                      />
                      <Ico className="h-3.5 w-3.5" />
                      <span className="truncate">{d.name}</span>
                      <span className="ml-auto tabular-nums">{d.percent}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
