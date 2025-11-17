import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car as CarIcon,
  Eye,
  Edit,
  Share2,
  Settings,
  Info,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCars } from "@/hooks/useCars";
import { ShareCarDialog } from "@/components/cars/ShareCarDialog";
import { ManageCarAccessDialog } from "@/components/cars/ManageCarAccessDialog";
import { CancelReturnButton } from "@/components/cars/CancelReturnButton";
import { CompleteReturnButton } from "@/components/cars/CompleteReturnButton";

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
  // optional flag you used
  is_shared?: boolean;
}

export default function MyCars() {
  const navigate = useNavigate();
  const { cars, loading } = useCars();
  const [shareCarId, setShareCarId] = useState<string | null>(null);
  const [manageAccessCarId, setManageAccessCarId] = useState<string | null>(
    null
  );

  const getStatusBadge = (status: string) => {
    const cfg = {
      available: {
        variant: "outline" as const,
        label: "Available",
        desc: "Ready to request hosting",
      },
      pending: {
        variant: "secondary" as const,
        label: "Pending Review",
        desc: "Waiting for host response",
      },
      hosted: {
        variant: "default" as const,
        label: "Being Hosted",
        desc: "Currently being hosted",
      },
      ready_for_return: {
        variant: "secondary" as const,
        label: "Ready for Return",
        desc: "Awaiting pickup/return",
      },
      completed: {
        variant: "outline" as const,
        label: "Completed",
        desc: "Hosting completed",
      },
    } as const;

    const s = (cfg as any)[status] ?? {
      variant: "secondary",
      label: status,
      desc: "",
    };
    return {
      badge: <Badge variant={s.variant}>{s.label}</Badge>,
      desc: s.desc as string,
    };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
          Loading your cars…
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-0">
        {/* Header (matches Client/Host Analytics & Add Car pattern) */}
        <section className="mb-6">
          {/* md+ : full title + subtitle (no add button here) */}
          <div className="hidden md:flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CarIcon className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold">My Cars</h1>
              </div>
              <p className="text-muted-foreground">
                Manage your registered vehicles and hosting requests.
              </p>
            </div>
          </div>

          {/* Mobile (sm and below): compact banner with icon */}
          <div className="md:hidden">
            <div className="rounded-2xl border bg-muted/40 p-3 flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                <CarIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Manage your registered vehicles and hosting requests.
                </p>
                {/* <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="rounded-md bg-primary/10 p-1">
                    <Info className="h-3 w-3 text-primary" />
                  </div>
                  <span>Use the + tab to add a car.</span>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        {/* Empty state */}
        {cars.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No cars yet</h3>
              <p className="text-muted-foreground">
                Tap the <strong>+</strong> tab to add your first car.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cars.map((car: CarData) => {
              const status = getStatusBadge(car.status);
              return (
                <Card key={car.id} className="flex flex-col overflow-hidden">
                  {/* Image first on mobile for visual punch */}
                  <div className="bg-muted">
                    <AspectRatio ratio={16 / 9}>
                      {car.images?.[0] ? (
                        <img
                          src={car.images[0]}
                          alt={`${car.year} ${car.make} ${car.model} - Tesla car sharing vehicle in your fleet`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <CarIcon className="h-6 w-6" />
                        </div>
                      )}
                    </AspectRatio>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg leading-snug">
                          <span className="line-clamp-2 break-words">
                            {car.year} {car.make} {car.model}
                          </span>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {car.color} • {car.mileage.toLocaleString()} miles
                        </CardDescription>
                      </div>
                      <div className="shrink-0 text-right">
                        {status.badge}
                        {status.desc && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {status.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Location:</strong>{" "}
                        {car.location}
                      </p>
                      {car.description && (
                        <p className="text-muted-foreground line-clamp-2">
                          <strong className="text-foreground">
                            Description:
                          </strong>{" "}
                          {car.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(car.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="mt-auto pt-0">
                    <div className="w-full space-y-2">
                      {/* Primary row of actions: stretch nicely on mobile */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/cars/${car.id}/view`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>

                        {!car.is_shared && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShareCarId(car.id)}
                              title="Share"
                              aria-label="Share"
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setManageAccessCarId(car.id)}
                              title="Manage Access"
                              aria-label="Manage Access"
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Contextual CTA based on status */}
                      {!car.is_shared && (
                        <>
                          {car.status === "available" ? (
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() =>
                                navigate(`/select-host?carId=${car.id}`)
                              }
                            >
                              Request Hosting
                            </Button>
                          ) : car.status === "pending" ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full"
                              disabled
                            >
                              Request Sent
                            </Button>
                          ) : car.status === "hosted" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() =>
                                navigate(`/hosting-details/${car.id}`)
                              }
                              disabled={!car.host_id}
                              title={
                                !car.host_id
                                  ? "Host details unavailable"
                                  : undefined
                              }
                            >
                              View Host Contact
                            </Button>
                          ) : car.status === "ready_for_return" ? (
                            (() => {
                              const updatedAt = new Date(car.created_at);
                              const now = new Date();
                              const daysSinceRequest = Math.floor(
                                (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
                              );
                              const canCompleteReturn = daysSinceRequest >= 3;

                              return (
                                <div className="space-y-2">
                                  {canCompleteReturn && (
                                    <div className="mb-2 p-2 bg-muted rounded-md">
                                      <p className="text-xs text-muted-foreground flex items-start gap-1">
                                        <Info className="h-3 w-3 mt-0.5 shrink-0" />
                                        <span>
                                          Host hasn't confirmed return yet. You can complete it yourself.
                                        </span>
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <CancelReturnButton
                                      carId={car.id}
                                      afterSuccess={() => window.location.reload()}
                                      fullWidth={!canCompleteReturn}
                                    />
                                    {canCompleteReturn && (
                                      <CompleteReturnButton
                                        carId={car.id}
                                        carName={`${car.year} ${car.make} ${car.model}`}
                                        afterSuccess={() => window.location.reload()}
                                        fullWidth={false}
                                      />
                                    )}
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => navigate(`/cars/${car.id}/edit`)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* dialogs */}
        <ShareCarDialog
          carId={shareCarId}
          open={!!shareCarId}
          onOpenChange={(open) => setShareCarId(open ? shareCarId : null)}
        />
        <ManageCarAccessDialog
          carId={manageAccessCarId}
          open={!!manageAccessCarId}
          onOpenChange={(open) =>
            setManageAccessCarId(open ? manageAccessCarId : null)
          }
        />
      </div>
    </DashboardLayout>
  );
}
