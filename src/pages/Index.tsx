import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-6">
            <Logo size="xl" className="h-20 w-20 sm:h-24 sm:w-24" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-primary">TESLYS</h1>
          <p className="text-xl text-muted-foreground mb-8 text-center">
            Streamline your car management and hosting services with our comprehensive platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">For Clients</CardTitle>
              <CardDescription>
                Track expenses, manage claims, and keep your vehicles organized
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/register/client">Get Started as Client</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary">For Hosts</CardTitle>
              <CardDescription>
                Manage car listings, track earnings, and grow your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/register/host">Get Started as Host</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">Already have an account?</p>
          <Button variant="outline" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
