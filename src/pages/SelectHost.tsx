import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, MapPin, Car, Send } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Host {
  id: string;
  user_id: string;
  name: string;
  company_name: string;
  location: string;
  services: string[];
  rating: number;
  bio: string;
}

export default function SelectHost() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const carId = searchParams.get('carId');

  useEffect(() => {
    if (!carId) {
      navigate('/dashboard');
      return;
    }
    fetchHosts();
  }, [carId, navigate]);

  const fetchHosts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('role', 'host');

      if (error) throw error;

      // Mock data for now since we don't have host profiles yet
      const mockHosts: Host[] = [
        {
          id: '1',
          user_id: '1',
          name: 'AutoCare Pro',
          company_name: 'AutoCare Professional Services',
          location: 'San Francisco, CA',
          services: ['Maintenance', 'Detailing', 'Storage', 'Inspection'],
          rating: 4.8,
          bio: 'Professional automotive care with 15+ years of experience. We provide comprehensive vehicle maintenance and storage solutions.',
        },
        {
          id: '2',
          user_id: '2',
          name: 'Elite Motor Services',
          company_name: 'Elite Motor Services LLC',
          location: 'Los Angeles, CA',
          services: ['Maintenance', 'Repairs', 'Storage'],
          rating: 4.6,
          bio: 'Specialized in luxury and exotic vehicle care. State-of-the-art facility with climate-controlled storage.',
        },
        {
          id: '3',
          user_id: '3',
          name: 'Valley Auto Care',
          company_name: 'Valley Automotive Solutions',
          location: 'San Jose, CA',
          services: ['Maintenance', 'Detailing', 'Inspection'],
          rating: 4.9,
          bio: 'Family-owned business serving the Bay Area for over 20 years. We treat every car like our own.',
        },
      ];

      setHosts(mockHosts);
    } catch (error) {
      console.error('Error fetching hosts:', error);
      toast({
        title: "Error loading hosts",
        description: "Unable to load available hosts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedHost || !carId || !user) return;

    setSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('requests')
        .insert({
          car_id: carId,
          client_id: user.id,
          host_id: selectedHost,
          message: message || 'Request for car hosting services',
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Request sent successfully!",
        description: "Your hosting request has been sent. The host will review and respond soon.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error sending request",
        description: "There was an error sending your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">Loading hosts...</div>
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

        <div className="grid gap-6">
          {hosts.map((host) => (
            <Card 
              key={host.id} 
              className={`cursor-pointer transition-all ${
                selectedHost === host.user_id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedHost(host.user_id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{host.name}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {host.company_name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{host.rating}</span>
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
          ))}
        </div>

        {selectedHost && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Request
              </CardTitle>
              <CardDescription>
                Add a message to introduce yourself and explain your needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Hi! I'd like to request hosting services for my car. Please let me know your availability and pricing..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitRequest}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Sending Request...' : 'Send Request'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}