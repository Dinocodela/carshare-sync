import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Info, CheckCircle, XCircle, ChevronLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@radix-ui/react-separator";
import { useNavigate } from "react-router-dom";

type PendingUser = {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  requested_at: string;
};

export default function AdminManageAccounts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<PendingUser[]>([]);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<{
    id: string;
    email?: string | null;
  } | null>(null);

  useEffect(() => {
    (async () => {
      // guard: ensure current user is admin
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
        {
          body: { userId: uid, reason: undefined },
        }
      );
      if (error) throw error;
      setItems((prev) => prev.filter((x) => x.user_id !== uid));
      toast({ title: "Approved" });
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
        {
          body: { userId: confirmUser.id || undefined },
        }
      );
      if (error) throw error;
      setItems((prev) => prev.filter((x) => x.user_id !== confirmUser.id));
      toast({ title: "Rejected" });
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
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[300px] flex items-center justify-center">
          Loading…
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="flex items-center justify-between gap-2 py-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-9 w-9"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Manage Accounts</h1>
        </div>
        <div className="w-9" />
      </header>
      <section className="mb-6 px-4">
        <div className="rounded-2xl border bg-muted/40 p-3 flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 shrink-0">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Review and manage account requests.
            </p>
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No pending accounts
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 px-4">
          {items.map((u) => (
            <Card key={u.user_id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  {u.first_name || u.last_name
                    ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
                    : "New User"}
                  <Badge variant="outline" className="ml-2">
                    pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {u.email ?? ""}
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={processing === u.user_id}
                    onClick={() => approve(u.user_id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Approve
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={processing === u.user_id}
                    onClick={() => {
                      setConfirmUser({ id: u.user_id, email: u.email });
                      setConfirmOpen(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this account?</DialogTitle>
            <DialogDescription>
              {confirmUser?.email
                ? `This will reject ${confirmUser.email}.`
                : "This will reject the selected account."}
              The user will be notified and removed from the system.
            </DialogDescription>
          </DialogHeader>

          {/* Optional reason box */}

          <Separator className="my-2" />

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={processing === confirmUser?.id}
            >
              {processing === confirmUser?.id ? "Rejecting…" : "Yes, reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
