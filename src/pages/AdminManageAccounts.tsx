import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Shield,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Clock,
  Users,
  Mail,
  UserCheck,
  AlertTriangle,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";

type PendingUser = {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  requested_at: string;
};

export default function AdminManageAccounts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<PendingUser[]>([]);
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<{
    id: string;
    email?: string | null;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fadeIn = (idx: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(12px)",
    transition: `all 500ms cubic-bezier(0.23,1,0.32,1) ${idx * 80}ms`,
  });

  useEffect(() => {
    (async () => {
      const { data: me } = await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("user_id", user?.id)
        .single();
      if (!me?.is_super_admin) {
        toast({ title: "Access denied", variant: "destructive" });
        return;
      }
      const { data, error } = await supabase.functions.invoke(
        "admin-list-pending-accounts",
        { body: {} }
      );
      if (error) toast({ title: "Load error", variant: "destructive" });
      setItems(data?.items ?? []);
      setLoading(false);
    })();
  }, [user?.id]);

  async function approve(uid: string) {
    setProcessing(uid);
    try {
      const { error } = await supabase.functions.invoke(
        "admin-approve-account",
        { body: { userId: uid, reason: undefined } }
      );
      if (error) throw error;
      setItems((prev) => prev.filter((x) => x.user_id !== uid));
      toast({ title: "Account approved ✓" });
    } catch (e: any) {
      toast({
        title: "Action failed",
        description: String(e?.message ?? e),
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }

  async function confirmReject() {
    if (!confirmUser) return;
    setProcessing(confirmUser.id);
    try {
      const { error } = await supabase.functions.invoke(
        "admin-reject-account",
        { body: { userId: confirmUser.id || undefined } }
      );
      if (error) throw error;
      setItems((prev) => prev.filter((x) => x.user_id !== confirmUser.id));
      toast({ title: "Account rejected" });
    } catch (e: any) {
      toast({
        title: "Action failed",
        description: String(e?.message ?? e),
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
      setConfirmOpen(false);
      setConfirmUser(null);
    }
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }

  function getInitials(first?: string | null, last?: string | null) {
    const f = first?.charAt(0)?.toUpperCase() ?? "";
    const l = last?.charAt(0)?.toUpperCase() ?? "";
    return f + l || "?";
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading accounts…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageContainer className="space-y-5 py-2">
        {/* Header */}
        <header style={fadeIn(0)} className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-xl"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Manage Accounts
            </h1>
            <p className="text-xs text-muted-foreground">
              Review pending account requests
            </p>
          </div>
        </header>

        {/* Trust banner */}
        <div
          style={fadeIn(1)}
          className="rounded-2xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-foreground">
                Account Verification
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review and verify new account requests. All actions are logged
                for security compliance.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 pl-[52px]">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Lock className="w-3 h-3" /> Audit Logged
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Shield className="w-3 h-3" /> Admin Only
            </span>
          </div>
        </div>

        {/* Stats bar */}
        <div
          style={fadeIn(2)}
          className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {items.length}
                </p>
                <p className="text-[10px] text-muted-foreground leading-none">
                  Pending
                </p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Awaiting your review
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account list */}
        {items.length === 0 ? (
          <div
            style={fadeIn(3)}
            className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-10 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              All Caught Up
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              No pending account requests. New requests will appear here
              automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((u, i) => (
              <div
                key={u.user_id}
                style={fadeIn(3 + i)}
                className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-3 transition-all duration-200 hover:border-primary/20 hover:shadow-sm"
              >
                {/* User info row */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {getInitials(u.first_name, u.last_name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {u.first_name || u.last_name
                          ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
                          : "New User"}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0 border-amber-500/30 text-amber-600 bg-amber-500/5 shrink-0"
                      >
                        Pending
                      </Badge>
                    </div>
                    {u.email && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">
                          {u.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Requested {formatDate(u.requested_at)}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 h-10 rounded-xl text-xs font-semibold shadow-sm shadow-primary/10"
                    disabled={processing === u.user_id}
                    onClick={() => approve(u.user_id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    {processing === u.user_id ? "Approving…" : "Approve"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-10 rounded-xl text-xs font-medium border-border/60 hover:border-destructive/30 hover:text-destructive"
                    disabled={processing === u.user_id}
                    onClick={() => {
                      setConfirmUser({ id: u.user_id, email: u.email });
                      setConfirmOpen(true);
                    }}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security footer */}
        <div style={fadeIn(3 + items.length + 1)} className="pt-2 pb-4">
          <div className="flex items-center justify-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Shield className="w-3 h-3" /> Admin Access Only
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Lock className="w-3 h-3" /> Actions Audit Logged
            </span>
          </div>
        </div>
      </PageContainer>

      {/* Reject confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-2xl border-border/50 bg-card/95 backdrop-blur-sm max-w-sm">
          <DialogHeader className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle className="text-base">Reject this account?</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              {confirmUser?.email
                ? `This will reject ${confirmUser.email}.`
                : "This will reject the selected account."}{" "}
              The user will be notified and removed from the system.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-1" />

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="flex-1 h-10 rounded-xl text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={processing === confirmUser?.id}
              className="flex-1 h-10 rounded-xl text-xs font-semibold"
            >
              {processing === confirmUser?.id ? "Rejecting…" : "Yes, Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
