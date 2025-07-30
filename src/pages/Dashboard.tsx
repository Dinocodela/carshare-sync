import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Profile {
  role: 'client' | 'host';
  name?: string;
  company_name?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      // For now, use user metadata until database is ready
      const role = user.user_metadata?.role || 'client';
      const name = user.user_metadata?.name || user.user_metadata?.admin_name;
      const company_name = user.user_metadata?.company_name;
      
      setProfile({
        role,
        name,
        company_name,
      });
    }
  }, [user]);

  const displayName = profile?.role === 'host' 
    ? profile.company_name || 'Host' 
    : profile?.name || 'Client';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {displayName}!
          </h1>
          <p className="text-muted-foreground">
            {profile?.role === 'host' 
              ? 'Manage your car listings and track your business performance.'
              : 'Track your car expenses and manage your claims.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile?.role === 'host' ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Car Listings</CardTitle>
                  <CardDescription>Manage your car inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Active listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Clients</CardTitle>
                  <CardDescription>Current client relationships</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Connected clients</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Earnings</CardTitle>
                  <CardDescription>Revenue this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">$0</p>
                  <p className="text-sm text-muted-foreground">Total earnings</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>My Cars</CardTitle>
                  <CardDescription>Cars under management</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Registered vehicles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Expenses</CardTitle>
                  <CardDescription>This month's spending</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">$0</p>
                  <p className="text-sm text-muted-foreground">Total expenses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Open Claims</CardTitle>
                  <CardDescription>Pending claim requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Claims in progress</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {profile?.role === 'host' 
                  ? 'Start by adding car listings and connecting with clients.'
                  : 'Begin by registering your cars and tracking expenses.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;