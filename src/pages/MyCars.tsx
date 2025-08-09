import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Plus, Eye, Edit, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCars } from '@/hooks/useCars';
import { ShareCarDialog } from '@/components/cars/ShareCarDialog';

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
  const { cars, loading } = useCars();
  const [shareCarId, setShareCarId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { variant: 'outline' as const, label: 'Available', description: 'Ready to send hosting request' },
      pending: { variant: 'secondary' as const, label: 'Pending Review', description: 'Waiting for host response' },
      hosted: { variant: 'default' as const, label: 'Being Hosted', description: 'Currently being hosted' },
      ready_for_return: { variant: 'secondary' as const, label: 'Ready for Return', description: 'Awaiting pickup/return' },
      completed: { variant: 'outline' as const, label: 'Completed', description: 'Hosting completed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
      { variant: 'secondary' as const, label: status, description: '' };

    return {
      badge: (
        <Badge variant={config.variant}>
          {config.label}
        </Badge>
      ),
      description: config.description
    };
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
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {car.year} {car.make} {car.model}
                        </CardTitle>
                        {(car as any).is_shared && (
                          <Badge variant="secondary">Shared</Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {car.color} • {car.mileage.toLocaleString()} miles
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(car.status).badge}
                      <p className="text-xs text-muted-foreground mt-1">
                        {getStatusBadge(car.status).description}
                      </p>
                    </div>
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/cars/${car.id}/view`)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>

                      {!(car as any).is_shared && (
                        <>
                          {car.status === 'available' ? (
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => navigate(`/select-host?carId=${car.id}`)}
                            >
                              Request Hosting
                            </Button>
                          ) : car.status === 'pending' ? (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="flex-1"
                              disabled
                            >
                              Request Sent
                            </Button>
                          ) : car.status === 'hosted' ? (
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                              <div className="flex items-center gap-1 text-xs text-primary font-medium">
                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                <span>Currently being hosted</span>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => navigate(`/hosting-details/${car.id}`)}
                                disabled={!car.host_id}
                                title={!car.host_id ? 'Host details unavailable' : undefined}
                              >
                                View Host Contact
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => navigate(`/cars/${car.id}/edit`)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}

                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShareCarId(car.id)}
                          >
                            Share
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <ShareCarDialog carId={shareCarId} open={!!shareCarId} onOpenChange={(open) => setShareCarId(open ? shareCarId : null)} />
    </DashboardLayout>
  );
}