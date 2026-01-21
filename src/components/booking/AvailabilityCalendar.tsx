import { useState, useEffect } from 'react';
import { Calendar, Car, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format, isSameDay } from 'date-fns';

interface Booking {
  id: string;
  trip_id: string | null;
  earning_period_start: string;
  earning_period_end: string;
  guest_name: string | null;
  amount: number;
}

interface AvailabilityCalendarProps {
  carId: string;
  onDateSelect?: (start: Date, end: Date) => void;
}

export function AvailabilityCalendar({ carId, onDateSelect }: AvailabilityCalendarProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<any>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!carId) return;

      setLoading(true);
      try {
        // Fetch existing bookings for this car
        const { data: earnings, error: earningsError } = await supabase
          .from('host_earnings')
          .select('id, trip_id, earning_period_start, earning_period_end, guest_name, amount')
          .eq('car_id', carId)
          .order('earning_period_start', { ascending: true });

        if (earningsError) throw earningsError;

        // Fetch car details
        const { data: car, error: carError } = await supabase
          .from('cars')
          .select('make, model, year, color')
          .eq('id', carId)
          .single();

        if (carError) throw carError;

        setBookings(earnings || []);
        setSelectedCar(car);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [carId]);

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

  const formatDateRange = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (isSameDay(startDate, endDate)) {
        return format(startDate, 'MMM dd, yyyy');
      }
      
      return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
    } catch {
      return `${start} - ${end}`;
    }
  };

  const getDaysBetween = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Calendar className="h-5 w-5" />
          Booking Calendar
        </CardTitle>
        {selectedCar && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Car className="h-4 w-4" />
            <span>
              {selectedCar.year} {selectedCar.make} {selectedCar.model}
              {selectedCar.color && ` • ${selectedCar.color}`}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No bookings yet</p>
            <p className="text-sm">This car is available for hosting</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>{bookings.length} booking{bookings.length > 1 ? 's' : ''}</span>
              <span>Total: {formatCurrency(bookings.reduce((sum, b) => sum + b.amount, 0))}</span>
            </div>
            
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 rounded-lg border border-primary/10 bg-card hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatDateRange(booking.earning_period_start, booking.earning_period_end)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {getDaysBetween(booking.earning_period_start, booking.earning_period_end)} days
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {booking.trip_id && (
                        <Badge variant="outline" className="text-xs">
                          {booking.trip_id}
                        </Badge>
                      )}
                      {booking.guest_name && (
                        <span>{booking.guest_name}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary">
                    {formatCurrency(booking.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(booking.amount / getDaysBetween(booking.earning_period_start, booking.earning_period_end))}/day
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}