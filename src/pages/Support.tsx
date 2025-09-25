// src/pages/Support.tsx
import { useEffect, useMemo, useState } from "react";
import { SEO } from "@/components/SEO";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";
import { Device } from "@capacitor/device";
import { Mail, ExternalLink, RefreshCw, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast"; // your toast wrapper
import { ScreenHeader } from "@/components/ScreenHeader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Support() {
  const { user } = useAuth();
  const [appVersion, setAppVersion] = useState<string>("");
  const [deviceInfo, setDeviceInfo] = useState<{
    model?: string;
    os?: string;
    osVersion?: string;
    platform?: string;
  }>({});
  const email = user?.email ?? "";
  const uid = user?.id ?? "";

  useEffect(() => {
    (async () => {
      try {
        // App version/build (when native)
        if (Capacitor.isNativePlatform()) {
          const info = await App.getInfo(); // { name, version, build }
          setAppVersion(`${info.version} (${info.build})`);
          const dev = await Device.getInfo();
          setDeviceInfo({
            model: dev.model,
            os: dev.operatingSystem,
            osVersion: dev.osVersion,
            platform: dev.platform,
          });
        } else {
          setAppVersion("web");
          setDeviceInfo({
            platform: "web",
            os: navigator.platform,
            osVersion: "",
            model: "",
          });
        }
      } catch {
        // best effort only
      }
    })();
  }, []);

  const manageSubsUrl = useMemo(
    () =>
      Capacitor.getPlatform() === "ios"
        ? "itms-apps://apps.apple.com/account/subscriptions"
        : "https://play.google.com/store/account/subscriptions",
    []
  );

  const openUrl = async (url: string) => {
    try {
      if (Capacitor.isNativePlatform()) await Browser.open({ url });
      else window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
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
    window.location.href = `mailto:support@teslys.app?subject=${subject}&body=${body}`;
  };

  const onOpenManage = () => openUrl(manageSubsUrl);

  return (
    <>
      <DashboardLayout>
        <ScreenHeader title="Support" fallbackHref="/settings" />

        <SEO
          title="Help & Support – Teslys"
          description="Get help with subscriptions, restore purchases, account deletion, and contacting Teslys support."
        />
        <PageContainer className="py-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <header className="prose prose-gray dark:prose-invert">
              <h1>Help &amp; Support</h1>
              <p className="text-muted-foreground">
                Find quick answers and contact our team if you need more help.
              </p>
            </header>

            {/* Quick actions */}
            <div className={`grid gap-4 grid-cols-12`}>
              {Capacitor.isNativePlatform() && (
                <Card
                  className={`
              ${
                Capacitor.isNativePlatform()
                  ? "sm:col-span-6 col-span-12"
                  : "sm:col-start-1 sm:col-span-6 col-span-12"
              }
            `}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Manage Subscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Open your{" "}
                      {Capacitor.isNativePlatform() &&
                        (Capacitor.getPlatform() === "ios"
                          ? "App Store"
                          : "Play Store")}
                      {Capacitor.getPlatform() === "ios"
                        ? "App Store"
                        : "Play Store"}{" "}
                      subscription settings to cancel or change plans.
                    </p>
                    <Button onClick={onOpenManage}>
                      Open{" "}
                      {Capacitor.getPlatform() === "ios"
                        ? "App Store"
                        : "Play Store"}{" "}
                      Subscriptions
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card
                className={`
              ${
                Capacitor.isNativePlatform()
                  ? "sm:col-span-6 col-span-12"
                  : "sm:col-start-1 sm:col-span-6 col-span-12"
              }
            `}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Contact Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Email us with your account details and a brief description.
                  </p>
                  <Button
                    className=" justify-between"
                    onClick={openSupportMail}
                  >
                    support@teslys.app
                    <Mail className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* FAQ */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">FAQ</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray dark:prose-invert">
                {Capacitor.isNativePlatform() && (
                  <>
                    <h3>How do I subscribe or change my plan?</h3>
                    <p>
                      Go to <strong>Settings → Subscription</strong> and tap{" "}
                      <em>View Plans</em>. On{" "}
                      {Capacitor.getPlatform() === "ios"
                        ? "App Store"
                        : "Play Store"}{" "}
                      you’ll see local pricing and can purchase through{" "}
                      {Capacitor.getPlatform() === "ios"
                        ? "App Store"
                        : "Play Store"}
                      . To change or cancel, tap{" "}
                      <em>
                        Manage on{" "}
                        {Capacitor.getPlatform() === "ios"
                          ? "App Store"
                          : "Play Store"}{" "}
                        Subscriptions
                      </em>{" "}
                      or use the button above.
                    </p>

                    <h3>How do I restore purchases?</h3>
                    <p>
                      In the paywall or the Subscription card, tap{" "}
                      <em>Restore Purchases</em>. Make sure you’re signed in
                      with the same{" "}
                      {Capacitor.getPlatform() === "ios" ? "Apple" : "Google"}{" "}
                      you used to buy the subscription.
                    </p>
                  </>
                )}

                <h3>Where can I read the Terms and Privacy Policy?</h3>
                <p>
                  See our{" "}
                  <a className="underline underline-offset-2" href="/terms">
                    Terms of Use
                  </a>{" "}
                  and{" "}
                  <a className="underline underline-offset-2" href="/privacy">
                    Privacy Policy
                  </a>
                  .
                </p>

                <h3>How do I delete my account?</h3>
                <p>
                  In the app, go to <strong>Settings → Delete Account</strong>.
                  This permanently removes your account and associated data. If
                  you need help, email{" "}
                  <a
                    className="underline underline-offset-2"
                    href="mailto:support@teslys.app"
                  >
                    support@teslys.app
                  </a>
                  .
                </p>

                {Capacitor.isNativePlatform() && (
                  <>
                    <h3>Refunds</h3>
                    <p>
                      Purchases on{" "}
                      {Capacitor.getPlatform() === "ios" ? "iOS" : "Android"}{" "}
                      are processed by{" "}
                      {Capacitor.getPlatform() === "ios" ? "Apple" : "Google"}.
                      Refunds are handled under{" "}
                      {Capacitor.getPlatform() === "ios" ? "Apple" : "Google"}{" "}
                      Media Services terms. You can request a refund or manage
                      your subscription in{" "}
                      {Capacitor.getPlatform() === "ios" ? "Apple" : "Google"}{" "}
                      ID settings.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Small diagnostic footer */}
          </div>
        </PageContainer>
      </DashboardLayout>
    </>
  );
}
