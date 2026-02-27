import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Support from "@/pages/Support";
import {
  initAppsFlyer,
  afSetCustomerUserId,
  afLogEvent,
} from "@/analytics/appsflyer";
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
import RegisteredClients from "./pages/RegisteredClients";
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
import { SubscriptionProvider } from "./hooks/useSubscription";
import RequireSubscribed from "./components/auth/RequireSubscribed";
import SubscribeOverlay from "./pages/SubscribeOverlay";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import FAQ from "./pages/FAQ";
import DeleteAccount from "./pages/DeleteAccount";
import SMSConsent from "./pages/SMSConsent";
import ScrollReset from "./components/router/ScrollReset";
import { useEffect } from "react";

const queryClient = new QueryClient();

function AppsFlyerBootstrap() {
  const { user } = useAuth();

  // 1) Start AppsFlyer immediately on mount
  useEffect(() => {
    const init = async () => {
      await initAppsFlyer({
        onConversion: (_e) => {},
        onAppOpenAttribution: (_e) => {},
      });
      await afLogEvent("af_sdk_started");
    };
    init();
  }, []);

  // 2) When user logs in later, set customer user id
  useEffect(() => {
    if (!user?.id) return;
    afSetCustomerUserId(user.id);
  }, [user?.id]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppsFlyerBootstrap />

      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthCallbackHandler />
            <PushNavHandler />
            <ScrollReset />
            {/* REMOVED: AnalyticsConsentDialog */}
            <Routes>
              {/* Public */}
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={<Index />} />
              <Route path="/register/client" element={<RegisterClient />} />
              <Route path="/register/host" element={<RegisterHost />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/sms-consent" element={<SMSConsent />} />
              <Route path="/support" element={<Support />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/delete-account" element={<DeleteAccount />} />

              {/* Authenticated */}
              <Route element={<RequireAuth />}>
                {/* Pending */}
                <Route element={<RequirePending />}>
                  <Route path="/account-pending" element={<AccountPending />} />
                </Route>

                {/* Approved-only */}
                <Route element={<RequireApproved />}>
                  <Route path="/subscribe" element={<SubscribeOverlay />} />

                  {/* Settings reachable even if unsubscribed */}
                  <Route path="/settings" element={<Settings />} />

                  {/* Everything else requires subscription */}
                  <Route element={<RequireSubscribed />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/client-analytics"
                      element={<ClientAnalytics />}
                    />
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
                    <Route
                      path="/registered-clients"
                      element={<RegisteredClients />}
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

                    <Route element={<RequireRole />}>
                      <Route
                        path="/admin/manage-accounts"
                        element={<AdminManageAccounts />}
                      />
                    </Route>
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
