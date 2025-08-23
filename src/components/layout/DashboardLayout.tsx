import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNativeFeatures } from '@/hooks/useNativeFeatures';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { BottomNavBar } from './BottomNavBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const { isNative } = useNativeFeatures();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen-safe flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className={`min-h-screen-safe flex w-full ${isNative ? 'pt-safe-top' : ''}`}>
        <AppSidebar />
        <div className="flex-1">
          <header className="h-12 border-b bg-background px-4" />
          <main className="flex-1 px-0 py-4 pb-app-bottom sm:p-6 md:pb-6">
            {children}
          </main>
          <BottomNavBar />
        </div>
      </div>
    </SidebarProvider>
  );
}