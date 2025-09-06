import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import RegisterClient from "./pages/RegisterClient";
import RegisterHost from "./pages/RegisterHost";
import Dashboard from "./pages/Dashboard";
import AddCar from "./pages/AddCar";
import SelectHost from "./pages/SelectHost";
import MyCars from "./pages/MyCars";
import CarDetails from "./pages/CarDetails";
import EditCar from "./pages/EditCar";
import HostRequests from "./pages/HostRequests";
import HostingDetails from "./pages/HostingDetails";
import HostCarManagement from "./pages/HostCarManagement";
import NotFound from "./pages/NotFound";
import ClientAnalytics from "./pages/ClientAnalytics";
import ClientFixedExpenses from "./pages/ClientFixedExpenses";
import HostAnalytics from "./pages/HostAnalytics";
import ScheduleMaintenance from "./pages/ScheduleMaintenance";
import Settings from "./pages/Settings";
import AuthCallbackHandler from "./components/auth/AuthCallbackHandler";
import RequireAuth from "@/components/auth/RequireAuth";
import RequireApproved from "@/components/auth/RequireApproved";
import RequireRole from "@/components/auth/RequireRole";
import AccountPending from "@/pages/AccountPending";
import AdminManageAccounts from "./pages/AdminManageAccounts";
import RequirePending from "./components/auth/RequirePending";
import PushNavHandler from "./components/push/PushNavHandler";
import PrivacyPolicy from "./pages/PrivacyPolicy";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthCallbackHandler />
          <PushNavHandler />

          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register/client" element={<RegisterClient />} />
            <Route path="/register/host" element={<RegisterHost />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* Authenticated */}
            <Route element={<RequireAuth />}>
              {/* Pending route (auth required but not approved) */}
              <Route element={<RequirePending />}>
                <Route path="/account-pending" element={<AccountPending />} />
              </Route>

              {/* Approved-only */}
              <Route element={<RequireApproved />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/client-analytics" element={<ClientAnalytics />} />
                <Route path="/host-analytics" element={<HostAnalytics />} />
                <Route path="/add-car" element={<AddCar />} />
                <Route path="/select-host" element={<SelectHost />} />
                <Route path="/my-cars" element={<MyCars />} />
                <Route path="/host-requests" element={<HostRequests />} />
                <Route
                  path="/hosting-details/:carId"
                  element={<HostingDetails />}
                />
                <Route
                  path="/host-car-management"
                  element={<HostCarManagement />}
                />
                <Route path="/cars/:id/view" element={<CarDetails />} />
                <Route path="/cars/:id/edit" element={<EditCar />} />
                <Route
                  path="/cars/:id/schedule-maintenance"
                  element={<ScheduleMaintenance />}
                />
                <Route
                  path="/client-fixed-expenses"
                  element={<ClientFixedExpenses />}
                />
                <Route path="/settings" element={<Settings />} />

                {/* Admin-only (optional) */}
                <Route element={<RequireRole />}>
                  <Route
                    path="/admin/manage-accounts"
                    element={<AdminManageAccounts />}
                  />
                </Route>
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
