import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClientClaim } from '@/hooks/useClientAnalytics';
import { format, parseISO } from 'date-fns';
import { FileText, Calendar, DollarSign } from 'lucide-react';

interface RecentClaimsProps {
  claims: ClientClaim[];
}

export function RecentClaims({ claims }: RecentClaimsProps) {
  const recentClaims = claims.slice(0, 5); // Show only the 5 most recent claims

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'denied':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Claims
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentClaims.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No claims submitted yet.</p>
            <p className="text-sm mt-1">Claims will appear here when your hosts submit them.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentClaims.map((claim) => (
              <div key={claim.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{claim.claim_type}</h4>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(claim.claim_status)}
                      >
                        {claim.claim_status.charAt(0).toUpperCase() + claim.claim_status.slice(1)}
                      </Badge>
                    </div>
                    {claim.trip_id && (
                      <p className="text-sm text-muted-foreground">
                        Trip: {claim.trip_id}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <DollarSign className="h-4 w-4" />
                      {claim.claim_status === 'approved' && claim.approved_amount 
                        ? `$${claim.approved_amount.toFixed(2)}` 
                        : `$${(claim.claim_amount || 0).toFixed(2)}`
                      }
                    </div>
                    {claim.claim_status === 'approved' && claim.approved_amount !== claim.claim_amount && (
                      <div className="text-xs text-muted-foreground">
                        Requested: ${(claim.claim_amount || 0).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {claim.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Incident: {format(parseISO(claim.incident_date), 'MMM d, yyyy')}
                  </div>
                  <div>
                    Submitted: {format(parseISO(claim.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            ))}
            
            {claims.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  Showing {recentClaims.length} of {claims.length} claims
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}