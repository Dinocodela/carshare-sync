import { useEffect, useMemo, useState } from "react";
import { SEO } from "@/components/SEO";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";
import { Device } from "@capacitor/device";
import {
  Mail,
  ExternalLink,
  Shield,
  Lock,
  CheckCircle,
  ChevronLeft,
  HelpCircle,
  CreditCard,
  FileText,
  Trash2,
  RotateCcw,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";

export default function Support() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [appVersion, setAppVersion] = useState<string>("");
  const [deviceInfo, setDeviceInfo] = useState<{
    model?: string;
    os?: string;
    osVersion?: string;
    platform?: string;
  }>({});
  const email = user?.email ?? "";

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const fadeIn = (idx: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(12px)",
    transition: `all 500ms cubic-bezier(0.23,1,0.32,1) ${idx * 80}ms`,
  });

  useEffect(() => {
    (async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const info = await App.getInfo();
          setAppVersion(`${info.version} (${info.build})`);
          const dev = await Device.getInfo();
          setDeviceInfo({ model: dev.model, os: dev.operatingSystem, osVersion: dev.osVersion, platform: dev.platform });
        } else {
          setAppVersion("web");
          setDeviceInfo({ platform: "web", os: navigator.platform, osVersion: "", model: "" });
        }
      } catch {}
    })();
  }, []);

  const manageSubsUrl = useMemo(
    () => Capacitor.getPlatform() === "ios"
      ? "itms-apps://apps.apple.com/account/subscriptions"
      : "https://play.google.com/store/account/subscriptions",
    []
  );

  const openUrl = async (url: string) => {
    try {
      if (Capacitor.isNativePlatform()) await Browser.open({ url });
      else window.open(url, "_blank", "noopener,noreferrer");
    } catch { window.open(url, "_blank", "noopener,noreferrer"); }
  };

  const openSupportMail = () => {
    const subject = encodeURIComponent("Teslys Support Request");
    const body = encodeURIComponent(
      [
        "Please describe your issue here:",
        "",
        "—",
        `Account Email: ${email || ""}`,
        `App Version: ${appVersion || "unknown"}`,
        `Device: ${deviceInfo.model || ""}`,
        `OS: ${deviceInfo.os || ""} ${deviceInfo.osVersion || ""}`,
        `Platform: ${deviceInfo.platform || ""}`,
      ].join("\n")
    );
    window.location.href = `mailto:support@teslys.com?subject=${subject}&body=${body}`;
  };

  const storeName = Capacitor.getPlatform() === "ios" ? "App Store" : "Play Store";

  return (
    <DashboardLayout>
      <SEO
        title="Help & Support - Teslys Tesla Car Sharing Platform"
        description="Get help with your Teslys account. Contact support for Tesla car sharing questions, manage subscriptions, restore purchases, and find answers to common questions."
        keywords="Teslys support, Tesla car sharing help, customer service, account help, subscription management, technical support"
        canonical="https://teslys.app/support"
      />
      <PageContainer>
        <main className="space-y-5 pb-8">
          {/* Header */}
          <header style={fadeIn(0)} className="flex items-center justify-between gap-2 py-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back" className="h-9 w-9 rounded-xl">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Support</h1>
            <div className="w-9" />
          </header>

          {/* Trust Banner */}
          <div style={fadeIn(1)} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-primary/15 p-2.5">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Help & Support</h2>
                <p className="text-sm text-muted-foreground">Find answers and reach our team</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {[
                { icon: Shield, label: "Trusted Platform" },
                { icon: MessageCircle, label: "Fast Response" },
                { icon: CheckCircle, label: "24/7 Available" },
              ].map(({ icon: BadgeIcon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-muted-foreground">
                  <BadgeIcon className="h-3.5 w-3.5 text-primary/70" />{label}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={fadeIn(2)} className="grid gap-3 sm:grid-cols-2">
            {/* Contact Support */}
            <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold tracking-tight">Contact Support</h3>
              </div>
              <p className="text-xs text-muted-foreground">Email us with your account details and a brief description.</p>
              <Button onClick={openSupportMail} className="w-full rounded-xl">
                <Mail className="h-4 w-4 mr-2" />
                support@teslys.com
              </Button>
            </div>

            {/* Manage Subscription */}
            {Capacitor.isNativePlatform() && (
              <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight">Manage Subscription</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Open your {storeName} subscription settings to cancel or change plans.
                </p>
                <Button onClick={() => openUrl(manageSubsUrl)} variant="outline" className="w-full rounded-xl">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open {storeName}
                </Button>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div style={fadeIn(3)} className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 space-y-4">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="rounded-lg bg-primary/10 p-2">
                <HelpCircle className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold tracking-tight">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3">
              {Capacitor.isNativePlatform() && (
                <>
                  <FaqItem
                    question="How do I subscribe or change my plan?"
                    answer={`Go to Settings → Subscription and tap View Plans. On ${storeName} you'll see local pricing and can purchase through ${storeName}. To change or cancel, tap Manage on ${storeName} Subscriptions or use the button above.`}
                  />
                  <FaqItem
                    question="How do I restore purchases?"
                    answer={`In the paywall or the Subscription card, tap Restore Purchases. Make sure you're signed in with the same ${Capacitor.getPlatform() === "ios" ? "Apple" : "Google"} ID you used to buy the subscription.`}
                  />
                </>
              )}
              <FaqItem
                question="Where can I read the Terms and Privacy Policy?"
                answer="You can find them in Settings under Legal & Policies, or visit /terms and /privacy."
                links={[
                  { label: "Terms of Use", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                ]}
              />
              <FaqItem
                question="How do I delete my account?"
                answer="In the app, go to Settings → Account Actions → Delete Account. This permanently removes your account and associated data. You can also email support@teslys.com for assistance."
              />
              {Capacitor.isNativePlatform() && (
                <FaqItem
                  question="How do I get a refund?"
                  answer={`Purchases on ${Capacitor.getPlatform() === "ios" ? "iOS" : "Android"} are processed by ${Capacitor.getPlatform() === "ios" ? "Apple" : "Google"}. Refunds are handled under ${Capacitor.getPlatform() === "ios" ? "Apple" : "Google"} Media Services terms. You can request a refund or manage your subscription in ${Capacitor.getPlatform() === "ios" ? "Apple" : "Google"} ID settings.`}
                />
              )}
            </div>
          </div>

          {/* Trust Footer */}
          <div style={fadeIn(4)} className="flex flex-wrap justify-center gap-4 py-3 text-xs text-muted-foreground">
            {[
              { icon: Lock, label: "256-bit encryption" },
              { icon: Shield, label: "Verified by Teslys" },
              { icon: CheckCircle, label: "Secure platform" },
            ].map(({ icon: TIcon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <TIcon className="h-3.5 w-3.5 text-primary/60" />{label}
              </span>
            ))}
          </div>
        </main>
      </PageContainer>
    </DashboardLayout>
  );
}

/* ── FAQ Accordion Item ── */
function FaqItem({ question, answer, links }: { question: string; answer: string; links?: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="rounded-xl bg-background/50 border border-border/40 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-accent/30 transition-colors text-left"
      >
        <span>{question}</span>
        <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed space-y-2">
          <p>{answer}</p>
          {links && (
            <div className="flex flex-wrap gap-2 pt-1">
              {links.map((l) => (
                <button
                  key={l.href}
                  onClick={() => navigate(l.href)}
                  className="text-primary underline underline-offset-2 text-xs"
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
