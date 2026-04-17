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

  return (
    <DashboardLayout>
      <header className=" z-10">
        <div className="mx-auto max-w-2xl px-4 h-12 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/my-cars")}
            aria-label="Back"
            className="h-9 w-9"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <h1 className=" text-xl sm:text-2xl font-bold">Hosting Details</h1>
          </div>

          {/* spacer to keep title centered */}
          <div className="h-9 w-9" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto mt-6">
        {/* Content */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Car Status */}
          <Card className="border-muted/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Car Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Current Status
                </span>
                <Badge className="px-3 py-1 text-xs">Being Hosted</Badge>
              </div>

              <div className="rounded-lg bg-muted/40 px-3 py-2">
                <p className="text-sm font-medium">
                  {car.year} {car.make} {car.model}
                </p>
                <p className="text-xs text-muted-foreground">
                  Your car is under the care of your host. Use the contact info
                  below if you need anything.
                </p>
              </div>

              {car.status === "hosted" && (
                <ReturnRequestDialog
                  onSubmit={handleReturnRequest}
                  loading={false}
                />
              )}
            </CardContent>
          </Card>

          {/* Host Contact */}
          <Card className="border-muted/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary" />
                Host Contact
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Get in touch with your host for any questions or concerns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
        </div>

        {/* Important info – slim banner */}
        <div className="mt-4 sm:mt-6 rounded-2xl border bg-muted/40 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Important information
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span>
                    Keep this contact information handy for any questions about
                    your car.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span>
                    Your host will contact you when it’s time to arrange the car
                    return.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span>
                    For emergencies, contact your host directly using the phone
                    number provided.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
