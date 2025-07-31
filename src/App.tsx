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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register/client" element={<RegisterClient />} />
            <Route path="/register/host" element={<RegisterHost />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-car" element={<AddCar />} />
            <Route path="/select-host" element={<SelectHost />} />
            <Route path="/my-cars" element={<MyCars />} />
            <Route path="/host-requests" element={<HostRequests />} />
            <Route path="/hosting-details/:carId" element={<HostingDetails />} />
            <Route path="/host-cars" element={<HostCarManagement />} />
            <Route path="/cars/:id/view" element={<CarDetails />} />
            <Route path="/cars/:id/edit" element={<EditCar />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
