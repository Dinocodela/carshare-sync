import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { X } from "lucide-react";

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

export function ManageCarAccessDialog({
  carId,
  open,
  onOpenChange,
}: ManageCarAccessDialogProps) {
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

      // fetch display names
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
      } else {
        setProfiles({});
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load access";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, carId]);

  const displayName = (userId: string) => {
    const p = profiles[userId];
    if (!p) return userId.slice(0, 6) + "…";
    if (p.company_name) return p.company_name;
    const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
    return name || userId.slice(0, 6) + "…";
  };

  const handlePermissionChange = async (row: AccessRow, value: string) => {
    try {
      const { error } = await supabase
        .from("car_access")
        .update({ permission: value })
        .eq("id", row.id);
      if (error) throw error;
      setAccess((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, permission: value } : r))
      );
      toast({ title: "Updated", description: "Permission updated." });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to update permission";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleRevoke = async (row: AccessRow) => {
    try {
      const { error } = await supabase
        .from("car_access")
        .delete()
        .eq("id", row.id);
      if (error) throw error;
      setAccess((prev) => prev.filter((r) => r.id !== row.id));
      toast({
        title: "Access revoked",
        description: "The user no longer has access.",
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to revoke access";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  // --- Mobile Sheet version ---
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] max-h-[80vh] overflow-y-auto"
        >
          {/* custom header to avoid duplicate close button */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold leading-tight">
                Manage Access
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                View and manage who can access this car. You can change
                permissions or revoke access.
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 text-sm text-muted-foreground">
                  Loading access…
                </div>
              ) : access.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">
                  No shared users yet.
                </div>
              ) : (
                <ul className="divide-y">
                  {access.map((row) => (
                    <li key={row.id} className="p-4 flex flex-col gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {displayName(row.user_id)}
                          </span>
                          <Badge variant="outline">
                            {row.user_id.slice(0, 6)}…
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Added {new Date(row.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={row.permission}
                          onValueChange={(v) => handlePermissionChange(row, v)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevoke(row)}
                          className="shrink-0"
                        >
                          Revoke
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </SheetContent>
      </Sheet>
    );
  }

  // --- Desktop Dialog version (unchanged header layout) ---
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Access</DialogTitle>
          <DialogDescription>
            View and manage who can access this car. You can change permissions
            or revoke access.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">
                Loading access…
              </div>
            ) : access.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No shared users yet.
              </div>
            ) : (
              <ul className="divide-y">
                {access.map((row) => (
                  <li
                    key={row.id}
                    className="p-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate max-w-[220px]">
                          {displayName(row.user_id)}
                        </span>
                        <Badge variant="outline">
                          {row.user_id.slice(0, 6)}…
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Added {new Date(row.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={row.permission}
                        onValueChange={(v) => handlePermissionChange(row, v)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(row)}
                      >
                        Revoke
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
