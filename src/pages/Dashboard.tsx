import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCars, useHostCars } from '@/hooks/useCars';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Car, Users, FileText, TrendingUp, BarChart3 } from 'lucide-react';

interface Profile {
  role: 'client' | 'host';
  name?: string;
  company_name?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Get appropriate data based on user role
  const clientData = useCars();
  const hostData = useHostCars();
  
  const isHost = profile?.role === 'host';
  const data = isHost ? hostData : clientData;

  useEffect(() => {
    if (user?.user_metadata) {
      setProfile({
        role: user.user_metadata.role || 'client',
        name: user.user_metadata.name,
        company_name: user.user_metadata.company_name,
      });
    }
  }, [user]);

  if (!user || !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  const displayName = profile.role === 'host' 
    ? (profile.company_name || profile.name || 'Host')
    : (profile.name || 'Client');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {displayName}!
          </h1>
          <p className="text-muted-foreground">
            {profile.role === 'host' 
              ? 'Manage your hosted vehicles and client relationships from your dashboard.'
              : 'Track your vehicles and manage your hosting requests from your dashboard.'
            }
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profile.role === 'host' ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.cars.filter(car => car.status === 'hosted').length}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently under your care
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.requests.filter(req => req.status === 'pending').length}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting your response
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks for vehicle hosts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/host-requests')}>
                    Review Pending Requests
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/host-car-management')}>
                    Manage Hosted Cars
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Contact Clients
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Vehicles</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.cars.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered vehicles
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.requests.filter(req => req.status === 'pending').length}</div>
                  <p className="text-xs text-muted-foreground">
                    Pending host approval
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Cars</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.cars.filter(car => car.status === 'hosted').length}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently hosted
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Get started with Telsys
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={() => navigate('/add-car')} className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your Vehicle
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/my-cars')}>
                    <Car className="h-4 w-4 mr-2" />
                    View My Cars
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/client-analytics')}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}