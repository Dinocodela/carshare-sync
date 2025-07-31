import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, CheckCircle, XCircle, Settings, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CarWithClient {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
  location: string;
  mileage: number;
  color: string;
  description: string;
  created_at: string;
  updated_at: string;
  client: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
}

export default function HostCarManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [cars, setCars] = useState<CarWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostedCars();
  }, [user]);

  const fetchHostedCars = async () => {
    if (!user) return;

    try {
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .eq('host_id', user.id)
        .in('status', ['hosted', 'ready_for_return'])
        .order('updated_at', { ascending: false });

      if (carsError) throw carsError;

      if (!carsData || carsData.length === 0) {
        setCars([]);
        return;
      }

      // Get unique client IDs
      const clientIds = [...new Set(carsData.map(car => car.client_id).filter(Boolean))];
      
      // Fetch client profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, phone')
        .in('user_id', clientIds);

      if (profilesError) throw profilesError;

      // Map cars with client information
      const transformedCars = carsData.map(car => {
        const clientProfile = profilesData?.find(profile => profile.user_id === car.client_id);
        return {
          ...car,
          client: clientProfile ? {
            id: clientProfile.user_id,
            first_name: clientProfile.first_name,
            last_name: clientProfile.last_name,
            phone: clientProfile.phone
          } : {
            id: car.client_id || 'unknown',
            first_name: 'Unknown',
            last_name: 'Client',
            phone: 'N/A'
          }
        };
      });

      setCars(transformedCars as CarWithClient[]);
    } catch (error) {
      console.error('Error fetching hosted cars:', error);
      toast({
        title: "Error loading cars",
        description: "Unable to load hosted cars. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCarReturn = async (carId: string) => {
    try {
      // First, update just the status to 'available'
      const { error: statusError } = await supabase
        .from('cars')
        .update({ status: 'available' })
        .eq('id', carId);

      if (statusError) throw statusError;

      // Then, clear the host and client associations
      const { error: clearError } = await supabase
        .from('cars')
        .update({ 
          host_id: null,
          client_id: null
        })
        .eq('id', carId);

      if (clearError) throw clearError;

      toast({
        title: "Car returned successfully",
        description: "The car has been marked as returned and is now available for new requests.",
      });

      // Refresh the list
      fetchHostedCars();
    } catch (error) {
      console.error('Error returning car:', error);
      toast({
        title: "Error",
        description: "Unable to process car return. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleManagementAction = (action: string, car: CarWithClient) => {
    switch (action) {
      case 'view-details':
        toast({
          title: "Car Details",
          description: `Viewing details for ${car.year} ${car.make} ${car.model}`,
        });
        break;
      case 'schedule-maintenance':
        toast({
          title: "Schedule Maintenance",
          description: "Maintenance scheduling feature coming soon!",
        });
        break;
      case 'report-issue':
        toast({
          title: "Report Issue",
          description: "Issue reporting feature coming soon!",
        });
        break;
      case 'message-client':
        toast({
          title: "Message Client",
          description: "Messaging feature coming soon!",
        });
        break;
      case 'full-details':
        // Only navigate if the route exists
        navigate(`/car-details/${car.id}`);
        break;
      default:
        toast({
          title: "Feature Coming Soon",
          description: "This feature will be available soon!",
        });
    }
  };

  const activeHostedCars = cars.filter(car => car.status === 'hosted');
  const readyForReturnCars = cars.filter(car => car.status === 'ready_for_return');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">Loading hosted cars...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Hosted Cars Management</h1>
          </div>
          <p className="text-muted-foreground">
            Manage cars you're currently hosting and process returns.
          </p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active Hosting ({activeHostedCars.length})
            </TabsTrigger>
            <TabsTrigger value="returns">
              Ready for Return ({readyForReturnCars.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeHostedCars.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No cars currently hosted</h3>
                  <p className="text-muted-foreground">
                    Cars you're hosting will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {activeHostedCars.map((car) => (
                  <Card key={car.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {car.year} {car.make} {car.model}
                          </CardTitle>
                          <CardDescription>
                            Location: {car.location}
                          </CardDescription>
                        </div>
                        <Badge variant="default">Hosting</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Enhanced Car Information */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Color:</span>
                          <p className="font-medium">{car.color || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mileage:</span>
                          <p className="font-medium">{car.mileage ? `${car.mileage.toLocaleString()} mi` : 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hosting Since:</span>
                          <p className="font-medium">{new Date(car.updated_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <p className="font-medium text-green-600">Active</p>
                        </div>
                      </div>

                      {/* Client Contact Section */}
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Client Contact</h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Name:</strong> {car.client.first_name} {car.client.last_name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={`tel:${car.client.phone}`}
                              className="text-sm hover:underline"
                            >
                              {car.client.phone}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Management Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => window.open(`tel:${car.client.phone}`)}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call Client
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleManagementAction('view-details', car)}>
                              <FileText className="h-4 w-4 mr-2" />
                              View Car Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManagementAction('schedule-maintenance', car)}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Maintenance
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManagementAction('report-issue', car)}>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Report Issue
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleManagementAction('message-client', car)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Message Client
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManagementAction('full-details', car)}>
                              <Car className="h-4 w-4 mr-2" />
                              Full Car Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="returns" className="space-y-4">
            {readyForReturnCars.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No cars ready for return</h3>
                  <p className="text-muted-foreground">
                    Cars ready to be returned will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {readyForReturnCars.map((car) => (
                  <Card key={car.id} className="border-orange-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {car.year} {car.make} {car.model}
                          </CardTitle>
                          <CardDescription>
                            Location: {car.location}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Ready for Return</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Client Contact</h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Name:</strong> {car.client.first_name} {car.client.last_name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={`tel:${car.client.phone}`}
                              className="text-sm hover:underline"
                            >
                              {car.client.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-orange-600 font-medium">
                          ⚠ Client has requested car return
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`tel:${car.client.phone}`)}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Call Client
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleCarReturn(car.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Return
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}