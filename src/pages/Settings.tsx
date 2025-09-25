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
import { ExternalLink, Info } from "lucide-react";
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
    console.log("Saving profile for user:", user.id);

    try {
      // Prepare services array
      const servicesArray = servicesText
        ? servicesText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : null;

      // Use the secure database function to update the profile
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
        // Update the profile state with the returned data
        if (data) {
          const profileData = data as any as Profile;
          setProfile(profileData);
          // Update the rating and review count in the form state as well
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
      //   window.location.replace("/");
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: e?.message ?? "Please contact support@teslys.app",
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

  return (
    <DashboardLayout>
      <header className=" bg-white  z-10 flex items-center justify-center gap-2 py-2 mb-4">
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
              {Capacitor.isNativePlatform() && profile.role === "host" && (
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
              <section aria-labelledby="help-support" className="md:col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle id="help-support" className="text-xl">
                      Help & Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => navigate("/support")}
                    >
                      Open Support Page
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full underline underline-offset-2"
                      onClick={() =>
                        (window.location.href = "mailto:support@teslys.app")
                      }
                    >
                      Email support@teslys.app
                    </Button>
                  </CardContent>
                </Card>
              </section>
              <section
                aria-labelledby="legal-policies"
                className="md:col-span-2"
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle id="legal-policies" className="text-xl">
                      Legal & Policies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/terms")}
                    >
                      Terms of Use
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/privacy")}
                    >
                      Privacy Policy
                    </Button>
                  </CardContent>
                </Card>
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

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete Account
                </Button>

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
            </div>
          )}
        </main>
      </PageContainer>
    </DashboardLayout>
  );
}
