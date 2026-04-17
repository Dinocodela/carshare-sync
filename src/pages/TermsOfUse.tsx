import { SEO } from "@/components/SEO";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FileText } from "lucide-react";

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
      <div className="min-h-screen bg-background">
        <ScreenHeader title="Terms of Use" fallbackHref="/" />

        <div className="px-4 sm:px-6 py-8 pb-16">
          <div className="max-w-3xl mx-auto">
            {/* Last Updated Badge */}
            <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
              <FileText className="w-4 h-4 text-primary" />
              <span>Last updated: September 25, 2025</span>
            </div>

            {/* Intro */}
            <p className="text-base text-foreground/85 leading-relaxed mb-10">
              These Terms of Use ("Terms") govern your use of the Teslys mobile
              application and related services (the "Service") provided by
              Teslys ("we", "our", "us"). By using the Service, you agree to
              these Terms and our{" "}
              <a className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors" href="/privacy">
                Privacy Policy
              </a>
              .
            </p>

            {/* Sections */}
            <div className="space-y-10">
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">
                  Subscriptions & Billing
                </h2>
                <ul className="space-y-3 mb-5">
                  <li className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span><strong className="text-foreground">Pro Monthly</strong> – length: 1 month</span>
                  </li>
                  <li className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span><strong className="text-foreground">Pro Annual</strong> – length: 1 year</span>
                  </li>
                </ul>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  Prices are shown in-app and may vary by region. Payment is charged
                  to your App Store account upon confirmation. Subscriptions
                  auto-renew unless canceled at least 24 hours before the period
                  ends. Manage or cancel in Apple ID settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">
                  Restore Purchases & Refunds
                </h2>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  Use <em className="text-foreground">Restore Purchases</em> in the app to re-enable prior
                  purchases. Refunds for iOS purchases are handled under Apple Media
                  Services terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">
                  Acceptable Use, Content & Termination
                </h2>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  You agree not to misuse the Service. We may suspend or terminate
                  accounts for violations. You can delete your account in{" "}
                  <em className="text-foreground">Settings → Delete Account</em>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 tracking-tight">Contact</h2>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  Contact{" "}
                  <a
                    className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                    href="mailto:support@teslys.com"
                  >
                    support@teslys.com
                  </a>{" "}
                  with questions.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
