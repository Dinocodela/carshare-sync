// src/pages/TermsOfUse.tsx
import { SEO } from "@/components/SEO";
import { ScreenHeader } from "@/components/ScreenHeader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";

export default function TermsOfUse() {
  return (
    <>
      <SEO 
        title="Terms of Use - Teslys Tesla Car Sharing Platform"
        description="Teslys terms of use and service agreement. Review the terms and conditions for using our Tesla car sharing platform, including subscription details and acceptable use policy."
        keywords="Teslys terms of use, Tesla car sharing agreement, service terms, car rental terms, subscription terms and conditions"
        canonical="https://teslys.app/terms-of-use"
        ogType="article"
      />
      <DashboardLayout>
        <ScreenHeader title="Terms of Use" fallbackHref="/settings" />
        <PageContainer className="py-8">
          <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
            <h1>Terms of Use</h1>
            <p className="text-muted-foreground">
              Last updated: September 25, 2025
            </p>

            <p>
              These Terms of Use (“Terms”) govern your use of the Teslys mobile
              application and related services (the “Service”) provided by
              Teslys (“we”, “our”, “us”). By using the Service, you agree to
              these Terms and our{" "}
              <a className="underline underline-offset-2" href="/privacy">
                Privacy Policy
              </a>
              .
            </p>

            <h2>Subscriptions & Billing</h2>
            <ul>
              <li>
                <strong>Pro Monthly</strong> – length: 1 month
              </li>
              <li>
                <strong>Pro Annual</strong> – length: 1 year
              </li>
            </ul>
            <p>
              Prices are shown in-app and may vary by region. Payment is charged
              to your App Store account upon confirmation. Subscriptions
              auto-renew unless canceled at least 24 hours before the period
              ends. Manage or cancel in Apple ID settings.
            </p>

            <h2>Restore Purchases & Refunds</h2>
            <p>
              Use <em>Restore Purchases</em> in the app to re-enable prior
              purchases. Refunds for iOS purchases are handled under Apple Media
              Services terms.
            </p>

            <h2>Acceptable Use, Content & Termination</h2>
            <p>
              You agree not to misuse the Service. We may suspend or terminate
              accounts for violations. You can delete your account in{" "}
              <em>Settings → Delete Account</em>.
            </p>

            <h2>Contact</h2>
            <p>
              Contact{" "}
              <a
                className="underline underline-offset-2"
                href="mailto:support@teslys.app"
              >
                support@teslys.app
              </a>{" "}
              with questions.
            </p>
          </div>
        </PageContainer>
      </DashboardLayout>
    </>
  );
}
