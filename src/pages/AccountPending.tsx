import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function AccountPending() {
  const { user } = useAuth();
  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto py-16 px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold">Account under review</h1>
        <p className="text-muted-foreground">
          Thanks for signing up. An admin will review your request shortly.
          You’ll receive a notification when approved.
        </p>
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={() => supabase.auth.signOut()}
          >
            Sign out
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
