import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      // Also accept SIGNED_IN if we're on this page (recovery may fire as SIGNED_IN
      // if the Supabase client already processed the hash before we subscribed)
      if (event === 'SIGNED_IN') {
        setReady(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });

    // Check immediately and with retries in case session is already established
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled && session) {
        setReady(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    // Check right away + retry after delays to handle slow token exchange
    checkSession();
    const t1 = setTimeout(checkSession, 1000);
    const t2 = setTimeout(checkSession, 3000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match' });
      return;
    }
    if (password.length < 8) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 8 characters' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      // Sign out so they log in fresh with new password
      await supabase.auth.signOut();
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-hero p-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="flex justify-center mb-6">
            <Logo size="xl" linked />
          </div>
          <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Logo size="xl" linked />
        </div>

        <div className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-sm p-6 shadow-lg">
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold">Password Updated!</h2>
              <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-center mb-1">Set New Password</h2>
              <p className="text-sm text-muted-foreground text-center mb-5">
                Enter your new password below
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pl-10 pr-10 h-11 rounded-xl"
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="pl-10 h-11 rounded-xl"
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
                  {loading ? 'Updating…' : 'Update Password'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
