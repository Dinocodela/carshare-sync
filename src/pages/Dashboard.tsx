/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCars, useHostCars } from "@/hooks/useCars";
import { useProfile } from "@/hooks/useProfile";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Car,
  FileText,
  TrendingUp,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Shield,
  Clock,
  Sparkles,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

/* ---------- helpers ---------- */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return mounted;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function timeAgo(iso?: string) {
  if (!iso) return "";
  const now = new Date().getTime();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  let unit: Intl.RelativeTimeFormatUnit = "second";
  let val = diff;
  for (const [s, u] of steps) {
    if (val < s) {
      unit = u;
      break;
    }
    val /= s;
  }
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  return rtf.format(-Math.max(1, Math.floor(val)), unit);
}

/* ---------- recent activity ---------- */
function useRecentActivity(
  userId?: string,
  role?: "client" | "host",
  limit = 8
) {
  const [items, setItems] = useState<
    { id: string; ts: string; message: string; icon: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !role) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: cars } = await supabase
          .from("cars")
          .select("id, make, model, created_at, client_id")
          .eq("client_id", userId)
          .order("created_at", { ascending: false })
          .limit(limit);

        const { data: reqs } = await supabase
          .from("requests")
          .select("id, status, created_at, updated_at, client_id, host_id")
          .or(`client_id.eq.${userId},host_id.eq.${userId}`)
          .order("created_at", { ascending: false })
          .limit(limit);

        const { data: earns } =
          role === "host"
            ? await supabase
                .from("host_earnings")
                .select("id, amount, host_profit_percentage, date_paid, payment_status")
                .eq("payment_status", "paid")
                .order("date_paid", { ascending: false })
                .limit(limit)
            : { data: [] as any[] };

        const mapped: { id: string; ts: string; message: string; icon: string }[] = [];

        (cars || []).forEach((c) =>
          mapped.push({
            id: `car_${c.id}`,
            ts: c.created_at,
            message: `${c.make} ${c.model} added to your fleet`,
            icon: "🚗",
          })
        );

        (reqs || []).forEach((r) => {
          mapped.push({
            id: `req_new_${r.id}`,
            ts: r.created_at,
            message:
              role === "host"
                ? "New hosting request received"
                : "Hosting request sent",
            icon: "📩",
          });
          if (r.updated_at && r.updated_at !== r.created_at) {
            const status =
              r.status === "accepted"
                ? "accepted"
                : r.status === "rejected"
                ? "rejected"
                : r.status;
            mapped.push({
              id: `req_status_${r.id}`,
              ts: r.updated_at,
              message:
                role === "host"
                  ? `You ${status} a hosting request`
                  : `Your request was ${status}`,
              icon: "✅",
            });
          }
        });

        (earns || []).forEach((e) => {
          if (!e.date_paid) return;
          const hostProfit = ((e.amount || 0) * (e.host_profit_percentage || 30)) / 100;
          mapped.push({
            id: `earn_${e.id}`,
            ts: e.date_paid,
            message: `Received $${Number(hostProfit).toLocaleString()} payout`,
            icon: "💵",
          });
        });

        mapped.sort((a, b) => (a.ts > b.ts ? -1 : 1));
        if (!cancelled) setItems(mapped.slice(0, limit));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, role, limit]);

  return { items, loading };
}

/* ---------- component ---------- */
export default function Dashboard() {
  const mounted = useMounted();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { toast } = useToast();

  const [pendingCount, setPendingCount] = useState(0);
  const [recentPending, setRecentPending] = useState<
    { user_id: string; email: string | null; requested_at: string }[]
  >([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [tripsOpen, setTripsOpen] = useState(true);
  const [activityOpen, setActivityOpen] = useState(true);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);

  // Only host super-admins can see pending accounts
  const isAdmin = profile?.is_super_admin && profile?.role === "host";
  const [pendingAccounts, setPendingAccounts] = useState<number>(0);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!isAdmin) return;
      const { data: me } = await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!me?.is_super_admin) return;

      setPendingLoading(true);
      try {
        const { data: latest } = await supabase
          .from("profiles")
          .select("user_id,email,requested_at")
          .eq("account_status", "pending")
          .order("requested_at", { ascending: false })
          .limit(11);

        if (!cancel) setRecentPending(latest ?? []);

        const { count, error: countErr } = await supabase
          .from("profiles")
          .select("user_id", { count: "exact", head: true })
          .eq("account_status", "pending");

        if (countErr) throw countErr;
        if (!cancel) setPendingCount(count ?? 0);
      } catch (e: any) {
        if (!cancel)
          toast({
            title: "Failed to load pending accounts",
            description: String(e?.message ?? e),
            variant: "destructive",
          });
      } finally {
        if (!cancel) setPendingLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [isAdmin]);

  const clientData = useCars();
  const hostData = useHostCars();

  const isHost = profile?.role === "host";
  const data = isHost ? hostData : clientData;

  // Earnings (30d)
  const [earn7Host, setEarn7Host] = useState(0);
  const [earn7Client, setEarn7Client] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) return;
      const from = new Date();
      from.setDate(from.getDate() - 30);

      if (isHost) {
        const { data: rows } = await supabase
          .from("host_earnings")
          .select("amount, host_profit_percentage, payment_status, payment_date")
          .eq("payment_status", "paid")
          .gte("payment_date", from.toISOString());
        const total = (rows || []).reduce(
          (s, r) => s + ((r.amount || 0) * (r.host_profit_percentage || 30)) / 100,
          0
        );
        if (!cancelled) setEarn7Host(total);
      } else {
        const carIds = (clientData?.cars || []).map((c: any) => c.id);
        if (carIds.length) {
          const { data: rows } = await supabase
            .from("host_earnings")
            .select(
              "amount, client_profit_percentage, payment_status, payment_date, car_id"
            )
            .eq("payment_status", "paid")
            .gte("payment_date", from.toISOString())
            .in("car_id", carIds);
          const total = (rows || []).reduce(
            (s, r) => s + ((r.amount || 0) * (r.client_profit_percentage || 70)) / 100,
            0
          );
          if (!cancelled) setEarn7Client(total);
        } else {
          if (!cancelled) setEarn7Client(0);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, isHost, clientData?.cars]);

  // Recent trips
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id || !profile) return;
      setTripsLoading(true);
      try {
        if (isHost) {
          const { data: rows } = await supabase
            .from("host_earnings")
            .select("id, trip_id, guest_name, amount, host_profit_percentage, payment_status, earning_period_start, earning_period_end, car_id")
            .order("earning_period_end", { ascending: false })
            .limit(5);
          if (!cancelled) setRecentTrips(rows || []);
        } else {
          const carIds = (clientData?.cars || []).map((c: any) => c.id);
          if (carIds.length) {
            const { data: rows } = await supabase
              .from("host_earnings")
              .select("id, trip_id, guest_name, amount, client_profit_percentage, payment_status, earning_period_start, earning_period_end, car_id")
              .in("car_id", carIds)
              .order("earning_period_end", { ascending: false })
              .limit(5);
            if (!cancelled) setRecentTrips(rows || []);
          } else {
            if (!cancelled) setRecentTrips([]);
          }
        }
      } finally {
        if (!cancelled) setTripsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, isHost, clientData?.cars, profile]);

  const roleForActivity = (isHost ? "host" : "client") as "client" | "host";
  const { items: activity, loading: actLoading } = useRecentActivity(
    user?.id,
    roleForActivity,
    8
  );

  if (!user || profileLoading || !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-muted-foreground">Loading your dashboard…</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const displayName =
    profile.role === "host"
      ? profile.company_name || profile.first_name || "Host"
      : profile.first_name || "Client";

  const myVehicles = data.cars.length;
  const pendingReqs = data.requests.filter((r) => r.status === "pending").length;
  const activeCars = data.cars.filter((c) => c.status === "hosted").length;

  const earnings7d = isHost ? earn7Host : earn7Client;

  // Fade-in helper
  const fadeIn = (idx: number) =>
    ({
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(12px)",
      transition: `all 500ms cubic-bezier(0.23,1,0.32,1) ${idx * 80}ms`,
    } as React.CSSProperties);

  return (
    <DashboardLayout>
      <PageContainer>
        <div className="space-y-6 pb-4">
          {/* ─── Greeting ─── */}
          <div style={fadeIn(0)} className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">
              {getGreeting()} 👋
            </p>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {displayName}
            </h1>
          </div>

          {/* ─── Trust Banner ─── */}
          <div
            style={fadeIn(1)}
            className="relative overflow-hidden rounded-2xl bg-gradient-primary p-5 text-primary-foreground"
          >
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium opacity-90 uppercase tracking-wider">
                    {isHost ? "Host Dashboard" : "Owner Dashboard"}
                  </span>
                </div>
                <p className="text-lg font-bold leading-snug">
                  {isHost
                    ? "Your vehicles are in good hands"
                    : "Your fleet is protected & earning"}
                </p>
                <p className="text-xs opacity-80">
                  Fully insured · 24/7 support · Verified guests
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-center">
                <span className="text-3xl font-extrabold tracking-tight">
                  ${earnings7d.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] opacity-75 font-medium">This month</span>
              </div>
            </div>
          </div>

          {/* ─── Stat Cards ─── */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: isHost ? "Active" : "Vehicles",
                value: isHost ? activeCars : myVehicles,
                icon: Car,
                onClick: () => navigate(isHost ? "/host-car-management" : "/my-cars"),
                accent: "bg-primary/10 text-primary",
              },
              {
                label: "Requests",
                value: pendingReqs,
                icon: FileText,
                onClick: () => navigate(isHost ? "/host-requests" : "/select-host"),
                accent: "bg-amber-50 text-amber-600",
              },
              {
                label: "Hosted",
                value: activeCars,
                icon: TrendingUp,
                onClick: () => navigate(isHost ? "/host-analytics" : "/client-analytics"),
                accent: "bg-emerald-50 text-emerald-600",
              },
            ].map((stat, i) => (
              <button
                key={stat.label}
                onClick={stat.onClick}
                style={fadeIn(i + 2)}
                className="group relative rounded-2xl bg-card border border-border/60 p-4 text-left transition-all duration-200 hover:shadow-md hover:border-primary/20 active:scale-[0.97]"
              >
                <div className={`w-9 h-9 rounded-xl ${stat.accent} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-[18px] h-[18px]" />
                </div>
                <p className="text-2xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                  {stat.label}
                </p>
                <ArrowUpRight className="absolute top-3 right-3 w-3.5 h-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* ─── Quick Actions ─── */}
          <div style={fadeIn(5)} className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground px-1">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate(isHost ? "/host-analytics" : "/client-analytics")}
                className="flex items-center gap-3 rounded-xl bg-card border border-border/60 p-3.5 text-left transition-all hover:shadow-sm hover:border-primary/20 active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Analytics</p>
                  <p className="text-[11px] text-muted-foreground">View insights</p>
                </div>
              </button>

              {!isHost ? (
                <button
                  onClick={() => navigate("/add-car")}
                  className="flex items-center gap-3 rounded-xl bg-card border border-border/60 p-3.5 text-left transition-all hover:shadow-sm hover:border-primary/20 active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Add Vehicle</p>
                    <p className="text-[11px] text-muted-foreground">List a new car</p>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => navigate("/registered-clients")}
                  className="flex items-center gap-3 rounded-xl bg-card border border-border/60 p-3.5 text-left transition-all hover:shadow-sm hover:border-primary/20 active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Clients</p>
                    <p className="text-[11px] text-muted-foreground">Manage owners</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* ─── Admin: Pending Accounts ─── */}
          {isAdmin && (
            <div style={fadeIn(6)} className="rounded-2xl bg-card border border-border/60 overflow-hidden">
              <button
                onClick={() => !pendingLoading && navigate("/admin/manage-accounts")}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Shield className="w-[18px] h-[18px] text-destructive" />
                  </div>
                  <span className="font-semibold text-sm">Pending Accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
                    {pendingLoading ? "…" : pendingCount}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>

              {!pendingLoading && pendingCount > 0 && (
                <div className="border-t divide-y">
                  {recentPending.slice(0, 5).map((u) => (
                    <button
                      key={u.user_id}
                      onClick={() => navigate("/admin/manage-accounts")}
                      className="w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3"
                    >
                      <span className="text-sm font-medium truncate">
                        {u.email || "(no email)"}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {timeAgo(u.requested_at)}
                      </span>
                    </button>
                  ))}
                  {pendingCount > 5 && (
                    <div className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full rounded-xl"
                        onClick={() => navigate("/admin/manage-accounts")}
                      >
                        View all {pendingCount} accounts
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─── Recent Trips ─── */}
          <Collapsible open={tripsOpen} onOpenChange={setTripsOpen}>
            <div style={fadeIn(7)} className="space-y-3">
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between px-1 group">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    Recent Trips
                  </h2>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${tripsOpen ? "rotate-0" : "-rotate-90"}`} />
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
                  {tripsLoading ? (
                    <div className="p-5 flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading trips…</span>
                    </div>
                  ) : recentTrips.length === 0 ? (
                    <div className="p-6 text-center">
                      <Car className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No trips yet</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-border/50">
                      {recentTrips.map((t) => {
                        const pct = isHost ? (t.host_profit_percentage || 30) : (t.client_profit_percentage || 70);
                        const earned = ((t.amount || 0) * pct) / 100;
                        const start = t.earning_period_start ? new Date(t.earning_period_start).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
                        const end = t.earning_period_end ? new Date(t.earning_period_end).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
                        return (
                          <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {t.guest_name || t.trip_id || "Trip"}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {start}{start && end ? " – " : ""}{end}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-semibold text-foreground">${Number(earned).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 rounded-full ${t.payment_status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                {t.payment_status}
                              </Badge>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* ─── Recent Activity ─── */}
          <Collapsible open={activityOpen} onOpenChange={setActivityOpen}>
            <div style={fadeIn(8)} className="space-y-3">
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between px-1 group">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    Recent Activity
                  </h2>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${activityOpen ? "rotate-0" : "-rotate-90"}`} />
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
                  {actLoading ? (
                    <div className="p-5 flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading activity…</span>
                    </div>
                  ) : activity.length === 0 ? (
                    <div className="p-6 text-center">
                      <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        You're all caught up — nothing new!
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-border/50">
                      {activity.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors"
                        >
                          <span className="text-base shrink-0 mt-0.5">{a.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground leading-snug">
                              {a.message}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {timeAgo(a.ts)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
