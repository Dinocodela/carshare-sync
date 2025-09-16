import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { NotificationsCard } from "@/components/NotificationsCard";
import { HostProfilePreviewDialog } from "@/components/HostProfilePreviewDialog";
import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { Capacitor } from "@capacitor/core";

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

  const role = useMemo(
    () =>
      (profile?.role ?? user?.user_metadata?.role ?? "client") as
        | "client"
        | "host",
    [profile?.role, user?.user_metadata?.role]
  );

  useEffect(() => {
    // SEO: set title, description, canonical
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
        .select(
          "user_id, role, first_name, last_name, company_name, phone, bio, location, services, rating, turo_profile_url, turo_reviews_count, turo_last_synced"
        )
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
        // No profile row found – initialize with defaults but require phone on save
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
    if (!user) return;
    if (!phone) {
      toast({
        title: "Phone required",
        description: "Please enter your phone number.",
      });
      return;
    }

    setSaving(true);
    const payload = {
      first_name: firstName || null,
      last_name: lastName || null,
      company_name: role === "host" ? companyName || null : null,
      phone: phone,
      bio: bio || null,
      location: location || null,
      services: servicesText
        ? servicesText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : null,
      turo_profile_url: role === "host" ? turoUrl || null : null,
      rating: role === "host" ? rating : null,
      turo_reviews_count: role === "host" ? reviewCount : null,
      role, // not editable here, but keep for insert case
      user_id: user.id,
    };

    let error;
    if (profile) {
      const { error: updError } = await supabase
        .from("profiles")
        .update(payload)
        .eq("user_id", user.id);
      error = updError || null;
    } else {
      const { error: insError } = await supabase
        .from("profiles")
        .insert([payload]);
      error = insError || null;
    }

    setSaving(false);

    if (error) {
      console.error(error);
      toast({
        title: "Save failed",
        description: "Could not save your profile.",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
      setProfile(payload as Profile);
    }
  };

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

  return (
    <DashboardLayout>
      <header className="sticky top-0 z-10 flex items-center justify-center gap-2 py-2 mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Account Settings</h1>
        </div>
      </header>

      <PageContainer>
        <main>
          {/* ⬇️ removed the large "Account settings" page title */}

          {loading ? (
            <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
              Loading…
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Profile */}
              <section aria-labelledby="profile-section">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle id="profile-section" className="text-xl">
                      Profile
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">First name</Label>
                        <Input
                          id="first_name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last name</Label>
                        <Input
                          id="last_name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>

                    {role === "host" && (
                      <div>
                        <Label htmlFor="company_name">Company name</Label>
                        <Input
                          id="company_name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="services">
                        Services (comma separated)
                      </Label>
                      <Input
                        id="services"
                        value={servicesText}
                        onChange={(e) => setServicesText(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>

                    {role === "host" && (
                      <>
                        <div>
                          <Label htmlFor="turo_url">
                            Turo Profile URL (optional)
                          </Label>
                          <Input
                            id="turo_url"
                            value={turoUrl}
                            onChange={(e) => setTuroUrl(e.target.value)}
                            placeholder="https://turo.com/us/en/drivers/7050393"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Your public Turo driver profile URL for reference
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="rating">Turo Rating</Label>
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
                                    Math.max(0, parseFloat(e.target.value) || 0)
                                  )
                                )
                              }
                              placeholder="4.9"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Your current Turo rating (0–5 stars)
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="review_count">Review Count</Label>
                            <Input
                              id="review_count"
                              type="number"
                              inputMode="numeric"
                              min={0}
                              step={1}
                              value={reviewCountInput} // show exactly what the user is typing
                              placeholder="250"
                              onChange={(e) => {
                                const v = e.target.value; // string
                                setReviewCountInput(v); // allow "", "1", "12", etc.

                                const n = Number(v);
                                // keep model numeric & valid; anything non-number -> 0
                                if (v === "" || !Number.isFinite(n)) {
                                  setReviewCount(0);
                                } else {
                                  setReviewCount(Math.max(0, Math.floor(n)));
                                }
                              }}
                              onBlur={() => {
                                // when leaving the field, snap display back to a valid number
                                setReviewCountInput(String(reviewCount)); // e.g. "" -> "0"
                              }}
                            />{" "}
                            <p className="text-xs text-muted-foreground mt-1">
                              Total number of Turo reviews
                            </p>
                          </div>
                        </div>

                        {rating > 0 && (
                          <div className="text-sm bg-muted/50 p-3 rounded-md">
                            <div className="font-medium text-center">
                              Your Turo Rating
                            </div>
                            <div className="text-2xl font-bold text-primary text-center">
                              {rating}/5.0 ★
                            </div>
                            <div className="text-xs text-muted-foreground text-center">
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

                    {/* role + full-width Save */}
                    <div className="text-sm text-muted-foreground">
                      Role:{" "}
                      <span className="font-medium text-foreground uppercase">
                        {role}
                      </span>
                    </div>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="w-full"
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </Button>
                  </CardContent>
                </Card>
              </section>

              {/* Account (Password) */}
              <section aria-labelledby="account-section">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle id="account-section" className="text-xl">
                      Account
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Email</Label>
                      <Input value={user?.email ?? ""} readOnly aria-readonly />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new_password">New password</Label>
                        <Input
                          id="new_password"
                          type="password"
                          value={pwd1}
                          onChange={(e) => setPwd1(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm_password">
                          Confirm password
                        </Label>
                        <Input
                          id="confirm_password"
                          type="password"
                          value={pwd2}
                          onChange={(e) => setPwd2(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* full-width Update */}
                    <Button
                      variant="outline"
                      onClick={handlePasswordChange}
                      disabled={pwdLoading}
                      className="w-full"
                    >
                      {pwdLoading ? "Updating…" : "Update password"}
                    </Button>
                  </CardContent>
                </Card>
              </section>

              {/* Subscription */}
              {Capacitor.isNativePlatform() && (
                <section
                  aria-labelledby="subscription-section"
                  className="md:col-span-2"
                >
                  <SubscriptionCard />
                </section>
              )}

              {/* Notifications */}
              <section
                aria-labelledby="notifications-section"
                className="md:col-span-2"
              >
                <NotificationsCard />
              </section>

              {/* Actions — no card, stacked, at the very end */}
              <section className="md:col-span-2 space-y-3">
                {role === "client" && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate("/client-fixed-expenses")}
                  >
                    Manage Fixed Expenses
                  </Button>
                )}
                {role === "host" && (
                  <>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => navigate("/host-requests")}
                    >
                      Review Host Requests
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => navigate("/host-car-management#returns")}
                    >
                      Manage Returns
                    </Button>
                  </>
                )}
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={async () => {
                    await signOut();
                    window.location.reload();
                  }}
                >
                  Sign Out
                </Button>
              </section>
            </div>
          )}
        </main>
      </PageContainer>
    </DashboardLayout>
  );
}
