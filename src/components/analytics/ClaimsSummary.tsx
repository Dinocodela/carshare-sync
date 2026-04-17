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
  Shield,
} from "lucide-react";
import * as React from "react";

interface ClaimsSummaryProps {
  claims: ClientClaim[];
  loading?: boolean;
}

const fMoney = (n = 0) =>
  `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const COLORS: Record<string, string> = {
  approved: "hsl(var(--chart-2))",
  pending: "hsl(var(--chart-1))",
  denied: "hsl(var(--chart-3))",
  closed: "hsl(var(--chart-4))",
};

const StatusIcon: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  approved: CheckCircle,
  pending: Clock,
  denied: XCircle,
  closed: AlertCircle,
};

export function ClaimsSummary({ claims, loading }: ClaimsSummaryProps) {
  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 animate-pulse">
            <div className="h-4 w-32 bg-muted rounded mb-4" />
            <div className="h-24 bg-muted rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  const statusCounts = claims.reduce<Record<string, number>>((acc, c) => {
    const s = c.claim_status || "pending";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const totalClaims = claims.length;
  const totalAmount = claims.reduce((s, c) => s + (c.claim_amount || 0), 0);
  const approvedAmount = claims.filter((c) => c.claim_status === "approved").reduce((s, c) => s + (c.claim_amount || 0), 0);
  const paidAmount = claims.filter((c) => (c as any).is_paid === true).reduce((s, c) => s + (c.claim_amount || 0), 0);

  const chartData = Object.entries(statusCounts).map(([status, value]) => ({
    status,
    name: status[0].toUpperCase() + status.slice(1),
    value,
    percent: totalClaims ? Math.round((value / totalClaims) * 100) : 0,
    color: COLORS[status] || "hsl(var(--muted))",
  }));

  const chartConfig = { value: { label: "Claims" } };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {/* Claims Overview */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center gap-2 p-4 pb-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Claims Overview</h3>
        </div>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Total Claims", value: totalClaims.toString(), icon: FileWarning, accent: "text-foreground" },
              { label: "Total Amount", value: fMoney(totalAmount), icon: DollarSign, accent: "text-foreground" },
              { label: "Approved", value: fMoney(approvedAmount), icon: CheckCircle, accent: "text-emerald-600" },
              { label: "Paid Out", value: fMoney(paidAmount), icon: DollarSign, accent: "text-primary" },
              { label: "Pending", value: (statusCounts.pending || 0).toString(), icon: Clock, accent: "text-amber-600" },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-border/40 bg-background/50 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</span>
                </div>
                <p className={`text-lg font-bold tracking-tight ${item.accent}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {chartData.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {chartData.map((d) => {
                const Ico = StatusIcon[d.status] || AlertCircle;
                return (
                  <div key={d.status} className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-background/50 px-2 py-1.5 text-[11px]">
                    <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <Ico className="h-3 w-3 shrink-0" />
                    <span className="truncate">{d.name}</span>
                    <span className="ml-auto tabular-nums font-medium">{d.value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Claims by Status */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center gap-2 p-4 pb-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Claims by Status</h3>
        </div>
        <div className="px-4 pb-4">
          {totalClaims === 0 ? (
            <div className="flex h-44 flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-500/60" />
              </div>
              <p className="text-sm text-muted-foreground">No claims — all clear!</p>
            </div>
          ) : (
            <>
              <ChartContainer config={chartConfig} className="mx-auto h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={65}
                      startAngle={90}
                      endAngle={-270}
                      isAnimationActive
                      strokeWidth={2}
                    >
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                      <Label
                        position="center"
                        content={({ viewBox }) => {
                          if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                          const { cx, cy } = viewBox;
                          return (
                            <g>
                              <text x={cx} y={cy as number - 6} textAnchor="middle" className="fill-foreground text-xl font-extrabold">{totalClaims}</text>
                              <text x={cx} y={cy as number + 12} textAnchor="middle" className="fill-muted-foreground text-[10px]">total</text>
                            </g>
                          );
                        }}
                      />
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(v, _n, p) => [`${v} • ${p?.payload?.percent ?? 0}%`, p?.payload?.name ?? "Claims"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>

              <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {chartData.map((d) => {
                  const Ico = StatusIcon[d.status] || AlertCircle;
                  return (
                    <div key={d.status} className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-background/50 px-2 py-1.5 text-[11px]">
                      <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <Ico className="h-3 w-3 shrink-0" />
                      <span className="truncate">{d.name}</span>
                      <span className="ml-auto tabular-nums font-medium">{d.percent}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
