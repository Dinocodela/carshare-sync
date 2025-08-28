import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClientEarning } from "@/hooks/useClientAnalytics";
import { format, parseISO } from "date-fns";

interface RecentTripsProps {
  earnings: ClientEarning[];
  limit?: number;
}

export function RecentTrips({ earnings, limit = 10 }: RecentTripsProps) {
  const recentEarnings = earnings.slice(0, limit);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="p-2">Recent Trips</CardTitle>
      </CardHeader>
      <CardContent>
        {recentEarnings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No trips found. Your vehicles haven't been hosted yet.
          </div>
        ) : (
          <>
            {/* Mobile: Stacked cards */}
            <div className="space-y-3 md:hidden">
              {recentEarnings.map((earning) => (
                <div
                  key={earning.id}
                  className="rounded-md border p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Trip ID</p>
                      <p className="font-mono text-sm truncate">
                        {earning.trip_id || "N/A"}
                      </p>
                    </div>
                    <Badge className={getStatusColor(earning.payment_status)}>
                      {earning.payment_status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Guest</p>
                      <p className="text-sm truncate">
                        {earning.guest_name || "Unknown"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Your Share
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        ${earning.client_profit_amount?.toFixed(2) || "0.00"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {earning.client_profit_percentage?.toFixed(0) || "0"}%
                        of ${earning.amount?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Period</p>
                    <p className="text-sm">
                      {format(parseISO(earning.earning_period_start), "MMM dd")}{" "}
                      –{" "}
                      {format(
                        parseISO(earning.earning_period_end),
                        "MMM dd, yyyy"
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Your Share</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEarnings.map((earning) => (
                    <TableRow key={earning.id}>
                      <TableCell className="font-mono text-sm">
                        {earning.trip_id || "N/A"}
                      </TableCell>
                      <TableCell>{earning.guest_name || "Unknown"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {format(
                              parseISO(earning.earning_period_start),
                              "MMM dd"
                            )}
                          </div>
                          <div className="text-muted-foreground">
                            {format(
                              parseISO(earning.earning_period_end),
                              "MMM dd, yyyy"
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-semibold text-green-600">
                            $
                            {earning.client_profit_amount?.toFixed(2) || "0.00"}
                          </div>
                          <div className="text-muted-foreground">
                            {earning.client_profit_percentage?.toFixed(0) ||
                              "0"}
                            % of ${earning.amount?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(earning.payment_status)}
                        >
                          {earning.payment_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
