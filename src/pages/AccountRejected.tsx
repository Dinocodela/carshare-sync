import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { XCircle, Mail } from "lucide-react";

export default function AccountRejected() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("decision_reason")
        .eq("user_id", user.id)
        .maybeSingle();
      if (alive) setReason((data?.decision_reason as string) ?? null);
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto py-16 px-4 text-center space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Account not approved</h1>
        <p className="text-muted-foreground">
          Unfortunately, your account application was not approved.
        </p>

        {reason && (
          <div className="text-left rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-destructive mb-1">
              Reason
            </p>
            <p className="text-sm text-foreground">{reason}</p>
          </div>
        )}

        <p className="text-muted-foreground text-sm">
          If you believe this is a mistake, please contact us and we'll be happy
          to take another look.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Button asChild>
            <a href="mailto:support@teslys.com">
              <Mail className="h-4 w-4 mr-2" />
              Email support@teslys.com
            </a>
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
