import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Shield, Lock, Mail, Users, CheckCircle } from "lucide-react";

interface ShareCarDialogProps {
  carId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareCarDialog({ carId, open, onOpenChange }: ShareCarDialogProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"viewer" | "editor">("viewer");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const reset = () => { setEmail(""); setPermission("viewer"); };

  const handleShare = async () => {
    if (!carId) return;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: sessionResult } = await supabase.auth.getSession();
      const accessToken = sessionResult.session?.access_token;
      if (!accessToken) {
        toast({ title: "Not signed in", description: "You must be signed in to share access.", variant: "destructive" });
        return;
      }
      const { data, error } = await supabase.functions.invoke("share-car-access", {
        body: { carId, email, permission },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (error) {
        const status = (error as any)?.context?.responseStatus ?? (error as any)?.status;
        let detailedDescription: string | undefined;
        try {
          const responseText = (error as any)?.context?.responseText;
          if (responseText) { const parsed = JSON.parse(responseText); detailedDescription = parsed?.error || parsed?.message; }
        } catch (_) {}
        const fallback = (error as any)?.message || "Failed to share access";
        const description = detailedDescription || (status === 404 ? "No user found with that email. Ask them to sign up first." : status === 403 ? "Only the car owner can share access." : status === 401 ? "You must be signed in to share access." : fallback);
        console.error("share-car-access error:", error);
        toast({ title: "Share failed", description, variant: "destructive" });
        return;
      }
      toast({ title: "Access granted", description: `Shared with ${email} as ${permission}.` });
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Share failed", description: e?.message || "Failed to share access", variant: "destructive" });
    } finally { setLoading(false); }
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
            <h3 className="text-sm font-bold tracking-tight">Share Vehicle Access</h3>
            <p className="text-xs text-muted-foreground">Grant another client secure access</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px]">
          {[
            { icon: Lock, label: "Encrypted" },
            { icon: CheckCircle, label: "Revocable" },
          ].map(({ icon: I, label }) => (
            <span key={label} className="flex items-center gap-1 text-muted-foreground">
              <I className="h-3 w-3 text-primary/70" />{label}
            </span>
          ))}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="share-email" className="text-xs">Client email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
          <Input
            id="share-email"
            type="email"
            placeholder="client@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9 rounded-xl bg-background/50"
          />
        </div>
      </div>

      {/* Permission */}
      <div className="space-y-1.5">
        <Label className="text-xs">Permission</Label>
        <Select value={permission} onValueChange={(v) => setPermission(v as "viewer" | "editor")}>
          <SelectTrigger className="rounded-xl bg-background/50">
            <SelectValue placeholder="Select permission" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">Viewer (read-only)</SelectItem>
            <SelectItem value="editor">Editor (can modify fixed expenses)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="flex-1 rounded-xl">
          Cancel
        </Button>
        <Button onClick={handleShare} disabled={loading || !carId} className="flex-1 rounded-xl">
          <Users className="h-4 w-4 mr-1.5" />
          {loading ? "Sharing..." : "Share"}
        </Button>
      </div>
    </div>
  );

  return isMobile ? (
    <Sheet open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <SheetContent side="bottom" className="rounded-t-2xl p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] max-h-[85vh] overflow-y-auto">
        {content}
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        {content}
      </DialogContent>
    </Dialog>
  );
}
