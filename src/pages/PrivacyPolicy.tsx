import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { ScreenHeader } from "@/components/ScreenHeader";

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy - Teslys Tesla Car Sharing Platform"
        description="Teslys privacy policy. Learn how we collect, use, and protect your personal information on our Tesla car sharing platform. Your data security is our priority."
        keywords="Teslys privacy policy, Tesla car sharing privacy, data protection, personal information security, car rental privacy"
        canonical="https://teslys.app/privacy-policy"
        ogType="article"
      />
      <DashboardLayout>
        <ScreenHeader title="Privacy Policy" fallbackHref="/settings" />
        <PageContainer className="py-4">
          <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
            <p className="text-muted-foreground">
              Last updated: September 25, 2025
            </p>

            <p>
              This Privacy Policy explains how Teslys (“we”, “our”, “us”)
              collects, uses, and shares information when you use the Teslys app
              and services (the “Service”). By using the Service, you agree to
              this policy.
            </p>

            <h2>Information We Collect</h2>
            <ul>
              <li>
                <strong>Account data</strong> (e.g., name, email) to create and
                manage your account.
              </li>
              <li>
                <strong>Usage data</strong> to improve app performance and
                features.
              </li>
              <li>
                <strong>Purchase data</strong> (subscription status and product
                identifiers) from the App Store to enable premium features. We
                do not receive your full payment card details.
              </li>
            </ul>

            <h2>How We Use Information</h2>
            <ul>
              <li>Provide, maintain, and improve the Service.</li>
              <li>
                Enable subscriptions, restore purchases, and manage access.
              </li>
              <li>
                Communicate with you about updates, support, and account
                notices.
              </li>
              <li>
                Protect against fraud, abuse, and violations of our Terms.
              </li>
            </ul>

            <h2>Sharing</h2>
            <p>
              We share data with service providers (e.g., authentication,
              analytics, purchase validation) that help us operate the Service.
              We do not sell your personal information.
            </p>

            <h2>Data Retention</h2>
            <p>
              We retain information for as long as your account is active or as
              needed to provide the Service and comply with legal obligations.
              You can delete your account in
              <em> Settings → Delete Account</em>.
            </p>

            <h2>Your Choices</h2>
            <ul>
              <li>
                Access and update profile information in <em>Settings</em>.
              </li>
              <li>Manage subscriptions in Apple ID settings.</li>
              <li>
                Delete your account in <em>Settings → Delete Account</em>.
              </li>
            </ul>

            <h2>Children</h2>
            <p>
              The Service is not intended for children under the age where
              consent is required by law.
            </p>

            <h2>Changes</h2>
            <p>
              We may update this policy. Material changes will be posted in-app
              with an updated date.
            </p>

            <h2>Contact</h2>
            <p>
              Questions? Email{" "}
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
      </DashboardLayout>
    </>
  );
}
