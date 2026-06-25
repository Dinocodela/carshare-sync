import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Car,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  MessageCircle,
  UserCircle,
  Info,
  ChevronLeft,
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
import { HostProfilePreview } from "@/components/HostProfilePreview";
import { ReturnRequestDialog } from "@/components/cars/ReturnRequestDialog";
import { format } from "date-fns";

interface CarWithHost {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
  host: {
    id: string;
    first_name: string;
    last_name: string;
    bio?: string | null;
    services?: string[] | null;
    phone: string;
    company_name: string;
    location: string;
    rating: number;
    turo_reviews_count?: number;
    turo_profile_url?: string;
  };
}

export default function HostingDetails() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [car, setCar] = useState<CarWithHost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarDetails();
  }, [carId, user]);

  const fetchCarDetails = async () => {
    if (!user || !carId) return;

    try {
      // Use the secure function that bypasses RLS issues
      const { data: hostContactData, error: hostContactError } =
        await supabase.rpc("get_host_contact_for_client_v2", {
          p_car_id: carId,
          p_client_id: user.id,
        });

      if (hostContactError) {
        console.error("Error fetching host contact:", hostContactError);
        throw hostContactError;
      }

      if (!hostContactData || hostContactData.length === 0) {
        throw new Error("No host contact information found for this car");
      }

      const hostData = hostContactData[0];

      const transformedCar = {
        id: hostData.car_id,
        make: hostData.make,
        model: hostData.model,
        year: hostData.year,
        status: hostData.status,
        host: {
          id: hostData.host_id,
          first_name: hostData.host_first_name,
          last_name: hostData.host_last_name,
          phone: hostData.host_phone,
          company_name: hostData.host_company_name,
          location: hostData.host_location,
          rating: hostData.host_rating || 0,
          bio: hostData.host_bio ?? null,
          services: hostData.host_services ?? null,
          turo_reviews_count: hostData.host_turo_reviews_count,
          turo_profile_url: hostData.host_turo_profile_url,
        },
      };

      setCar(transformedCar as CarWithHost);
    } catch (error) {
      console.error("Error fetching car details:", error);
      toast({
        title: "Error loading details",
        description: "Unable to load hosting details. Please try again.",
        variant: "destructive",
      });
      navigate("/my-cars");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnRequest = async (returnDate: Date, message?: string) => {
    if (!car || !user) return;

    try {
      // Update car status to "ready_for_return"
      const { error: updateError } = await supabase
        .from("cars")
        .update({ status: "ready_for_return" })
        .eq("id", car.id);

      if (updateError) {
        toast({
          title: "Error",
          description: "Failed to update car status",
          variant: "destructive",
        });
        return;
      }

      // Format the return request message
      const formattedDate = format(returnDate, "PPPP");
      const returnMessage = `I would like to request the return of my ${
        car.year
      } ${car.make} ${car.model}.

Preferred Return Date: ${formattedDate}

Please note: This request provides the required 30-day notice period.${
        message ? `\n\nAdditional Details:\n${message}` : ""
      }`;

      // Send notification to host
      const { error: notificationError } = await supabase.functions.invoke(
        "send-host-return-request",
        {
          body: {
            carId: car.id,
            hostUserId: car.host.id,
            clientId: user.id,
            message: returnMessage,
          },
        }
      );

      if (notificationError) {
        console.error("Error sending notification:", notificationError);
        toast({
          title: "Warning",
          description:
            "Car return request submitted, but notification may not have been sent",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Car return request sent to host successfully!",
        });
      }

      // Refresh car details
      fetchCarDetails();
    } catch (error) {
      console.error("Error requesting car return:", error);
      toast({
        title: "Error",
        description: "Failed to request car return",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-muted-foreground">
            Loading hosting details...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!car) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-lg font-medium mb-2">Car not found</h2>
          <Button onClick={() => navigate("/my-cars")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Cars
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const hostInitials = `${car.host.first_name?.[0] ?? ""}${
    car.host.last_name?.[0] ?? ""
  }`.toUpperCase();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 pb-12">
        {/* Top bar */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/my-cars")}
            aria-label="Back"
            className="h-9 w-9 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground">Back to My Cars</span>
        </div>

        {/* Hero banner */}
        <div
          className="relative mt-4 overflow-hidden rounded-3xl p-6 sm:p-8 text-primary-foreground shadow-elegant"
          style={{ background: "var(--gradient-logo)" }}
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-6 h-44 w-44 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/70">
                <Car className="h-4 w-4" />
                Hosting Details
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {car.year} {car.make} {car.model}
              </h1>
              <p className="max-w-md text-sm text-white/75">
                Your car is being cared for by your host. Reach out anytime using
                the contact details below.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </span>
              <span className="text-sm font-semibold">Being Hosted</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 grid gap-5 md:grid-cols-5">
          {/* Host Contact */}
          <Card className="md:col-span-3 overflow-hidden border-muted/60 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary" />
                Host Contact
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Get in touch with your host for any questions or concerns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-muted/40 p-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {hostInitials || <UserCircle className="h-6 w-6" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {car.host.first_name} {car.host.last_name}
                  </p>
                  {car.host.company_name && (
                    <p className="truncate text-sm text-muted-foreground">
                      {car.host.company_name}
                    </p>
                  )}
                </div>
              </div>
              <HostProfilePreview
                host={{
                  first_name: car.host.first_name,
                  last_name: car.host.last_name,
                  company_name: car.host.company_name,
                  phone: car.host.phone,
                  location: car.host.location,
                  rating: car.host.rating,
                  turo_reviews_count: car.host.turo_reviews_count,
                  turo_profile_url: car.host.turo_profile_url,
                  services: car.host.services,
                  bio: car.host.bio,
                }}
                showCallButton
              />
            </CardContent>
          </Card>

          {/* Actions + Status */}
          <div className="md:col-span-2 space-y-5">
            <Card className="border-muted/60 shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Car Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5">
                  <span className="text-sm font-medium text-muted-foreground">
                    Current Status
                  </span>
                  <Badge className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/15">
                    Being Hosted
                  </Badge>
                </div>

                {car.status === "hosted" && (
                  <ReturnRequestDialog
                    onSubmit={handleReturnRequest}
                    loading={false}
                  />
                )}
              </CardContent>
            </Card>

            {/* Important info */}
            <Card className="border-muted/60 shadow-card">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <Info className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">Important information</p>
                </div>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {[
                    "Keep this contact information handy for any questions about your car.",
                    "Your host will contact you when it’s time to arrange the car return.",
                    "For emergencies, contact your host directly using the phone number provided.",
                  ].map((text) => (
                    <li key={text} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
