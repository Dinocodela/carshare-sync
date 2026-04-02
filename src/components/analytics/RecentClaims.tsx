import { Badge } from "@/components/ui/badge";
import { ClientClaim } from "@/hooks/useClientAnalytics";
import { format, parseISO } from "date-fns";
import { FileText, Calendar, DollarSign } from "lucide-react";

interface RecentClaimsProps {
  claims: ClientClaim[];
}

export function RecentClaims({ claims }: RecentClaimsProps) {
  const recentClaims = claims.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "denied":
        return "bg-red-50 text-red-700 border-red-200";
      case "closed":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Recent Claims</h3>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
        {recentClaims.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">No claims submitted yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Claims will appear here when submitted</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {recentClaims.map((claim, i) => (
              <div
                key={claim.id}
                className="px-4 py-3.5 hover:bg-muted/20 transition-colors space-y-2"
                style={{ animation: `fade-in 0.3s ease-out ${i * 40}ms both` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-foreground">{claim.claim_type}</p>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 rounded-full border ${getStatusBadge(claim.claim_status)}`}>
                        {claim.claim_status.charAt(0).toUpperCase() + claim.claim_status.slice(1)}
                      </Badge>
                    </div>
                    {claim.trip_id && (
                      <p className="text-[11px] text-muted-foreground font-mono">Trip: {claim.trip_id}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-foreground shrink-0">
                    <DollarSign className="h-3.5 w-3.5" />
                    {(claim.claim_amount || 0).toFixed(2)}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{claim.description}</p>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(parseISO(claim.incident_date), "MMM d, yyyy")}
                  </div>
                  <span>Filed {format(parseISO(claim.created_at), "MMM d")}</span>
                </div>
              </div>
            ))}

            {claims.length > 5 && (
              <div className="px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Showing {recentClaims.length} of {claims.length} claims
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
