import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  host_id: string | null;
}

export default function MyCars() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, [user]);

  const fetchCars = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('cars')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast({
        title: "Error loading cars",
        description: "Unable to load your cars. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending Host' },
      active: { variant: 'default' as const, label: 'Active' },
      completed: { variant: 'outline' as const, label: 'Completed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
      { variant: 'secondary' as const, label: status };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">Loading your cars...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">My Cars</h1>
            </div>
            <p className="text-muted-foreground">
              Manage your registered vehicles and hosting requests.
            </p>
          </div>
          <Button onClick={() => navigate('/add-car')}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Car
          </Button>
        </div>

        {cars.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No cars registered</h3>
              <p className="text-muted-foreground mb-6">
                Get started by adding your first car to the platform.
              </p>
              <Button onClick={() => navigate('/add-car')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Car
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <Card key={car.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {car.year} {car.make} {car.model}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {car.color} • {car.mileage.toLocaleString()} miles
                      </CardDescription>
                    </div>
                    {getStatusBadge(car.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {car.images && car.images.length > 0 && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img
                          src={car.images[0]}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Location:</strong> {car.location}
                      </p>
                      {car.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          <strong>Description:</strong> {car.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(car.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}