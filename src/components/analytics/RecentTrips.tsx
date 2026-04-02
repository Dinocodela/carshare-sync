import { Badge } from "@/components/ui/badge";
import { ClientEarning, ClientExpense } from "@/hooks/useClientAnalytics";
import { format, parseISO } from "date-fns";
import { getClientShare, getNetEarningAmount } from "@/lib/expenseMatching";
import { MapPin, ChevronRight } from "lucide-react";

interface RecentTripsProps {
  earnings: ClientEarning[];
  expenses?: ClientExpense[];
  limit?: number;
}

export function RecentTrips({ earnings, expenses = [], limit = 10 }: RecentTripsProps) {
  const recentEarnings = earnings.slice(0, limit);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "processing":
        return "bg-blue-50 text-blue-600 border-blue-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Recent Trips</h3>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
        {recentEarnings.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">No trips found yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Trips will appear here once your vehicles are hosted</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {recentEarnings.map((earning, i) => {
              const share = getClientShare(earning.amount, earning.client_profit_percentage, earning.trip_id, expenses);
              const net = getNetEarningAmount(earning.amount, earning.trip_id, expenses);
              return (
                <li
                  key={earning.id}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors"
                  style={{ animation: `fade-in 0.3s ease-out ${i * 40}ms both` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-foreground truncate">
                        {earning.guest_name || earning.trip_id || "Trip"}
                      </p>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 rounded-full border ${getStatusBadge(earning.payment_status)}`}>
                        {earning.payment_status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {format(parseISO(earning.earning_period_start), "MMM d")} – {format(parseISO(earning.earning_period_end), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-emerald-600">
                      ${share.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {earning.client_profit_percentage?.toFixed(0) || "0"}% of ${net.toFixed(0)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
