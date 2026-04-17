import { AlertTriangle, Calendar, DollarSign, User } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConflictingEarning } from '@/hooks/useBookingValidation';
import { format } from 'date-fns';

interface ConflictWarningProps {
  conflicts: ConflictingEarning[];
  selectedDates: {
    start: string;
    end: string;
  };
}

export function ConflictWarning({ conflicts, selectedDates }: ConflictWarningProps) {
  if (conflicts.length === 0) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="font-semibold">Booking Conflict Detected</AlertTitle>
        <AlertDescription className="mt-2">
          The selected dates ({formatDate(selectedDates.start)} - {formatDate(selectedDates.end)}) 
          overlap with {conflicts.length} existing booking{conflicts.length > 1 ? 's' : ''}. 
          Please choose different dates or resolve the conflicts below.
        </AlertDescription>
      </Alert>

      <Card className="border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Calendar className="h-4 w-4" />
            Conflicting Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {conflicts.map((conflict) => (
            <div
              key={conflict.id}
              className="flex items-center justify-between p-3 rounded-md border border-destructive/20 bg-destructive/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    {conflict.trip_id && (
                      <Badge variant="secondary" className="text-xs">
                        {conflict.trip_id}
                      </Badge>
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {formatDate(conflict.earning_period_start)} - {formatDate(conflict.earning_period_end)}
                    </span>
                  </div>
                  {conflict.guest_name && (
                    <div className="flex items-center gap-1 mt-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {conflict.guest_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <span>{formatCurrency(conflict.amount)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}