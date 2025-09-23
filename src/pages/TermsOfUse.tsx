// src/pages/TermsOfUse.tsx
import { SEO } from "@/components/SEO";
import { PageContainer } from "@/components/layout/PageContainer";
import { Capacitor } from "@capacitor/core";

export default function TermsOfUse() {
  return (
    <>
      <SEO
        title="Terms of Use – Teslys"
        description="End-user Terms of Use for the Teslys app and services."
      />
      <PageContainer className="py-8">
        <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
          <h1>Terms of Use</h1>
          <p className="text-muted-foreground">
            Last updated: September 22, 2025
          </p>

          <p>
            These Terms of Use (“Terms”) govern your access to and use of the
            Teslys mobile application and related services (collectively, the
            “Service”) provided by Teslys (“we,” “our,” or “us”). By using the
            Service, you agree to these Terms and our{" "}
            <a className="underline underline-offset-2" href="/privacy">
              Privacy Policy
            </a>
            . If you do not agree, do not use the Service.
          </p>

          <h2>1. Eligibility & Account</h2>
          <p>
            You must be legally able to enter into these Terms and comply with
            all applicable laws to use the Service. You are responsible for
            maintaining the confidentiality of your login credentials and for
            all activity under your account.
          </p>

          <h2>2. Subscriptions & Billing</h2>
          <p>
            Teslys offers auto-renewing subscriptions that unlock premium
            features. Current products may include:
          </p>
          <ul>
            <li>
              <strong>Pro Monthly</strong> – length: 1 month
            </li>
            <li>
              <strong>Pro Annual</strong> – length: 1 year
            </li>
          </ul>
          <p>
            Pricing is shown clearly in-app at the time of purchase and may vary
            by region and currency. Payment is charged to your{" "}
            {Capacitor.getPlatform() === "ios" ? "App Store" : "Play Store"}{" "}
            account upon confirmation of purchase. Subscriptions renew
            automatically unless canceled at least 24 hours before the end of
            the current period. Your account will be charged for renewal within
            24 hours prior to the end of the current period.
          </p>
          <p>
            You can manage or cancel your subscription in your{" "}
            {Capacitor.getPlatform() === "ios" ? "App Store" : "Play Store"}{" "}
            account settings (e.g., Settings &gt; {`[your name]`} &gt;
            Subscriptions). If you uninstall the app, your subscription does not
            automatically cancel.
          </p>

          <h3>Free Trials</h3>
          <p>
            If a trial is offered, any unused portion is forfeited when you
            purchase a subscription. Trials convert to a paid subscription
            unless canceled at least 24 hours before the trial ends.
          </p>

          <h3>Refunds</h3>
          <p>
            Refunds for purchases made via the{" "}
            {Capacitor.getPlatform() === "ios" ? "App Store" : "Play Store"} are
            handled by
            {Capacitor.getPlatform() === "ios" ? "Apple" : "Play Store"} under
            the {Capacitor.getPlatform() === "ios" ? "Apple" : "Play Store"}{" "}
            Media Services terms. For help, visit{" "}
            {Capacitor.getPlatform() === "ios" ? "App Store" : "Play Store"}’s
            support resources or manage your subscription in{" "}
            {Capacitor.getPlatform() === "ios" ? "App Store" : "Play Store"} ID
            settings.
          </p>

          <h2>3. Restore Purchases</h2>
          <p>
            If you re-install or switch devices, you can restore your
            subscription from within the app using <em>Restore Purchases</em>.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>
            You agree not to misuse the Service, including by attempting to
            reverse engineer, interfere with, or circumvent any security or
            access controls; using the Service to post unlawful or infringing
            content; or violating any applicable law or third-party rights.
          </p>

          <h2>5. Content & License</h2>
          <p>
            We grant you a limited, non-exclusive, non-transferable, revocable
            license to use the app solely for its intended purpose. All rights
            not expressly granted are reserved by Teslys and its licensors.
          </p>

          <h2>6. Termination</h2>
          <p>
            We may suspend or terminate your access for violations of these
            Terms or where required by law. You may terminate by deleting your
            account in the app (see Settings &gt; Delete Account). Termination
            does not entitle you to a refund unless required by applicable law
            or {Capacitor.getPlatform() === "ios" ? "Apple" : "Google"} policy.
          </p>

          <h2>7. Disclaimers & Limitation of Liability</h2>
          <p>
            The Service is provided “as is” without warranties of any kind, to
            the maximum extent permitted by law. Teslys will not be liable for
            any indirect, incidental, special, consequential, or punitive
            damages, or for any loss of data, profits, or revenues, arising from
            or related to your use of the Service.
          </p>

          <h2>8. Changes to the Service or Terms</h2>
          <p>
            We may update the Service and these Terms from time to time.
            Material changes will be posted in-app or on our website with an
            updated “Last updated” date. Your continued use constitutes
            acceptance of the changes.
          </p>

          <h2>9. Privacy</h2>
          <p>
            For information about how we collect, use, and share your
            information, please see our{" "}
            <a className="underline underline-offset-2" href="/privacy">
              Privacy Policy
            </a>
            .
          </p>

          {Capacitor.isNativePlatform() &&
            Capacitor.getPlatform() === "ios" && (
              <>
                <h2>10. Apple Terms</h2>
                <p>
                  If you obtained the app from the Apple App Store, you also
                  agree to the Apple Media Services Terms and Apple’s Licensed
                  Application End User License Agreement (EULA). In the event of
                  a conflict, Apple’s EULA may apply to your use of the iOS
                  version of the app.
                </p>
              </>
            )}

          <h2>11. Contact</h2>
          <p>
            Questions about these Terms? Contact us at{" "}
            <a
              className="underline underline-offset-2"
              href="mailto:support@teslys.app"
            >
              support@teslys.app
            </a>
            .
          </p>
        </div>
      </PageContainer>
    </>
  );
}
