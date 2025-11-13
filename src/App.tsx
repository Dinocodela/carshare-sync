import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Support from "@/pages/Support";

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
import AdminNewsletterManagement from "./pages/AdminNewsletterManagement";
import AdminNewsletterCampaigns from "./pages/AdminNewsletterCampaigns";
import AdminEmailTemplates from "./pages/AdminEmailTemplates";
import AdminWelcomeSequences from "./pages/AdminWelcomeSequences";
import Unsubscribe from "./pages/Unsubscribe";
import RequirePending from "./components/auth/RequirePending";
import PushNavHandler from "./components/push/PushNavHandler";
import { SubscriptionProvider } from "./hooks/useSubscription";
import RequireSubscribed from "./components/auth/RequireSubscribed";
import Subscribe from "./pages/Subscribe";
import RequireUnsubscribed from "./components/auth/RequireUnsusbscribed";
import SubscribeOverlay from "./pages/SubscribeOverlay";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ScrollReset from "./components/router/ScrollReset";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthCallbackHandler />
            <PushNavHandler />
            <ScrollReset />

            <Routes>
              {/* Public */}
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={<Index />} />
              {/* <Route path="/login" element={<Login />} /> */}
              <Route path="/register/client" element={<RegisterClient />} />
              <Route path="/register/host" element={<RegisterHost />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/support" element={<Support />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />

              {/* Authenticated */}
              <Route element={<RequireAuth />}>
                {/* Pending */}
                <Route element={<RequirePending />}>
                  <Route path="/account-pending" element={<AccountPending />} />
                </Route>

                {/* Approved-only */}
                <Route element={<RequireApproved />}>
                  <Route path="/subscribe" element={<SubscribeOverlay />} />

                  {/* 🔓 Let Settings be reachable even if unsubscribed so users can manage/restore */}
                  <Route path="/settings" element={<Settings />} />
                  {/* everything else requires subscription */}
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

                    {/* Admin inside the paywall as well (move it out if you want admin to bypass) */}
                    <Route element={<RequireRole />}>
                      <Route
                        path="/admin/manage-accounts"
                        element={<AdminManageAccounts />}
                      />
                      <Route
                        path="/admin/newsletter-management"
                        element={<AdminNewsletterManagement />}
                      />
                      <Route
                        path="/admin/newsletter-campaigns"
                        element={<AdminNewsletterCampaigns />}
                      />
                      <Route
                        path="/admin/email-templates"
                        element={<AdminEmailTemplates />}
                      />
                      <Route
                        path="/admin/welcome-sequences"
                        element={<AdminWelcomeSequences />}
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
