import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNativeFeatures } from "@/hooks/useNativeFeatures";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNavBar } from "./BottomNavBar";
import { PaywallGate } from "../paywall/PaywallGate";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const { isNative } = useNativeFeatures();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gradient-hero min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex w-full h-full bg-gradient-hero">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <main
            data-scroll-root
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain pt-4 pt-safe-top px-0 py-4 pb-app-bottom sm:p-6 md:pb-6 w-full"
          >
            <div className="px-4 sm:px-6">
              <BreadcrumbNav />
            </div>
            {children}
          </main>
          <BottomNavBar />
        </div>
      </div>
    </SidebarProvider>
  );
}
