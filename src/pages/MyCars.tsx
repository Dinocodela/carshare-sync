import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car as CarIcon,
  Eye,
  Share2,
  Settings,
  Info,
  Shield,
  Plus,
  ArrowUpRight,
  MapPin,
  Calendar,
  ChevronRight,
  Hash,
  CreditCard,
  XCircle,
  History,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useCars } from "@/hooks/useCars";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShareCarDialog } from "@/components/cars/ShareCarDialog";
import { ManageCarAccessDialog } from "@/components/cars/ManageCarAccessDialog";
import { CancelReturnButton } from "@/components/cars/CancelReturnButton";
import { CompleteReturnButton } from "@/components/cars/CompleteReturnButton";
import { CarBookingHistoryModal } from "@/components/cars/CarBookingHistoryModal";

/* ── helpers ── */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return mounted;
}

const STATUS_CFG: Record<string, { label: string; desc: string; color: string }> = {
  available: { label: "Available", desc: "Ready for hosting", color: "bg-emerald-500" },
  pending: { label: "Pending", desc: "Awaiting host response", color: "bg-amber-500" },
  hosted: { label: "Hosted", desc: "Currently hosted", color: "bg-primary" },
  ready_for_return: { label: "Returning", desc: "Return in progress", color: "bg-blue-500" },
  completed: { label: "Completed", desc: "Hosting complete", color: "bg-muted-foreground" },
};

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
  license_plate?: string | null;
  vin_number?: string | null;
  is_shared?: boolean;
}

export default function MyCars() {
  const navigate = useNavigate();
  const mounted = useMounted();
  const { cars, loading, refetch } = useCars();
  const { toast } = useToast();
  const [shareCarId, setShareCarId] = useState<string | null>(null);
  const [manageAccessCarId, setManageAccessCarId] = useState<string | null>(null);
  const [unhostCarId, setUnhostCarId] = useState<string | null>(null);
  const [unhosting, setUnhosting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "hosted" | "available">("all");
  const [bookingsCarId, setBookingsCarId] = useState<string | null>(null);
  const handleUnhost = async () => {
    if (!unhostCarId) return;
    setUnhosting(true);
    try {
      const { error } = await supabase
        .from("cars")
        .update({ status: "available", host_id: null })
        .eq("id", unhostCarId);
      if (error) throw error;
      toast({ title: "Removed from hosting", description: "The car is now marked available." });
      setUnhostCarId(null);
      refetch();
    } catch (err: any) {
      toast({ title: "Failed to remove", description: err.message ?? "Try again.", variant: "destructive" });
    } finally {
      setUnhosting(false);
    }
  };

  const fadeIn = (idx: number) =>
    ({
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(12px)",
      transition: `all 500ms cubic-bezier(0.23,1,0.32,1) ${idx * 80}ms`,
    } as React.CSSProperties);

  const totalCars = cars.length;
  const hostedCars = cars.filter((c: CarData) => c.status === "hosted").length;
  const availableCars = cars.filter((c: CarData) => c.status === "available").length;
  const filteredCars =
    statusFilter === "all"
      ? cars
      : statusFilter === "hosted"
      ? cars.filter((c: CarData) => c.status === "hosted")
      : cars.filter((c: CarData) => c.status === "available");

  if (loading) {
    return (
      <DashboardLayout>
        <PageContainer>
          <div className="space-y-4 py-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageContainer>
        <div className="space-y-5 pb-4">
          {/* ─── Trust Banner ─── */}
          <div
            style={fadeIn(0)}
            className="relative overflow-hidden rounded-2xl bg-gradient-primary p-5 text-primary-foreground"
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium opacity-90 uppercase tracking-wider">
                  My Fleet
                </span>
              </div>
              <p className="text-lg font-bold leading-snug">
                {totalCars === 0
                  ? "Start building your fleet"
                  : `${totalCars} vehicle${totalCars !== 1 ? "s" : ""} in your fleet`}
              </p>
              <p className="text-xs opacity-80">
                Fully insured · 24/7 support · Verified hosts
              </p>
            </div>
          </div>

          {/* ─── Stat Pills ─── */}
          <div style={fadeIn(1)} className="grid grid-cols-3 gap-3">
            {[
              { key: "all" as const, label: "Total", value: totalCars, accent: "bg-primary/10 text-primary", icon: CarIcon },
              { key: "hosted" as const, label: "Hosted", value: hostedCars, accent: "bg-emerald-50 text-emerald-600", icon: Shield },
              { key: "available" as const, label: "Available", value: availableCars, accent: "bg-amber-50 text-amber-600", icon: Plus },
            ].map((stat, i) => {
              const isActive = statusFilter === stat.key;
              return (
                <button
                  key={stat.label}
                  type="button"
                  onClick={() => setStatusFilter(stat.key)}
                  style={fadeIn(i + 2)}
                  aria-pressed={isActive}
                  className={`rounded-2xl bg-card/80 backdrop-blur-sm border p-4 text-left transition-all hover:border-primary/40 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    isActive ? "border-primary ring-2 ring-primary/20" : "border-border/60"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl ${stat.accent} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-[18px] h-[18px]" />
                  </div>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
                </button>
              );
            })}
          </div>

          {/* ─── Empty state ─── */}
          {cars.length === 0 ? (
            <div
              style={fadeIn(5)}
              className="rounded-2xl border border-dashed border-border/80 bg-card/60 backdrop-blur-sm p-10 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CarIcon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No vehicles yet</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                Add your first vehicle and start earning with a trusted host.
              </p>
              <Button onClick={() => navigate("/add-car")} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Car
              </Button>
            </div>
          ) : (
            <>
              {/* ─── Section title ─── */}
              <div style={fadeIn(5)} className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-foreground">
                  {statusFilter === "all"
                    ? "Your Vehicles"
                    : statusFilter === "hosted"
                    ? "Hosted Vehicles"
                    : "Available Vehicles"}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {filteredCars.length} {statusFilter === "all" ? "total" : "shown"}
                  </span>
                  {statusFilter !== "all" && (
                    <button
                      type="button"
                      onClick={() => setStatusFilter("all")}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* ─── Car Cards ─── */}
              <div className="space-y-4">
                {filteredCars.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No {statusFilter} vehicles right now.
                    </p>
                  </div>
                ) : null}
                {filteredCars.map((car: CarData, idx: number) => {
                  const cfg = STATUS_CFG[car.status] ?? { label: car.status, desc: "", color: "bg-muted-foreground" };

                  return (
                    <div
                      key={car.id}
                      style={fadeIn(idx + 6)}
                      className="group rounded-2xl bg-card/80 backdrop-blur-sm border border-border/60 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20"
                    >
                      {/* Image */}
                      <div className="relative">
                        <AspectRatio ratio={16 / 9}>
                          {car.images?.[0] ? (
                            <img
                              src={car.images[0]}
                              alt={`${car.year} ${car.make} ${car.model}`}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <CarIcon className="w-10 h-10 text-muted-foreground/40" />
                            </div>
                          )}
                        </AspectRatio>

                        {/* Status pill overlay */}
                        <div className="absolute top-3 left-3">
                          <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-md rounded-full px-3 py-1.5 border border-border/40">
                            <div className={`w-2 h-2 rounded-full ${cfg.color}`} />
                            <span className="text-xs font-medium text-foreground">{cfg.label}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-foreground leading-snug line-clamp-1">
                              {car.year} {car.make} {car.model}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {car.color}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {car.mileage?.toLocaleString()} mi
                              </span>
                            </div>
                          </div>
                          {!car.is_shared && (
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={() => setShareCarId(car.id)}
                                className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
                                title="Share"
                              >
                                <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                              <button
                                onClick={() => setManageAccessCarId(car.id)}
                                className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
                                title="Manage Access"
                              >
                                <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {car.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(car.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>

                        {/* Identifiers */}
                        {(car.license_plate || car.vin_number) && !car.is_shared && (
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            {car.license_plate && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 font-mono text-foreground">
                                <CreditCard className="w-3 h-3 text-muted-foreground" />
                                {car.license_plate}
                              </span>
                            )}
                            {car.vin_number && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 font-mono text-foreground">
                                <Hash className="w-3 h-3 text-muted-foreground" />
                                {car.vin_number}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="pt-1 space-y-2">
                          {/* View button always visible */}
                          <button
                            onClick={() => navigate(`/cars/${car.id}/view`)}
                            className="w-full flex items-center justify-between rounded-xl bg-muted/50 hover:bg-muted px-4 py-3 transition-colors group/view"
                          >
                            <div className="flex items-center gap-2.5">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">View Details</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover/view:translate-x-0.5 transition-transform" />
                          </button>

                          {/* Booking history */}
                          <button
                            onClick={() => setBookingsCarId(car.id)}
                            className="w-full flex items-center justify-between rounded-xl bg-muted/50 hover:bg-muted px-4 py-3 transition-colors group/hist"
                          >
                            <div className="flex items-center gap-2.5">
                              <History className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">View Bookings</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover/hist:translate-x-0.5 transition-transform" />
                          </button>
                          {/* Contextual CTA */}
                          {!car.is_shared && (
                            <>
                              {car.status === "available" && (
                                <Button
                                  size="sm"
                                  className="w-full rounded-xl h-11 gap-2"
                                  onClick={() => navigate(`/select-host?carId=${car.id}`)}
                                >
                                  <Shield className="w-4 h-4" />
                                  Request Hosting
                                </Button>
                              )}
                              {car.status === "pending" && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="w-full rounded-xl h-11"
                                  disabled
                                >
                                  Request Sent — Awaiting Response
                                </Button>
                              )}
                              {car.status === "hosted" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full rounded-xl h-11 gap-2"
                                    onClick={() => navigate(`/hosting-details/${car.id}`)}
                                    disabled={!car.host_id}
                                  >
                                    <ArrowUpRight className="w-4 h-4" />
                                    View Host Contact
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full rounded-xl h-10 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setUnhostCarId(car.id)}
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Remove from Hosting
                                  </Button>
                                </>
                              )}
                              {car.status === "pending" && car.host_id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full rounded-xl h-10 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => setUnhostCarId(car.id)}
                                >
                                  <XCircle className="w-4 h-4" />
                                  Cancel & Remove from Hosting
                                </Button>
                              )}
                              {car.status === "ready_for_return" && (() => {
                                const updatedAt = new Date(car.created_at);
                                const daysSince = Math.floor((Date.now() - updatedAt.getTime()) / 86400000);
                                const canComplete = daysSince >= 3;

                                return (
                                  <div className="space-y-2">
                                    {canComplete && (
                                      <div className="p-3 bg-muted/60 rounded-xl">
                                        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                                          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                                          Host hasn't confirmed return yet. You can complete it yourself.
                                        </p>
                                      </div>
                                    )}
                                    <div className="flex gap-2">
                                      <CancelReturnButton
                                        carId={car.id}
                                        afterSuccess={() => window.location.reload()}
                                        fullWidth={!canComplete}
                                      />
                                      {canComplete && (
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
                              })()}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </PageContainer>

      {/* Dialogs */}
      <ShareCarDialog
        carId={shareCarId}
        open={!!shareCarId}
        onOpenChange={(open) => setShareCarId(open ? shareCarId : null)}
      />
      <ManageCarAccessDialog
        carId={manageAccessCarId}
        open={!!manageAccessCarId}
        onOpenChange={(open) => setManageAccessCarId(open ? manageAccessCarId : null)}
      />

      <AlertDialog open={!!unhostCarId} onOpenChange={(o) => !o && setUnhostCarId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this car from hosting?</AlertDialogTitle>
            <AlertDialogDescription>
              The car will be marked as available and unassigned from its current host. Use this if you've sold the car or no longer want it hosted. You can request hosting again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unhosting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleUnhost();
              }}
              disabled={unhosting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {unhosting ? "Removing..." : "Remove from Hosting"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
