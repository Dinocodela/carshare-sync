import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { ArrowRight, Users, Car } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="text-center max-w-4xl w-full">
        {/* Hero Section */}
        <div className="mb-12 space-y-6">
          <div className="flex justify-center mb-6">
            <Logo size="xl" className="animate-pulse" />
          </div>
          
          <div className="space-y-4">
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Streamline your car management and hosting services with our comprehensive platform
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="group hover:shadow-elegant transition-all duration-300 bg-gradient-card border-0 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl text-primary">For Clients</CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground">
                Track expenses, manage claims, and keep your vehicles organized with powerful analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full group-hover:shadow-glow transition-all duration-300">
                <Link to="/register/client" className="flex items-center gap-2">
                  Get Started as Client
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-elegant transition-all duration-300 bg-gradient-card border-0 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl text-primary">For Hosts</CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground">
                Manage car listings, track earnings, and grow your business with comprehensive tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full group-hover:shadow-glow transition-all duration-300">
                <Link to="/register/host" className="flex items-center gap-2">
                  Get Started as Host
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sign In Section */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Already have an account?</p>
          <Button 
            variant="outline" 
            asChild 
            className="bg-white/50 border-primary/20 hover:bg-white/70 hover:border-primary/40 transition-all duration-300"
          >
            <Link to="/login" className="flex items-center gap-2">
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
