import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, ArrowLeft, MessageCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CarWithHost {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
  host: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    company_name: string;
    location: string;
    rating: number;
  };
}

export default function HostingDetails() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [car, setCar] = useState<CarWithHost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarDetails();
  }, [carId, user]);

  const fetchCarDetails = async () => {
    if (!user || !carId) return;

    try {
      const { data, error } = await supabase
        .from('cars')
        .select(`
          id,
          make,
          model,
          year,
          status,
          profiles!cars_host_id_fkey (
            id,
            first_name,
            last_name,
            phone,
            company_name,
            location,
            rating
          )
        `)
        .eq('id', carId)
        .eq('client_id', user.id)
        .single();

      if (error) throw error;
      
      if (!data.profiles) {
        throw new Error('No host information found');
      }

      setCar({ ...data, host: data.profiles } as CarWithHost);
    } catch (error) {
      console.error('Error fetching car details:', error);
      toast({
        title: "Error loading details",
        description: "Unable to load hosting details. Please try again.",
        variant: "destructive",
      });
      navigate('/my-cars');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnRequest = async () => {
    if (!car) return;

    try {
      const { error } = await supabase
        .from('cars')
        .update({ status: 'ready_for_return' })
        .eq('id', car.id);

      if (error) throw error;

      toast({
        title: "Return requested",
        description: "Your host has been notified that you're ready to return the car.",
      });

      // Refresh car details
      fetchCarDetails();
    } catch (error) {
      console.error('Error requesting return:', error);
      toast({
        title: "Error",
        description: "Unable to request return. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">Loading hosting details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!car) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-lg font-medium mb-2">Car not found</h2>
          <Button onClick={() => navigate('/my-cars')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Cars
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/my-cars')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Cars
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hosting Details</h1>
            <p className="text-muted-foreground">
              Your {car.year} {car.make} {car.model} is currently being hosted
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Car Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Car Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Status:</span>
                <Badge variant="default">Being Hosted</Badge>
              </div>
              <div>
                <h3 className="font-medium mb-2">{car.year} {car.make} {car.model}</h3>
                <p className="text-sm text-muted-foreground">
                  Your car is currently under the care of your host. You can contact them using the information provided.
                </p>
              </div>
              {car.status === 'hosted' && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleReturnRequest}
                >
                  Request Car Return
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Host Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Host Contact
              </CardTitle>
              <CardDescription>
                Get in touch with your host for any questions or concerns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-lg">
                    {car.host.first_name} {car.host.last_name}
                  </h3>
                  {car.host.company_name && (
                    <p className="text-sm text-muted-foreground">{car.host.company_name}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`tel:${car.host.phone}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {car.host.phone}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{car.host.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Rating:</span>
                  <div className="flex items-center">
                    <span className="text-sm">{car.host.rating.toFixed(1)}/5.0</span>
                    <span className="text-yellow-500 ml-1">★</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`tel:${car.host.phone}`)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Host
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  For emergencies or urgent matters, please call directly
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Keep this contact information handy for any questions about your car</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Your host will contact you when it's time to arrange the car return</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>For emergencies, contact your host directly using the phone number provided</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}