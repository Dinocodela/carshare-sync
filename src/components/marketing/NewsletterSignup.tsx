import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NewsletterSignupProps {
  source?: string;
  heading?: string;
  subheading?: string;
  compact?: boolean;
}

export function NewsletterSignup({
  source = "website",
  heading = "Get Tesla Earning Tips in Your Inbox",
  subheading = "Join thousands of Tesla owners getting weekly insights on maximizing rental income.",
  compact = false,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscriptions")
        .insert({ email: email.trim().toLowerCase(), source });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
          setSubscribed(true);
        } else {
          throw error;
        }
      } else {
        setSubscribed(true);
        toast.success("Welcome! You're now subscribed.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className={`flex items-center justify-center gap-2 py-4 ${compact ? "" : "py-8"}`}>
        <CheckCircle className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-foreground">You're subscribed! Check your inbox.</span>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-9 h-10 text-sm rounded-xl"
          />
        </div>
        <Button type="submit" size="sm" disabled={loading} className="rounded-xl px-4">
          {loading ? "…" : "Subscribe"}
        </Button>
      </form>
    );
  }

  return (
    <section className="py-12 bg-muted/30 border-y border-border">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">{heading}</h3>
        <p className="text-sm text-muted-foreground mb-6">{subheading}</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-xl text-sm"
          />
          <Button type="submit" disabled={loading} className="rounded-xl shadow-lg shadow-primary/20 whitespace-nowrap">
            {loading ? "Subscribing…" : (
              <>Subscribe <ArrowRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground/60 mt-3">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
