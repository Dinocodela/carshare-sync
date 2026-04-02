import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Mail, Lock, Shield, Star, Users, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ variant: "destructive", title: "Login failed", description: error.message });
      } else {
        toast({ title: "Welcome back!", description: "You have been logged in successfully." });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Login failed", description: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="xl" linked />
        </div>

        <h1 className="text-xl font-bold text-foreground text-center mb-1">
          Welcome back to{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Teslys</span>
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Sign in to manage your fleet
        </p>

        {/* Login Card */}
        <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-11 bg-background/50 border-border/60 focus:border-primary/50 rounded-lg pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-11 bg-background/50 border-border/60 focus:border-primary/50 rounded-lg pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              disabled={loading}
            >
              {loading ? 'Signing in...' : (
                <span className="inline-flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-5 text-center space-y-3">
            <p className="text-xs text-muted-foreground">Don't have an account?</p>
            <div className="flex gap-2">
              <Button variant="outline" asChild className="flex-1 h-10 rounded-xl text-xs font-medium border-border/60">
                <Link to="/register/client">Register as Client</Link>
              </Button>
              <Button variant="outline" asChild className="flex-1 h-10 rounded-xl text-xs font-medium border-border/60">
                <Link to="/register/host">Register as Host</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex justify-center gap-6 mt-6">
          {[
            { icon: Shield, label: "Fully Insured" },
            { icon: Star, label: "Top Rated" },
            { icon: Users, label: "Trusted Hosts" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
