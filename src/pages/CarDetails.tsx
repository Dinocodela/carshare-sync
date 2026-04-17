import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CarIcon,
  ChevronLeft,
  Pencil,
  MapPin,
  Calendar,
  Gauge,
  Palette,
  Shield,
  Lock,
  CheckCircle,
  FileText,
  User,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CancelReturnButton } from "@/components/cars/CancelReturnButton";
import { afLogEvent } from "@/analytics/appsflyer";
import { AF_EVENTS } from "@/analytics/events";

interface CarData {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  location: string;
  description: string | null;
  images: string[] | null;
  status: string;
  created_at: string;
  host_id: string | null;
}

export default function CarDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [car, setCar] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<"client" | "host" | "shared" | null>(
    null
  );

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const fadeIn = (idx: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(12px)",
    transition: `all 500ms cubic-bezier(0.23,1,0.32,1) ${idx * 80}ms`,
  });

  useEffect(() => {
    if (id) fetchCar();
  }, [id, user]);

  useEffect(() => {
    if (car?.id) {
      afLogEvent(AF_EVENTS.VIEW_ITEM, {
        af_content_type: "car",
        af_content_id: car.id,
      });
    }
  }, [car?.id]);

  const fetchCar = async () => {
    if (!user || !id) return;
    try {
      const { data: clientCar, error: clientError } = await supabase
        .from("cars")
        .select("*")
        .eq("id", id)
        .eq("client_id", user.id)
        .maybeSingle();
      if (clientError) throw clientError;
      if (clientCar) { setCar(clientCar); setUserRole("client"); return; }

      const { data: hostCar, error: hostError } = await supabase
        .from("cars")
        .select("*")
        .eq("id", id)
        .eq("host_id", user.id)
        .maybeSingle();
      if (hostError) throw hostError;
      if (hostCar) { setCar(hostCar); setUserRole("host"); return; }

      const { data: sharedAccess, error: sharedError } = await supabase
        .from("car_access")
        .select("id, permission")
        .eq("car_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (sharedError && (sharedError as any).code !== "PGRST116") throw sharedError;
      if (sharedAccess) {
        const { data: sharedCar, error: carFetchError } = await supabase
          .from("cars")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (carFetchError) throw carFetchError;
        if (sharedCar) { setCar(sharedCar); setUserRole("shared"); return; }
      }

      setCar(null);
      setUserRole(null);
      toast({ title: "Access denied", description: "You do not have access to view this car.", variant: "destructive" });
    } catch (error) {
      console.error("Error fetching car:", error);
      toast({ title: "Error loading car", description: "Unable to load car details. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", label: "Pending Host" },
    active: { color: "bg-green-500/10 text-green-600 border-green-500/20", label: "Active" },
    hosted: { color: "bg-primary/10 text-primary border-primary/20", label: "Hosted" },
    available: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "Available" },
    ready_for_return: { color: "bg-orange-500/10 text-orange-600 border-orange-500/20", label: "Return Requested" },
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">Loading car details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!car) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">Car not found or you don&apos;t have access</div>
        </div>
      </DashboardLayout>
    );
  }

  const sc = statusConfig[car.status] || { color: "bg-muted text-muted-foreground", label: car.status };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-0 space-y-5 pb-8">
        {/* Header */}
        <header style={fadeIn(0)} className="flex items-center justify-between gap-2 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(userRole === "host" ? "/host-car-management" : "/my-cars")}
            aria-label="Back"
            className="h-9 w-9 rounded-xl"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Car Details</h1>
          {userRole === "client" ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit car"
              onClick={() => navigate(`/cars/${car.id}/edit`)}
              className="rounded-xl"
            >
              <Pencil className="h-5 w-5 text-primary" />
            </Button>
          ) : (
            <div className="w-9" />
          )}
        </header>

        {/* Trust Banner */}
        <div
          style={fadeIn(1)}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-primary/15 p-2.5">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {car.year} {car.make} {car.model}
              </h2>
              <p className="text-sm text-muted-foreground">
                {car.color} • {car.mileage?.toLocaleString()} miles
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            {[
              { icon: Lock, label: "Data Protected" },
              { icon: Shield, label: "Verified Listing" },
              { icon: CheckCircle, label: "Host Protected" },
            ].map(({ icon: BadgeIcon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-muted-foreground">
                <BadgeIcon className="h-3.5 w-3.5 text-primary/70" />
                {label}
              </span>
            ))}
          </div>

          {/* Status pill */}
          <div className="absolute top-4 right-4">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${sc.color}`}>
              {sc.label}
            </span>
          </div>
        </div>

        {/* Hero Image */}
        {car.images?.[0] && (
          <div style={fadeIn(2)} className="rounded-2xl overflow-hidden border border-border/50">
            <div className="aspect-video bg-muted">
              <img
                src={car.images[0]}
                alt={`${car.year} ${car.make} ${car.model} - Tesla car sharing vehicle photo`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Image Gallery (remaining) */}
        {car.images && car.images.length > 1 && (
          <div style={fadeIn(3)} className="grid grid-cols-3 gap-2">
            {car.images.slice(1).map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border/50 aspect-square">
                <img src={img} alt={`Vehicle photo ${i + 2}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Vehicle Details */}
        <div style={fadeIn(4)} className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <CarIcon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold tracking-tight">Vehicle Details</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: CarIcon, label: "Make & Model", value: `${car.make} ${car.model}` },
              { icon: Calendar, label: "Year", value: String(car.year) },
              { icon: Gauge, label: "Mileage", value: `${car.mileage?.toLocaleString()} mi` },
              { icon: Palette, label: "Color", value: car.color },
              { icon: MapPin, label: "Location", value: car.location },
              { icon: User, label: "Status", value: sc.label },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-background/50 border border-border/30 p-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-primary/60" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
                </div>
                <p className="text-sm font-semibold truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {car.description && (
          <div style={fadeIn(5)} className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">Description</h3>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {car.description}
            </p>
          </div>
        )}

        {/* Cancel Return */}
        {userRole === "client" && car.status === "ready_for_return" && (
          <div style={fadeIn(6)}>
            <CancelReturnButton
              carId={car.id}
              afterSuccess={() => navigate("/my-cars", { replace: true })}
            />
          </div>
        )}

        {/* Trust Footer */}
        <div style={fadeIn(7)} className="flex flex-wrap justify-center gap-4 py-3 text-xs text-muted-foreground">
          {[
            { icon: Lock, label: "256-bit encryption" },
            { icon: Shield, label: "Verified by Teslys" },
            { icon: CheckCircle, label: "Secure platform" },
          ].map(({ icon: TIcon, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <TIcon className="h-3.5 w-3.5 text-primary/60" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
