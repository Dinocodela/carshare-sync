import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getWrapUtms, trackWrapEvent } from "@/lib/wrapAnalytics";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(200),
  email: z.string().trim().email("Enter a valid email").max(320),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  model_interest: z.string().trim().max(80).optional().or(z.literal("")),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});

interface TeslaDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: string;
}

export function TeslaDealDialog({ open, onOpenChange, source }: TeslaDealDialogProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    model_interest: "",
    note: "",
    company_website: "", // honeypot
  });

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Check your details",
        description: parsed.error.issues[0]?.message ?? "Invalid input",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "submit-tesla-deal-lead",
        {
          body: {
            ...parsed.data,
            company_website: form.company_website,
            source,
            ...getWrapUtms(),
          },
        }
      );
      if (error || (data && (data as { error?: string }).error)) {
        throw new Error(
          (data as { error?: string })?.error ?? error?.message ?? "Request failed"
        );
      }
      trackWrapEvent("tesla_deal_lead_submit", { source });
      toast({
        title: "Request sent",
        description: "We'll reach out with an introduction shortly.",
      });
      setForm({
        name: "",
        email: "",
        phone: "",
        model_interest: "",
        note: "",
        company_website: "",
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Something went wrong",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get connected on a Tesla purchase</DialogTitle>
          <DialogDescription>
            Tell us what you're looking for and we'll introduce you to our Tesla
            sales contact. No obligation, and we can't promise a specific price.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="deal-name">Name</Label>
            <Input id="deal-name" value={form.name} onChange={set("name")} maxLength={200} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deal-email">Email</Label>
            <Input
              id="deal-email"
              type="email"
              value={form.email}
              onChange={set("email")}
              maxLength={320}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="deal-phone">Phone (optional)</Label>
              <Input id="deal-phone" value={form.phone} onChange={set("phone")} maxLength={40} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deal-model">Model of interest</Label>
              <Input
                id="deal-model"
                placeholder="Model Y, Cybertruck…"
                value={form.model_interest}
                onChange={set("model_interest")}
                maxLength={80}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deal-note">Anything else? (optional)</Label>
            <Textarea
              id="deal-note"
              value={form.note}
              onChange={set("note")}
              maxLength={2000}
              rows={3}
            />
          </div>

          {/* Honeypot */}
          <input
            type="text"
            name="company_website"
            value={form.company_website}
            onChange={set("company_website")}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <Button type="submit" className="w-full rounded-full" disabled={submitting}>
            {submitting ? "Sending…" : "Request an introduction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
