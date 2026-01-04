/* eslint-disable @typescript-eslint/no-unused-expressions */
// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCars, useHostCars } from "@/hooks/useCars";
import { useProfile } from "@/hooks/useProfile";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Car, FileText, TrendingUp, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

/* ---------- helpers ---------- */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return mounted;
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

/* ---------- recent activity (client + host) ---------- */
function useRecentActivity(
  userId?: string,
  role?: "client" | "host",
  limit = 8
) {
  const [items, setItems] = useState<
    { id: string; ts: string; message: string }[]
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
                .select("id, net_amount, host_profit_percentage, payment_date, payment_status")
                .eq("payment_status", "paid")
                .order("payment_date", { ascending: false })
                .limit(limit)
            : { data: [] as any[] };

        const mapped: { id: string; ts: string; message: string }[] = [];

        (cars || []).forEach((c) =>
          mapped.push({
            id: `car_${c.id}`,
            ts: c.created_at,
            message: `🚗 ${c.make} ${c.model} was added to your cars`,
          })
        );

        (reqs || []).forEach((r) => {
          mapped.push({
            id: `req_new_${r.id}`,
            ts: r.created_at,
            message:
              role === "host"
                ? "📩 New hosting request received"
                : "📩 You sent a hosting request",
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
                  ? `✅ You ${status} a hosting request`
                  : `✅ Your request was ${status}`,
            });
          }
        });

        (earns || []).forEach((e) => {
          if (!e.payment_date) return;
          const hostProfit = ((e.net_amount || 0) * (e.host_profit_percentage || 30)) / 100;
          mapped.push({
            id: `earn_${e.id}`,
            ts: e.payment_date,
            message: `💵 You received $${Number(hostProfit).toLocaleString()} payout`,
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
  console.log("dashboard");

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

  const isAdmin = profile?.is_super_admin;
  const [pendingAccounts, setPendingAccounts] = useState<number>(0);

  // fetch (only for super admins)
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!isAdmin) return;
      // verify super admin
      const { data: me } = await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!me?.is_super_admin) return;

      setPendingLoading(true);
      try {
        // 1) latest 11 so we can decide to show "View more"
        const { data: latest } = await supabase
          .from("profiles")
          .select("user_id,email,requested_at")
          .eq("account_status", "pending")
          .order("requested_at", { ascending: false })
          .limit(11);

        if (!cancel) setRecentPending(latest ?? []);

        // 2) total count using head:true to avoid payload
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

  // Earnings (7d) for host and client
  const [earn7Host, setEarn7Host] = useState(0);
  const [earn7Client, setEarn7Client] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) return;
      const from = new Date();
      from.setDate(from.getDate() - 7);

      if (isHost) {
        const { data: rows } = await supabase
          .from("host_earnings")
          .select("net_amount, host_profit_percentage, payment_status, payment_date")
          .eq("payment_status", "paid")
          .gte("payment_date", from.toISOString());
        const total = (rows || []).reduce(
          (s, r) => s + ((r.net_amount || 0) * (r.host_profit_percentage || 30)) / 100,
          0
        );
        if (!cancelled) setEarn7Host(total);
      } else {
        // client: calculate client profit on the fly from net_amount and percentage
        const carIds = (clientData?.cars || []).map((c: any) => c.id);
        if (carIds.length) {
          const { data: rows } = await supabase
            .from("host_earnings")
            .select(
              "net_amount, client_profit_percentage, payment_status, payment_date, car_id"
            )
            .eq("payment_status", "paid")
            .gte("payment_date", from.toISOString())
            .in("car_id", carIds);
          const total = (rows || []).reduce(
            (s, r) => s + ((r.net_amount || 0) * (r.client_profit_percentage || 70)) / 100,
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
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  const displayName =
    profile.role === "host"
      ? profile.company_name || profile.first_name || "Host"
      : profile.first_name || "Client";

  // Stats
  const myVehicles = data.cars.length;
  const pendingReqs = data.requests.filter(
    (r) => r.status === "pending"
  ).length;
  const activeCars = data.cars.filter((c) => c.status === "hosted").length;

  // Base + animation (stagger)
  const cardBase = `rounded-2xl border border-primary/10 bg-white/80 backdrop-blur shadow-sm 
     hover:shadow-lg hover:-translate-y-[1px] transition-all duration-300 cursor-pointer`;

  const AnimatedCard: React.FC<{
    delayIdx?: number;
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
  }> = ({ delayIdx = 0, className = "", children, onClick }) => (
    <div
      onClick={onClick}
      className={`${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      } transition-all`}
      style={{
        transitionDuration: "450ms",
        transitionDelay: `${delayIdx * 60}ms`,
      }}
    >
      <Card className={`${cardBase} ${className}`}>{children}</Card>
    </div>
  );

  const StatHeader: React.FC<{
    title: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
  }> = ({ title, icon, iconBg, iconColor }) => (
    <CardHeader className="pb-1 flex items-center justify-center">
      <div className="flex items-center gap-2 min-w-0">
        <div
          className={`rounded-lg ${iconBg} p-2 flex items-center justify-center`}
        >
          <div className={`${iconColor}`}>{icon}</div>
        </div>
        <CardTitle className="text-sm">{title}</CardTitle>
      </div>
    </CardHeader>
  );

  /* ------------- render ------------- */
  return (
    <DashboardLayout>
      <PageContainer>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-foreground mb-1 text-center sm:text-left break-words">
              Welcome back,{" "}
              <span className="whitespace-nowrap">{displayName}!</span>
            </h1>
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              {isHost
                ? "Manage your hosted vehicles and client relationships from your dashboard."
                : "Track your vehicles and manage your hosting requests from your dashboard."}
            </p>
          </div>

          {/* Stat Grid — 2 cols on all, 3 on lg */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {/* Card 1 */}
            <AnimatedCard 
              delayIdx={0}
              onClick={() => navigate(isHost ? "/host-car-management" : "/my-cars")}
            >
              <StatHeader
                title={isHost ? "Active Vehicles" : "My Vehicles"}
                icon={<Car className="h-5 w-5" />}
                iconBg="bg-primary/10"
                iconColor="text-primary"
              />
              <CardContent>
                <div className="text-3xl p-2 font-extrabold tracking-tight text-center">
                  {isHost ? activeCars : myVehicles}
                </div>
                <p className="text-xs mt-2 text-center text-muted-foreground">
                  {isHost ? "Currently under your care" : "Registered vehicles"}
                </p>
              </CardContent>
            </AnimatedCard>

            {/* Card 2 (Requests) */}
            <AnimatedCard
              onClick={() => navigate(isHost ? "/host-requests" : "/select-host")}
              delayIdx={1}
            >
              <StatHeader
                title="Requests"
                icon={<FileText className="h-5 w-5" />}
                iconBg="bg-amber-100"
                iconColor="text-amber-600"
              />
              <CardContent>
                <div className="text-3xl p-2 font-extrabold tracking-tight text-center">
                  {pendingReqs}
                </div>
                <p className="text-xs mt-2 text-center text-muted-foreground">
                  {isHost ? "Awaiting your response" : "Pending host approval"}
                </p>
              </CardContent>
            </AnimatedCard>

            {/* Card 3 (Active Cars for client; Active Cars again for host keeps 4-up grid symmetry) */}
            <AnimatedCard 
              delayIdx={2}
              onClick={() => navigate(isHost ? "/host-analytics" : "/client-analytics")}
            >
              <StatHeader
                title="Active Cars"
                icon={<TrendingUp className="h-5 w-5" />}
                iconBg="bg-emerald-100"
                iconColor="text-emerald-600"
              />
              <CardContent>
                <div className="text-3xl p-2 font-extrabold tracking-tight text-center">
                  {activeCars}
                </div>
                <p className="text-xs mt-2 text-center text-muted-foreground">
                  Currently hosted
                </p>
              </CardContent>
            </AnimatedCard>

            {/* Card 4 (Earnings 7d) – both roles */}
            <AnimatedCard 
              delayIdx={3}
              onClick={() => navigate(isHost ? "/host-analytics" : "/client-analytics")}
            >
              <StatHeader
                title="Earnings"
                icon={<BarChart3 className="h-5 w-5" />}
                iconBg="bg-sky-100"
                iconColor="text-sky-700"
              />
              <CardContent>
                <div className="text-3xl p-2 font-extrabold tracking-tight text-center">
                  ${(isHost ? earn7Host : earn7Client).toLocaleString()}
                </div>
                <p className="text-xs mt-2 text-center text-muted-foreground">
                  Last 7 days
                </p>
              </CardContent>
            </AnimatedCard>
          </div>

          {isAdmin && (
            <AnimatedCard delayIdx={5}>
              <Card className="overflow-hidden">
                <CardHeader
                  onClick={() =>
                    !pendingLoading ? navigate("/admin/manage-accounts") : null
                  }
                  className="p-4 border-b"
                >
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="text-lg">Pending Accounts</CardTitle>
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      {pendingLoading ? "…" : pendingCount}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {pendingLoading ? (
                    <div className="p-4 text-sm text-muted-foreground">
                      Loading…
                    </div>
                  ) : pendingCount === 0 ? (
                    <div className="p-6 text-sm text-muted-foreground">
                      No pending accounts 🎉
                    </div>
                  ) : (
                    <>
                      <ul className="divide-y">
                        {recentPending.slice(0, 10).map((u) => (
                          <li key={u.user_id}>
                            <button
                              onClick={() => navigate("/admin/manage-accounts")}
                              className="w-full text-left px-4 py-3 hover:bg-muted/60 transition"
                              title="Review account request"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-sm font-medium truncate">
                                  {u.email || "(no email)"}
                                </div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                  {timeAgo(u.requested_at)}
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>

                      {Math.max(pendingCount, recentPending.length) > 10 && (
                        <div className="p-3">
                          <Button
                            className="w-full"
                            onClick={() => navigate("/admin/manage-accounts")}
                          >
                            View more
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>
          )}

          {/* Recent Activity */}
          <div className="grid grid-cols-1 gap-4">
            <AnimatedCard delayIdx={4}>
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {actLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading activity…
                  </div>
                ) : activity.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    🎉 You’re all caught up — nothing new right now!
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {activity.map((a) => (
                      <li
                        key={a.id}
                        className="text-sm flex items-start justify-between gap-3 border-b last:border-b-0 pb-3"
                      >
                        <span className="leading-snug">{a.message}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {timeAgo(a.ts)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </AnimatedCard>

            {/* Optional CTA for clients */}
            {!isHost && (
              <AnimatedCard delayIdx={5}>
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-lg">Do this next</CardTitle>
                  <CardDescription>Keep your garage up to date</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-2">
                  <Button
                    onClick={() => navigate("/add-car")}
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Your Vehicle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate("/my-cars")}
                  >
                    <Car className="h-4 w-4 mr-2" /> View My Cars
                  </Button>
                </CardContent>
              </AnimatedCard>
            )}
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
