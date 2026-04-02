import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Shield, Lock, CheckCircle, Users, UserX, Calendar } from "lucide-react";

interface ManageCarAccessDialogProps {
  carId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AccessRow = {
  id: string;
  user_id: string;
  permission: "viewer" | "editor" | string;
  created_at: string;
};

type Profile = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
};

export function ManageCarAccessDialog({ carId, open, onOpenChange }: ManageCarAccessDialogProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState<AccessRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const loadAccess = async () => {
    if (!carId) return;
    try {
      setLoading(true);
      const { data: accessRows, error } = await supabase
        .from("car_access")
        .select("id,user_id,permission,created_at")
        .eq("car_id", carId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const rows = (accessRows || []) as AccessRow[];
      setAccess(rows);
      const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
      if (userIds.length) {
        const { data: profs, error: profErr } = await supabase
          .from("profiles")
          .select("user_id,first_name,last_name,company_name")
          .in("user_id", userIds);
        if (profErr) throw profErr;
        const map: Record<string, Profile> = {};
        (profs || []).forEach((p) => (map[p.user_id] = p as Profile));
        setProfiles(map);
      } else { setProfiles({}); }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load access";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { if (open) loadAccess(); }, [open, carId]);

  const displayName = (userId: string) => {
    const p = profiles[userId];
    if (!p) return userId.slice(0, 6) + "…";
    if (p.company_name) return p.company_name;
    const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
    return name || userId.slice(0, 6) + "…";
  };

  const handlePermissionChange = async (row: AccessRow, value: string) => {
    try {
      const { error } = await supabase.from("car_access").update({ permission: value }).eq("id", row.id);
      if (error) throw error;
      setAccess((prev) => prev.map((r) => (r.id === row.id ? { ...r, permission: value } : r)));
      toast({ title: "Updated", description: "Permission updated." });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update permission";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleRevoke = async (row: AccessRow) => {
    try {
      const { error } = await supabase.from("car_access").delete().eq("id", row.id);
      if (error) throw error;
      setAccess((prev) => prev.filter((r) => r.id !== row.id));
      toast({ title: "Access revoked", description: "The user no longer has access." });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to revoke access";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const content = (
    <div className="space-y-5">
      {/* Trust banner */}
      <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="rounded-lg bg-primary/15 p-2">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Manage Access</h3>
            <p className="text-xs text-muted-foreground">Control who can view or edit this vehicle</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px]">
          {[
            { icon: Lock, label: "Secure Permissions" },
            { icon: CheckCircle, label: "Instant Updates" },
          ].map(({ icon: I, label }) => (
            <span key={label} className="flex items-center gap-1 text-muted-foreground">
              <I className="h-3 w-3 text-primary/70" />{label}
            </span>
          ))}
        </div>
      </div>

      {/* Access list */}
      <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground text-center">Loading access…</div>
        ) : access.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="rounded-xl bg-muted/30 p-3 w-fit mx-auto">
              <Users className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">No shared users yet</p>
            <p className="text-xs text-muted-foreground/70">Share access to invite collaborators</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/30">
            {access.map((row) => (
              <li key={row.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="font-medium text-sm truncate">{displayName(row.user_id)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 ml-8">
                      <Calendar className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground">
                        Added {new Date(row.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {row.user_id.slice(0, 6)}…
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={row.permission} onValueChange={(v) => handlePermissionChange(row, v)}>
                    <SelectTrigger className="flex-1 rounded-xl bg-background/50 text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(row)}
                    className="shrink-0 rounded-xl text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Revoke
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return isMobile ? (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] max-h-[85vh] overflow-y-auto">
        {content}
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-6">
        {content}
      </DialogContent>
    </Dialog>
  );
}
