import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Car, MapPin, Star, Send } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CarData {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  location: string;
  description: string | null;
  images: string[] | null;
  status: string;
  created_at: string;
  client_id: string;
}

interface HostProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  location: string;
  bio: string;
  services: string[];
  rating: number;
}

export default function SelectHost() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [car, setCar] = useState<CarData | null>(null);
  const [host, setHost] = useState<HostProfile | null>(null);
  const [message, setMessage] = useState('Hi! I\'d like to request hosting services for my car. Please let me know your availability and pricing...');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const carId = searchParams.get('carId');

  useEffect(() => {
    if (!carId) {
      navigate('/my-cars');
      return;
    }
    fetchCarAndHost();
  }, [carId, user]);

  const fetchCarAndHost = async () => {
    if (!user) return;

    try {
      // Fetch car details
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .eq('client_id', user.id)
        .single();

      if (carError) throw carError;
      
      
      setCar(carData);

      // Fetch Teslys host profile (the only host for now)
      const { data: hostData, error: hostError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'host')
        .limit(1)
        .single();

      if (hostError) {
        console.error('No host found:', hostError);
        // Create a default Teslys profile if none exists
        setHost({
          id: 'default-host',
          user_id: '1bee30cc-abe2-484a-9a8a-f9199977a3ce', // Default Teslys user ID
          first_name: 'Teslys',
          last_name: 'LLC',
          company_name: 'Teslys LLC',
          location: 'Marina del Rey, CA',
          bio: 'We provide only car hosting for Teslas by listing them on Turo and Eon platform so they can rent out and generate money for our clients every day while they sleep. Our split is 70/30 after expenses and the only expense you incur are 20% Turo fees or 30% Eon fees and $30 car wash fee.',
          services: ['Turo Listings', 'Eon Platform Management', 'Revenue Generation', 'Car Wash Services', 'Daily Rental Management', 'Client Revenue Optimization'],
          rating: 5.0
        });
      } else {
        setHost(hostData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading car details",
        description: "Unable to load car information. Please try again.",
        variant: "destructive",
      });
      navigate('/my-cars');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!user || !car || !host || !message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message for your request.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check for existing pending requests
      const { data: existingRequest, error: checkError } = await supabase
        .from('requests')
        .select('id')
        .eq('car_id', car.id)
        .eq('client_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingRequest) {
        toast({
          title: "Request already exists",
          description: "You already have a pending request for this car.",
          variant: "destructive",
        });
        return;
      }

      // Get client profile data for the notification
      const { data: clientProfile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching client profile:', profileError);
      }
      // Create the request record
      const { data: requestData, error: requestError } = await supabase
        .from('requests')
        .insert({
          car_id: car.id,
          client_id: user.id,
          host_id: host.user_id,
          message: message.trim(),
          status: 'pending'
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Send notification email to host
      const hostEmail = "info@teslys.com"; // Teslys email
      const clientName = clientProfile 
        ? `${clientProfile.first_name} ${clientProfile.last_name}`
        : user.email || 'Client';
      
      const emailResponse = await supabase.functions.invoke('send-host-notification', {
        body: {
          requestId: requestData.id,
          hostEmail: hostEmail,
          hostName: `${host.first_name} ${host.last_name}`,
          clientName: clientName,
          clientPhone: clientProfile?.phone,
          clientEmail: user.email,
          carDetails: `${car.year} ${car.make} ${car.model}`,
          message: message.trim()
        }
      });

      // Update car status to pending regardless of email result
      await supabase
        .from('cars')
        .update({ status: 'pending' })
        .eq('id', car.id);

      if (emailResponse.error) {
        console.error('Error sending host notification:', emailResponse.error);
        toast({
          title: "Request created, but email not sent",
          description: "We couldn't email the host. They'll still see your request in their dashboard.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Request sent successfully!",
          description: "Your hosting request has been sent to Teslys LLC. They will review and respond soon.",
        });
      }

      navigate('/my-cars');
    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        title: "Error sending request",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!car || !host) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">Car or host not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Select a Host</h1>
          </div>
          <p className="text-muted-foreground">
            Choose a professional host to manage and maintain your vehicle.
          </p>
        </div>

        {/* Car Details Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {car.images && car.images.length > 0 && (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={car.images[0]}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{car.year} {car.make} {car.model}</h3>
                <p className="text-muted-foreground">{car.color} • {car.mileage?.toLocaleString()} miles</p>
                <p className="text-sm text-muted-foreground">{car.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Host Card - Teslys LLC */}
        <Card className="mb-6 ring-2 ring-primary bg-primary/5">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{host.company_name}</CardTitle>
                <CardDescription className="text-base mt-1">
                  {host.company_name}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-4 w-4 ${
                      star <= Math.floor(host.rating) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
                <span className="font-medium ml-1">{host.rating}</span>
                <span className="text-muted-foreground text-sm">(45 reviews)</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{host.location}</span>
              </div>
              
              <p className="text-foreground">{host.bio}</p>
              
              <div>
                <h4 className="font-medium mb-2">Services Offered:</h4>
                <div className="flex flex-wrap gap-2">
                  {host.services.map((service) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Send Request Section */}
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Send className="h-5 w-5 mr-2 text-primary" />
                Send Request
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Add a message to introduce yourself and explain your needs.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi! I'd like to request hosting services for my car. Please let me know your availability and pricing..."
                className="min-h-[120px]"
              />
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/my-cars')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendRequest}
                  disabled={isSubmitting || !message.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}