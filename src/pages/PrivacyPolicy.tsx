import { SEO } from "@/components/SEO";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Shield } from "lucide-react";

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
      <div className="min-h-screen bg-background">
        <ScreenHeader title="Privacy Policy" fallbackHref="/" />

        <div className="px-4 sm:px-6 py-8 pb-16">
          <div className="max-w-3xl mx-auto">
            {/* Last Updated Badge */}
            <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>Last updated: September 25, 2025</span>
            </div>

            {/* Intro */}
            <p className="text-base text-foreground/85 leading-relaxed mb-10">
              This Privacy Policy explains how Teslys ("we", "our", "us")
              collects, uses, and shares information when you use the Teslys app
              and services (the "Service"). By using the Service, you agree to
              this policy.
            </p>

            {/* Sections */}
            <div className="space-y-10">
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">
                  Information We Collect
                </h2>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span><strong className="text-foreground">Account data</strong> (e.g., name, email) to create and manage your account.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span><strong className="text-foreground">Usage data</strong> to improve app performance and features.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span><strong className="text-foreground">Purchase data</strong> (subscription status and product identifiers) from the App Store to enable premium features. We do not receive your full payment card details.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">
                  How We Use Information
                </h2>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Provide, maintain, and improve the Service.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Enable subscriptions, restore purchases, and manage access.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Communicate with you about updates, support, and account notices.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Protect against fraud, abuse, and violations of our Terms.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">Sharing</h2>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  We share data with service providers (e.g., authentication,
                  analytics, purchase validation) that help us operate the Service.
                  We do not sell your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">Data Retention</h2>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  We retain information for as long as your account is active or as
                  needed to provide the Service and comply with legal obligations.
                  You can delete your account in{" "}
                  <em className="text-foreground">Settings → Delete Account</em>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">Your Choices</h2>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Access and update profile information in <em className="text-foreground">Settings</em>.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Manage subscriptions in Apple ID settings.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>Delete your account in <em className="text-foreground">Settings → Delete Account</em>.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">Children</h2>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  The Service is not intended for children under the age where
                  consent is required by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">Changes</h2>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  We may update this policy. Material changes will be posted in-app
                  with an updated date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">Contact</h2>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  Questions? Email{" "}
                  <a
                    className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                    href="mailto:support@teslys.com"
                  >
                    support@teslys.com
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
