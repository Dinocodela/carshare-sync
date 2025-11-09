import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  MapPin,
  Calendar,
  Gauge,
  Palette,
  User,
  CarIcon,
  ChevronLeft,
  Pencil,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CancelReturnButton } from "@/components/cars/CancelReturnButton";

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
  const [userRole, setUserRole] = useState<"client" | "host" | "shared" | null>(
    null
  );

  useEffect(() => {
    if (id) {
      fetchCar();
    }
  }, [id, user]);

  const fetchCar = async () => {
    if (!user || !id) return;

    console.log("Fetching car with ID:", id, "for user:", user.id);

    try {
      // First, try to fetch as client (car owner)
      const { data: clientCar, error: clientError } = await supabase
        .from("cars")
        .select("*")
        .eq("id", id)
        .eq("client_id", user.id)
        .maybeSingle();

      if (clientError) throw clientError;

      if (clientCar) {
        console.log("Car found as client:", clientCar);
        setCar(clientCar);
        setUserRole("client");
        return;
      }

      // If not found as client, try to fetch as host
      const { data: hostCar, error: hostError } = await supabase
        .from("cars")
        .select("*")
        .eq("id", id)
        .eq("host_id", user.id)
        .maybeSingle();

      if (hostError) throw hostError;

      if (hostCar) {
        console.log("Car found as host:", hostCar);
        setCar(hostCar);
        setUserRole("host");
        return;
      }

      // If not owner or host, check shared access
      const { data: sharedAccess, error: sharedError } = await supabase
        .from("car_access")
        .select("id, permission")
        .eq("car_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (sharedError && (sharedError as any).code !== "PGRST116") {
        throw sharedError;
      }

      if (sharedAccess) {
        const { data: sharedCar, error: carFetchError } = await supabase
          .from("cars")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (carFetchError) throw carFetchError;

        if (sharedCar) {
          console.log("Car found via shared access:", sharedCar);
          setCar(sharedCar);
          setUserRole("shared");
          return;
        }
      }

      // No access found
      console.log("No access to car with ID:", id, "for user:", user.id);
      setCar(null);
      setUserRole(null);
      toast({
        title: "Access denied",
        description: "You do not have access to view this car.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error fetching car:", error);
      toast({
        title: "Error loading car",
        description: "Unable to load car details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  function InfoRow({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number | React.ReactNode;
  }) {
    return (
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground">{icon}</div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground break-words">{value}</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending Host" },
      active: { variant: "default" as const, label: "Active" },
      completed: { variant: "outline" as const, label: "Completed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary" as const,
      label: status,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">
            Loading car details...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!car) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">
            Car not found or you don&apos;t have access
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="z-10 flex items-center justify-between gap-2 py-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            navigate(userRole === "host" ? "/host-car-management" : "/my-cars")
          }
          aria-label="Back"
          className="h-9 w-9"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Car Details</h1>
        </div>

        {userRole === "client" ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit car"
            onClick={() => navigate(`/cars/${car.id}/edit`)}
          >
            <Pencil className="h-5 w-5 text-primary" />
          </Button>
        ) : (
          // spacer so title stays centered when no edit button
          <div className="w-9" />
        )}
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-0">
        {/* Main card (image + info) */}
        <Card className="overflow-hidden">
          {/* Hero image */}
          {car.images?.[0] ? (
            <div className="aspect-video bg-muted">
              <img
                src={car.images[0]}
                alt={`${car.year} ${car.make} ${car.model} - Tesla car sharing vehicle photo`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <CardContent className="p-4 sm:p-6 space-y-4">
            {/* Title + status */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-2xl font-semibold leading-snug break-words">
                  {car.year} {car.make} {car.model}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {car.color} • {car.mileage?.toLocaleString()} miles
                </p>
              </div>
              <Badge
                variant={car.status === "hosted" ? "default" : "secondary"}
              >
                {car.status}
              </Badge>
            </div>

            {/* Key facts grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <InfoRow
                icon={<CarIcon className="h-4 w-4" />}
                label="Make & Model"
                value={`${car.make} ${car.model}`}
              />
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Year"
                value={String(car.year)}
              />
              <InfoRow
                icon={<Gauge className="h-4 w-4" />}
                label="Mileage"
                value={`${car.mileage?.toLocaleString()} miles`}
              />
              <InfoRow
                icon={<Palette className="h-4 w-4" />}
                label="Color"
                value={car.color}
              />
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={car.location}
              />
              <InfoRow
                icon={<User className="h-4 w-4" />}
                label="Status"
                value={car.status}
              />
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {car.description ? (
          <Card className="mt-4">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {car.description}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {userRole === "client" && car.status === "ready_for_return" && (
          <div className="max-w-3xl mx-auto px-0 sm:px-0 mt-4">
            <CancelReturnButton
              carId={car.id}
              afterSuccess={() => {
                // simple UX: go back to My Cars or refresh
                navigate("/my-cars", { replace: true });
              }}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
