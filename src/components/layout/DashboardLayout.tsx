import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNativeFeatures } from "@/hooks/useNativeFeatures";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNavBar } from "./BottomNavBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const { isNative } = useNativeFeatures();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className={`flex w-full ${isNative ? "" : ""}`}>
        <AppSidebar />
        <div className="flex-1 w-full">
          {/* <header className="h-12 bg-background px-4" /> */}
          {/* ⬇️ added overflow-x-hidden */}
          <main className="flex-1 pt-4 pt-safe-top px-0 py-4 pb-app-bottom sm:p-6 md:pb-6 overflow-x-hidden w-full">
            {children}
          </main>
          <BottomNavBar />
        </div>
      </div>
    </SidebarProvider>
  );
}
