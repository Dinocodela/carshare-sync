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
import EmailConfirmed from "./pages/EmailConfirmed";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ScrollReset from "./components/router/ScrollReset";
import Blog from "./pages/Blog";
import BlogPostPage from "./pages/BlogPost";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import EarningsCalculator from "./pages/EarningsCalculator";
import TuroComparison from "./pages/TuroComparison";
import EarningsGuide from "./pages/EarningsGuide";
import LosAngeles from "./pages/cities/LosAngeles";
import Miami from "./pages/cities/Miami";
import SanFrancisco from "./pages/cities/SanFrancisco";
import NewYork from "./pages/cities/NewYork";
import Austin from "./pages/cities/Austin";
import SanDiego from "./pages/cities/SanDiego";
import Dallas from "./pages/cities/Dallas";
import Chicago from "./pages/cities/Chicago";
import Seattle from "./pages/cities/Seattle";
import Denver from "./pages/cities/Denver";
import Phoenix from "./pages/cities/Phoenix";
import Atlanta from "./pages/cities/Atlanta";
import ModelCityPage from "./pages/ModelCityPage";
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
              <Route path="/email-confirmed" element={<EmailConfirmed />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/about" element={<About />} />
              <Route path="/earnings-calculator" element={<EarningsCalculator />} />
              <Route path="/turo-management" element={<TuroComparison />} />
              <Route path="/how-much-can-i-earn" element={<EarningsGuide />} />
              <Route path="/tesla-car-sharing-los-angeles" element={<LosAngeles />} />
              <Route path="/tesla-car-sharing-miami" element={<Miami />} />
              <Route path="/tesla-car-sharing-san-francisco" element={<SanFrancisco />} />
              <Route path="/tesla-car-sharing-new-york" element={<NewYork />} />
              <Route path="/tesla-car-sharing-austin" element={<Austin />} />
              <Route path="/tesla-car-sharing-san-diego" element={<SanDiego />} />
              <Route path="/tesla-car-sharing-dallas" element={<Dallas />} />
              <Route path="/tesla-car-sharing-chicago" element={<Chicago />} />
              <Route path="/tesla-car-sharing-seattle" element={<Seattle />} />
              <Route path="/tesla-car-sharing-denver" element={<Denver />} />
              <Route path="/tesla-car-sharing-phoenix" element={<Phoenix />} />
              <Route path="/tesla-car-sharing-atlanta" element={<Atlanta />} />

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
