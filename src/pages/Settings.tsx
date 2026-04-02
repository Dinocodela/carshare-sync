import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { NotificationsCard } from "@/components/NotificationsCard";
import { HostProfilePreviewDialog } from "@/components/HostProfilePreviewDialog";
import { useNavigate } from "react-router-dom";
import {
  ExternalLink,
  Shield,
  Lock,
  User,
  Key,
  Bell,
  HelpCircle,
  FileText,
  LogOut,
  Trash2,
  MapPin,
  Phone,
  Building2,
  Briefcase,
  Star,
  Mail,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Profile {
  user_id: string;
  role: "client" | "host";
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  phone: string;
  bio: string | null;
  location: string | null;
  services: string[] | null;
  rating?: number | null;
  turo_profile_url?: string | null;
  turo_reviews_count?: number | null;
  turo_last_synced?: string | null;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [turoUrl, setTuroUrl] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewCountInput, setReviewCountInput] = useState<string>("0");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const role = useMemo(
    () =>
      (profile?.role ?? user?.user_metadata?.role ?? "client") as
        | "client"
        | "host",
    [profile?.role, user?.user_metadata?.role]
  );

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const fadeIn = (idx: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(12px)",
    transition: `all 500ms cubic-bezier(0.23,1,0.32,1) ${idx * 80}ms`,
  });

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Settings – TESLYS";

    const metaDesc = document.querySelector('meta[name="description"]');
    const createdDesc = !metaDesc;
    const descEl = metaDesc || document.createElement("meta");
    if (!metaDesc) descEl.setAttribute("name", "description");
    descEl.setAttribute(
      "content",
      "Manage your TESLYS account settings, profile, and password."
    );
    if (!metaDesc) document.head.appendChild(descEl);

    const linkCanonical = document.querySelector('link[rel="canonical"]');
    const createdCanon = !linkCanonical;
    const canonEl = linkCanonical || document.createElement("link");
    if (!linkCanonical) canonEl.setAttribute("rel", "canonical");
    canonEl.setAttribute("href", window.location.href);
    if (!linkCanonical) document.head.appendChild(canonEl);

    return () => {
      document.title = prevTitle;
      if (createdDesc && descEl.parentElement)
        descEl.parentElement.removeChild(descEl);
      if (createdCanon && canonEl.parentElement)
        canonEl.parentElement.removeChild(canonEl);
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Failed to load profile", error);
        toast({ title: "Error", description: "Could not load your profile." });
      }

      if (data) {
        setProfile(data as Profile);
        setFirstName(data.first_name ?? "");
        setLastName(data.last_name ?? "");
        setCompanyName(data.company_name ?? "");
        setPhone(data.phone ?? "");
        setBio(data.bio ?? "");
        setLocation(data.location ?? "");
        setServicesText((data.services ?? []).join(", "));
        setTuroUrl((data as any).turo_profile_url ?? "");
        setRating(data.rating ?? 0);
        setReviewCount(data.turo_reviews_count ?? 0);
      } else {
        setProfile(null);
        setFirstName(user.user_metadata?.first_name ?? "");
        setLastName(user.user_metadata?.last_name ?? "");
        setCompanyName(user.user_metadata?.company_name ?? "");
        setPhone(user.user_metadata?.phone ?? "");
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user, toast]);

  const handleSaveProfile = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to save your profile.",
      });
      return;
    }

    if (!phone) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number.",
      });
      return;
    }

    setSaving(true);

    try {
      const servicesArray = servicesText
        ? servicesText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : null;

      const { data, error } = await supabase.rpc("update_user_profile", {
        p_first_name: firstName || null,
        p_last_name: lastName || null,
        p_company_name: role === "host" ? companyName || null : null,
        p_phone: phone,
        p_bio: bio || null,
        p_location: location || null,
        p_services: servicesArray,
        p_turo_profile_url: role === "host" ? turoUrl || null : null,
        p_role: role,
        p_rating: role === "host" && rating > 0 ? rating : null,
        p_turo_reviews_count:
          role === "host" && reviewCount > 0 ? reviewCount : null,
      });

      setSaving(false);

      if (error) {
        console.error("Save profile error:", error);
        toast({
          title: "Save failed",
          description: `Could not save your profile: ${
            error.message || "Unknown error"
          }`,
        });
      } else {
        toast({
          title: "Profile updated",
          description: "Your changes have been saved.",
        });
        if (data) {
          const profileData = data as any as Profile;
          setProfile(profileData);
          if (role === "host" && profileData) {
            setRating(profileData.rating || 0);
            setReviewCount(profileData.turo_reviews_count || 0);
            setReviewCountInput(String(profileData.turo_reviews_count || 0));
          }
        }
      }
    } catch (err) {
      setSaving(false);
      console.error("Unexpected error:", err);
      toast({
        title: "Save failed",
        description: "An unexpected error occurred while saving your profile.",
      });
    }
  };

  async function handleDeleteAccount() {
    try {
      setDeleting(true);
      const token = (await supabase.auth.getSession()).data.session
        ?.access_token;
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Delete failed");
      toast({
        title: "Account deleted",
        description: "Your account and data were removed.",
      });
      await signOut();
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: e?.message ?? "Please contact support@teslys.com",
      });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!pwd1 || !pwd2) {
      toast({
        title: "Missing fields",
        description: "Enter and confirm your new password.",
      });
      return;
    }
    if (pwd1 !== pwd2) {
      toast({
        title: "Passwords do not match",
        description: "Please re-enter matching passwords.",
      });
      return;
    }
    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd1 });
    setPwdLoading(false);
    if (error) {
      console.error(error);
      toast({
        title: "Update failed",
        description: error.message || "Password update failed.",
      });
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been changed.",
      });
      setPwd1("");
      setPwd2("");
    }
  };

  /* ── Section wrapper component ── */
  const Section = ({
    icon: Icon,
    title,
    children,
    idx,
    id,
    className = "",
  }: {
    icon: any;
    title: string;
    children: React.ReactNode;
    idx: number;
    id?: string;
    className?: string;
  }) => (
    <section
      aria-labelledby={id}
      style={fadeIn(idx)}
      className={`rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 space-y-4 ${className}`}
    >
      <div className="flex items-center gap-2.5 mb-1">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 id={id} className="text-base font-semibold tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );

  return (
    <DashboardLayout>
      <PageContainer>
        <main className="space-y-5 pb-8">
          {/* ── Trust Banner ── */}
          <div
            style={fadeIn(0)}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-primary/15 p-2.5">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Account Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your profile, security & preferences
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {[
                { icon: Lock, label: "Data Encrypted" },
                { icon: Shield, label: "Account Protected" },
                { icon: CheckCircle, label: "Verified Platform" },
              ].map(({ icon: BadgeIcon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-muted-foreground"
                >
                  <BadgeIcon className="h-3.5 w-3.5 text-primary/70" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
              Loading…
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {/* ── Profile Section ── */}
              <Section
                icon={User}
                title="Profile"
                idx={1}
                id="profile-section"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="first_name" className="text-xs">
                      First name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                      <Input
                        id="first_name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-9 rounded-xl bg-background/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last_name" className="text-xs">
                      Last name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                      <Input
                        id="last_name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="pl-9 rounded-xl bg-background/50"
                      />
                    </div>
                  </div>
                </div>

                {role === "host" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="company_name" className="text-xs">
                      Company name
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                      <Input
                        id="company_name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-9 rounded-xl bg-background/50"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs">
                    Phone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9 rounded-xl bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs">
                    Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-9 rounded-xl bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="services" className="text-xs">
                    Services (comma separated)
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                    <Input
                      id="services"
                      value={servicesText}
                      onChange={(e) => setServicesText(e.target.value)}
                      className="pl-9 rounded-xl bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio" className="text-xs">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="rounded-xl bg-background/50 min-h-[80px]"
                  />
                </div>

                {role === "host" && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="turo_url" className="text-xs">
                        Turo Profile URL (optional)
                      </Label>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                        <Input
                          id="turo_url"
                          value={turoUrl}
                          onChange={(e) => setTuroUrl(e.target.value)}
                          placeholder="https://turo.com/us/en/drivers/..."
                          className="pl-9 rounded-xl bg-background/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="rating" className="text-xs">
                          Turo Rating
                        </Label>
                        <div className="relative">
                          <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                          <Input
                            id="rating"
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={rating}
                            onChange={(e) =>
                              setRating(
                                Math.min(
                                  5,
                                  Math.max(
                                    0,
                                    parseFloat(e.target.value) || 0
                                  )
                                )
                              )
                            }
                            placeholder="4.9"
                            className="pl-9 rounded-xl bg-background/50"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="review_count" className="text-xs">
                          Review Count
                        </Label>
                        <Input
                          id="review_count"
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={1}
                          value={reviewCountInput}
                          placeholder="250"
                          className="rounded-xl bg-background/50"
                          onChange={(e) => {
                            const v = e.target.value;
                            setReviewCountInput(v);
                            const n = Number(v);
                            if (v === "" || !Number.isFinite(n)) {
                              setReviewCount(0);
                            } else {
                              setReviewCount(Math.max(0, Math.floor(n)));
                            }
                          }}
                          onBlur={() => {
                            setReviewCountInput(String(reviewCount));
                          }}
                        />
                      </div>
                    </div>

                    {rating > 0 && (
                      <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center space-y-0.5">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Your Turo Rating
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {rating}/5.0 ★
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Based on {reviewCount} reviews
                        </div>
                      </div>
                    )}

                    <HostProfilePreviewDialog
                      host={{
                        first_name: firstName,
                        last_name: lastName,
                        company_name: companyName,
                        phone: phone,
                        location: location,
                        rating: rating > 0 ? rating : null,
                        turo_reviews_count:
                          reviewCount > 0 ? reviewCount : null,
                        turo_profile_url: turoUrl,
                      }}
                    />
                  </>
                )}

                <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                  <span className="text-xs text-muted-foreground">Role</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    {role}
                  </span>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full rounded-xl"
                >
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </Section>

              {/* ── Account / Security ── */}
              <div className="space-y-5">
                <Section
                  icon={Key}
                  title="Security"
                  idx={2}
                  id="account-section"
                >
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                      <Input
                        value={user?.email ?? ""}
                        readOnly
                        aria-readonly
                        className="pl-9 rounded-xl bg-muted/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="new_password" className="text-xs">
                        New password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                        <Input
                          id="new_password"
                          type="password"
                          value={pwd1}
                          onChange={(e) => setPwd1(e.target.value)}
                          className="pl-9 rounded-xl bg-background/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirm_password" className="text-xs">
                        Confirm password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                        <Input
                          id="confirm_password"
                          type="password"
                          value={pwd2}
                          onChange={(e) => setPwd2(e.target.value)}
                          className="pl-9 rounded-xl bg-background/50"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handlePasswordChange}
                    disabled={pwdLoading}
                    className="w-full rounded-xl"
                  >
                    {pwdLoading ? "Updating…" : "Update password"}
                  </Button>
                </Section>

                {/* ── Quick Actions ── */}
                <Section
                  icon={Briefcase}
                  title="Quick Actions"
                  idx={3}
                  id="actions-section"
                >
                  <div className="space-y-2">
                    {role === "client" && (
                      <button
                        onClick={() => navigate("/client-fixed-expenses")}
                        className="w-full flex items-center justify-between rounded-xl bg-background/50 border border-border/40 px-4 py-3 text-sm hover:bg-accent/50 transition-colors"
                      >
                        <span>Manage Fixed Expenses</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                    {role === "host" && (
                      <>
                        <button
                          onClick={() => navigate("/host-requests")}
                          className="w-full flex items-center justify-between rounded-xl bg-background/50 border border-border/40 px-4 py-3 text-sm hover:bg-accent/50 transition-colors"
                        >
                          <span>Review Host Requests</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() =>
                            navigate("/host-car-management#returns")
                          }
                          className="w-full flex items-center justify-between rounded-xl bg-background/50 border border-border/40 px-4 py-3 text-sm hover:bg-accent/50 transition-colors"
                        >
                          <span>Manage Returns</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </>
                    )}
                  </div>
                </Section>
              </div>

              {/* ── Subscription ── */}
              {Capacitor.isNativePlatform() && profile?.role === "host" && (
                <section
                  aria-labelledby="subscription-section"
                  className="md:col-span-2"
                  style={fadeIn(4)}
                >
                  <SubscriptionCard />
                </section>
              )}

              {/* ── Notifications ── */}
              <section
                aria-labelledby="notifications-section"
                className="md:col-span-2"
                style={fadeIn(5)}
              >
                <NotificationsCard />
              </section>

              {/* ── Help & Support ── */}
              <Section
                icon={HelpCircle}
                title="Help & Support"
                idx={6}
                id="help-support"
                className="md:col-span-1"
              >
                <button
                  onClick={() => navigate("/support")}
                  className="w-full flex items-center justify-between rounded-xl bg-background/50 border border-border/40 px-4 py-3 text-sm hover:bg-accent/50 transition-colors"
                >
                  <span>Open Support Page</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() =>
                    (window.location.href = "mailto:support@teslys.app")
                  }
                  className="w-full flex items-center justify-between rounded-xl bg-background/50 border border-border/40 px-4 py-3 text-sm hover:bg-accent/50 transition-colors"
                >
                  <span>Email support@teslys.app</span>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </button>
              </Section>

              {/* ── Legal ── */}
              <Section
                icon={FileText}
                title="Legal & Policies"
                idx={7}
                id="legal-policies"
                className="md:col-span-1"
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => navigate("/terms")}
                    className="flex items-center justify-between rounded-xl bg-background/50 border border-border/40 px-4 py-3 text-sm hover:bg-accent/50 transition-colors"
                  >
                    <span>Terms of Use</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => navigate("/privacy")}
                    className="flex items-center justify-between rounded-xl bg-background/50 border border-border/40 px-4 py-3 text-sm hover:bg-accent/50 transition-colors"
                  >
                    <span>Privacy Policy</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </Section>

              {/* ── Danger Zone ── */}
              <section
                className="md:col-span-2 space-y-3"
                style={fadeIn(8)}
              >
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-destructive/10 p-2">
                      <LogOut className="h-4 w-4 text-destructive" />
                    </div>
                    <h2 className="text-base font-semibold tracking-tight">
                      Account Actions
                    </h2>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full rounded-xl text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>

                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete your account?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                      This permanently deletes your account and associated data.
                      This action cannot be undone.
                    </p>
                    <DialogFooter className="gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setDeleteOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                      >
                        {deleting ? "Deleting…" : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </section>

              {/* ── Trust Footer ── */}
              <div
                className="md:col-span-2 flex flex-wrap justify-center gap-4 py-3 text-xs text-muted-foreground"
                style={fadeIn(9)}
              >
                {[
                  { icon: Lock, label: "256-bit encryption" },
                  { icon: Shield, label: "SOC 2 compliant" },
                  { icon: CheckCircle, label: "Verified by Teslys" },
                ].map(({ icon: TIcon, label }) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <TIcon className="h-3.5 w-3.5 text-primary/60" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </main>
      </PageContainer>
    </DashboardLayout>
  );
}
