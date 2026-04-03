import { useState } from "react";
import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Phone, CheckCircle2, ExternalLink } from "lucide-react";

export default function BonzahInsurance() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    car_count: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("insurance_inquiries").insert({
        user_id: user.id,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        car_count: form.car_count,
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Request submitted!", description: "Our agent Brandon will reach out to you shortly." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to submit", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = [
    "Commercial rental insurance for private bookings",
    "Protect your vehicles and your guests",
    "Competitive rates tailored for car hosts",
    "Quick setup with our dedicated agent",
    "Coverage for Turo, direct rentals, and more",
  ];

  return (
    <>
      <SEO
        title="Rental Insurance for Hosts - Bonzah Partnership | Teslys"
        description="Offer rental insurance to your private clients through our Bonzah partnership. Protect your vehicles and grow your hosting business."
        canonical="https://teslys.app/bonzah-insurance"
      />
      <DashboardLayout>
        <ScreenHeader title="Rental Insurance" fallbackHref="/dashboard" />
        <PageContainer className="py-8">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Hero */}
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Rental Insurance by Bonzah
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                We've partnered with{" "}
                <a href="https://www.bonzah.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  Bonzah <ExternalLink className="w-3 h-3" />
                </a>{" "}
                to offer rental insurance for your private clients. Protect your cars and build trust with guests.
              </p>
            </div>

            {/* Benefits */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Why Get Insured?</h2>
              <ul className="space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Contact Agent */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h2 className="text-lg font-semibold text-foreground mb-2">Contact Our Agent Directly</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Reach out to <strong>Brandon Rockow</strong> to get set up with insurance for your fleet.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="tel:515-726-6924" className="inline-flex items-center gap-2 text-primary hover:underline">
                  <Phone className="w-4 h-4" /> Tel: 515-726-6924
                </a>
                <a href="tel:515-444-5669" className="inline-flex items-center gap-2 text-primary hover:underline">
                  <Phone className="w-4 h-4" /> Mobile: 515-444-5669
                </a>
              </div>
            </Card>

            {/* Request Form */}
            {submitted ? (
              <Card className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
                <h2 className="text-xl font-bold text-foreground">Request Submitted!</h2>
                <p className="text-muted-foreground">Brandon will contact you shortly to set up insurance for your vehicles.</p>
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Request Insurance Setup</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Fill out this quick form and our agent will reach out to get you started.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="ins-name">Full Name</Label>
                      <Input id="ins-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ins-email">Email</Label>
                      <Input id="ins-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ins-phone">Phone</Label>
                      <Input id="ins-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ins-cars">Number of Cars</Label>
                      <Input id="ins-cars" type="number" min={1} max={100} value={form.car_count} onChange={(e) => setForm({ ...form, car_count: parseInt(e.target.value) || 1 })} required />
                    </div>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? "Submitting…" : "Request Setup"}
                  </Button>
                </form>
              </Card>
            )}
          </div>
        </PageContainer>
      </DashboardLayout>
    </>
  );
}
