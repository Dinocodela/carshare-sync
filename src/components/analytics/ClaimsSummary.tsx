import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ClientClaim } from '@/hooks/useClientAnalytics';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ClaimsSummaryProps {
  claims: ClientClaim[];
  loading?: boolean;
}

export function ClaimsSummary({ claims, loading }: ClaimsSummaryProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Claims Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted animate-pulse rounded"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Claims by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group claims by status
  const statusCounts = claims.reduce((acc, claim) => {
    const status = claim.claim_status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    status
  }));

  const COLORS = {
    pending: 'hsl(var(--chart-1))',
    approved: 'hsl(var(--chart-2))', 
    denied: 'hsl(var(--chart-3))',
    closed: 'hsl(var(--chart-4))'
  };

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    denied: XCircle,
    closed: AlertCircle
  };

  const totalAmount = claims.reduce((sum, claim) => sum + (claim.claim_amount || 0), 0);
  const approvedAmount = claims
    .filter(claim => claim.claim_status === 'approved')
    .reduce((sum, claim) => sum + (claim.approved_amount || claim.claim_amount || 0), 0);

  const chartConfig = {
    value: {
      label: 'Claims',
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Claims Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Claims Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Claims</p>
                <p className="text-2xl font-bold">{claims.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Approved Amount</p>
                <p className="text-lg font-semibold text-green-600">${approvedAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Claims</p>
                <p className="text-lg font-semibold text-orange-600">
                  {statusCounts.pending || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims by Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Claims by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No claims recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              <ChartContainer config={chartConfig} className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label={false}
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.status as keyof typeof COLORS] || 'hsl(var(--muted))'} 
                        />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [value, 'Claims']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              <div className="space-y-2">
                {chartData.map((item) => {
                  const Icon = statusIcons[item.status as keyof typeof statusIcons] || AlertCircle;
                  return (
                    <div key={item.status} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[item.status as keyof typeof COLORS] }}
                        />
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}