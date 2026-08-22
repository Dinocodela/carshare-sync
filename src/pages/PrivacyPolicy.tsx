import { SEO } from "@/components/SEO";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Shield } from "lucide-react";
import { LegalSection, LegalList, LegalTOC } from "@/components/legal/LegalSection";

const LAST_UPDATED = "August 22, 2026";

const SECTIONS = [
  { id: "scope", title: "Scope of this policy" },
  { id: "collect", title: "Information we collect" },
  { id: "sources", title: "Where we get it" },
  { id: "use", title: "How we use information" },
  { id: "sharing", title: "How we share information" },
  { id: "providers", title: "Service providers" },
  { id: "sms", title: "SMS & phone data" },
  { id: "cookies", title: "Cookies, analytics & advertising" },
  { id: "push", title: "Push notifications & device data" },
  { id: "social", title: "Social media & marketing" },
  { id: "retention", title: "Data retention" },
  { id: "security", title: "Security" },
  { id: "choices", title: "Your choices" },
  { id: "california", title: "California privacy rights" },
  { id: "gdpr", title: "UK & EEA rights" },
  { id: "states", title: "Other U.S. state rights" },
  { id: "transfers", title: "International transfers" },
  { id: "children", title: "Children" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact us" },
];

const PI_CATEGORIES: {
  category: string;
  examples: string;
  purpose: string;
  shared: string;
}[] = [
  {
    category: "Identifiers",
    examples: "Name, email, phone number, mailing address, account ID, IP address",
    purpose: "Account creation, authentication, support, notices",
    shared: "Hosting, email, SMS, and support providers",
  },
  {
    category: "Customer records",
    examples: "Billing contact details, payout preferences, signed agreements",
    purpose: "Payouts, contract records, compliance",
    shared: "Payment and payout providers",
  },
  {
    category: "Commercial information",
    examples: "Subscriptions, orders, trips, earnings and expense records, claims",
    purpose: "Delivering the Service and reporting to owners",
    shared: "Rental marketplaces, commerce and app-store providers",
  },
  {
    category: "Vehicle information",
    examples: "Make, model, year, VIN, license plate, mileage, photos, general location",
    purpose: "Listing, managing, and insuring vehicles",
    shared: "Rental marketplaces and insurers",
  },
  {
    category: "Internet activity",
    examples: "Pages viewed, referral source, device and browser type, app events",
    purpose: "Performance, security, and (with consent) analytics",
    shared: "Analytics and advertising providers, only with consent",
  },
  {
    category: "Geolocation",
    examples: "Approximate location derived from IP; general vehicle location you provide",
    purpose: "Regional pricing, listing accuracy, fraud prevention",
    shared: "Rental marketplaces where relevant",
  },
  {
    category: "Inferences",
    examples: "Interest in hosting vs. renting, engagement level",
    purpose: "Relevant content and, with consent, marketing",
    shared: "Advertising providers, only with consent",
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy - Teslys Tesla Car Sharing Platform"
        description="How Teslys collects, uses, shares, retains, and protects personal information, plus your CCPA/CPRA and GDPR rights and how to exercise them."
        keywords="Teslys privacy policy, Tesla car sharing privacy, data protection, personal information security, car rental privacy, CCPA, GDPR"
        canonical="https://teslys.app/privacy"
        ogType="article"
      />
      <div className="min-h-screen bg-background">
        <ScreenHeader title="Privacy Policy" fallbackHref="/" />

        <div className="px-4 sm:px-6 py-8 pb-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>Last updated: {LAST_UPDATED}</span>
            </div>

            <p className="text-base text-foreground/85 leading-relaxed mb-10">
              This Privacy Policy explains how Teslys ("we", "our", "us")
              collects, uses, shares, and protects personal information when you
              use teslys.app, our mobile apps, and related services (the
              "Service"). It applies to vehicle owners, co-hosts, investors,
              shoppers, and visitors. You can manage cookie and tracking choices
              any time in our{" "}
              <a
                className="text-primary underline underline-offset-4"
                href="/privacy-center"
              >
                Privacy Center
              </a>
              .
            </p>

            <LegalTOC sections={SECTIONS} />

            <div className="space-y-10">
              <LegalSection id="scope" title="1. Scope of this policy">
                <p>
                  Teslys is the controller (or "business") for personal
                  information processed through the Service. This policy does
                  not cover third parties with their own relationship with you —
                  for example rental marketplaces, insurers, app stores, or
                  payment processors. Their handling of your data is governed by
                  their own privacy policies.
                </p>
              </LegalSection>

              <LegalSection id="collect" title="2. Information we collect">
                <p>
                  We collect the categories below. We do not knowingly collect
                  government ID numbers, precise background-check data, biometric
                  data, or full payment card numbers — payment credentials are
                  handled directly by our payment and app-store providers.
                </p>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto rounded-2xl border border-border/60 mt-4">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Examples</th>
                        <th className="px-4 py-3 font-semibold">Purpose</th>
                        <th className="px-4 py-3 font-semibold">Disclosed to</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {PI_CATEGORIES.map((row) => (
                        <tr key={row.category} className="hover:bg-muted/20 align-top">
                          <td className="px-4 py-3 font-medium text-foreground">
                            {row.category}
                          </td>
                          <td className="px-4 py-3 text-foreground/80">{row.examples}</td>
                          <td className="px-4 py-3 text-foreground/80">{row.purpose}</td>
                          <td className="px-4 py-3 text-foreground/80">{row.shared}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-3 mt-4">
                  {PI_CATEGORIES.map((row) => (
                    <div
                      key={row.category}
                      className="rounded-2xl border border-border/60 bg-background p-4"
                    >
                      <p className="font-medium text-foreground mb-1">{row.category}</p>
                      <p className="text-sm text-foreground/80 mb-2">{row.examples}</p>
                      <p className="text-xs text-muted-foreground">
                        Purpose: {row.purpose}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Disclosed to: {row.shared}
                      </p>
                    </div>
                  ))}
                </div>
              </LegalSection>

              <LegalSection id="sources" title="3. Where we get it">
                <LegalList
                  items={[
                    "Directly from you — registration, vehicle listings, forms, support requests, agreements you sign.",
                    "Automatically — cookies, app SDKs, server logs, and device identifiers (non-essential tracking only after consent).",
                    "From rental marketplaces — trip, earnings, expense, and claim records for vehicles we manage.",
                    "From payment and app-store providers — subscription status and purchase identifiers, not card numbers.",
                    "From social platforms — where you comment on or message our accounts and we respond or capture a lead.",
                  ]}
                />
              </LegalSection>

              <LegalSection id="use" title="4. How we use information">
                <LegalList
                  items={[
                    "Create and administer your account, and approve or decline enrollment.",
                    "List, manage, price, and operate enrolled vehicles, and report trips, earnings, expenses, and claims.",
                    "Process subscriptions, purchases, payouts, and restore purchases.",
                    "Provide customer support and send transactional notices (account, security, booking, payout).",
                    "Send marketing communications where you have opted in, and measure their performance.",
                    "Improve reliability, performance, and features, including aggregated and de-identified analysis.",
                    "Detect, prevent, and investigate fraud, abuse, security incidents, and Terms violations.",
                    "Comply with legal, tax, insurance, and regulatory obligations, and establish or defend legal claims.",
                  ]}
                />
              </LegalSection>

              <LegalSection id="sharing" title="5. How we share information">
                <p>
                  <strong className="text-foreground">
                    We do not sell your personal information for money.
                  </strong>{" "}
                  We share it only as described here:
                </p>
                <LegalList
                  items={[
                    "With service providers who process data on our behalf under contract (see below).",
                    "With rental marketplaces and insurers, as needed to list vehicles, complete trips, and handle claims.",
                    "With advertising and analytics partners, only where you have given consent — this may qualify as 'sharing' for cross-context behavioral advertising under California law, and you can opt out in the Privacy Center.",
                    "With professional advisors (legal, accounting, insurance) under confidentiality.",
                    "When required by law, subpoena, or to protect the rights, safety, or property of Teslys, our users, or the public.",
                    "In connection with a merger, financing, acquisition, or sale of assets, subject to this policy.",
                  ]}
                />
              </LegalSection>

              <LegalSection id="providers" title="6. Service providers">
                <p>
                  We use vetted providers to run the Service. Current categories
                  and representative providers:
                </p>
                <LegalList
                  items={[
                    "Cloud hosting, database, and authentication — Supabase.",
                    "Content delivery and security — Cloudflare (including bot/abuse protection on forms).",
                    "Transactional and marketing email — Resend.",
                    "Text messaging — Twilio.",
                    "App-store billing and subscription management — Apple, Google, RevenueCat.",
                    "Commerce and merchandise fulfillment — Shopify.",
                    "Analytics and tag management — Google (loaded only after you consent).",
                    "Mobile app attribution and in-app analytics — AppsFlyer, used in our iOS and Android apps to measure installs, campaign attribution, and in-app events. AppsFlyer runs in the native apps and is not currently gated by the website cookie banner.",
                    "Push notification delivery — Firebase Cloud Messaging (Google) on Android and the Apple Push Notification service on iOS, which process a device push token to deliver notifications.",
                    "Internal operational alerting — Slack.",
                    "Social publishing and lead capture — Meta (Instagram).",
                    "Vehicle management data feeds — third-party car-sharing marketplaces (such as Turo and Eon) that send us trip, earnings, and claim information for vehicles we manage.",
                  ]}
                />
                <p>
                  This list may change as we add or replace tools; we keep it
                  current and describe categories so the disclosure stays
                  accurate between updates.
                </p>
              </LegalSection>

              <LegalSection id="sms" title="7. SMS & phone data">
                <p>
                  <strong className="text-foreground">
                    We do not sell, rent, or share mobile phone numbers or SMS
                    consent with third parties or affiliates for their own
                    marketing purposes.
                  </strong>{" "}
                  Phone numbers collected for messaging are used only to deliver
                  the messages you opted into and are shared only with our
                  messaging provider to transmit them. Text messaging is opt-in,
                  consent is never a condition of purchase, and you can reply
                  STOP at any time. Full details are in our{" "}
                  <a
                    className="text-primary underline underline-offset-4"
                    href="/sms-consent"
                  >
                    SMS Consent & Messaging Terms
                  </a>
                  .
                </p>
              </LegalSection>

              <LegalSection id="cookies" title="8. Cookies, analytics & advertising">
                <p>
                  We use cookies and similar technologies for essential
                  functionality (login, security, preferences) and, only with
                  your consent, for analytics and marketing. Non-essential
                  trackers do not load until you opt in, and your choice is
                  stored for about six months before we ask again. We honor
                  Global Privacy Control (GPC) signals as an opt-out of sharing
                  for targeted advertising where required. Review the full list
                  of cookies in our{" "}
                  <a
                    className="text-primary underline underline-offset-4"
                    href="/cookie-policy"
                  >
                    Cookie Policy
                  </a>{" "}
                  or change your choices in the{" "}
                  <a
                    className="text-primary underline underline-offset-4"
                    href="/privacy-center"
                  >
                    Privacy Center
                  </a>
                  .
                </p>
              </LegalSection>

              <LegalSection id="push" title="9. Push notifications & device data">
                <p>
                  In our mobile apps we may collect a device push token, device
                  model, OS version, and app version to deliver notifications
                  and diagnose issues. You can disable push notifications in
                  your device settings at any time; transactional information
                  will still be available in-app and by email.
                </p>
              </LegalSection>

              <LegalSection id="social" title="10. Social media & marketing">
                <p>
                  When you comment on or message our social accounts, the
                  platform shares limited profile information with us so we can
                  respond and, where relevant, follow up about our services. We
                  keep that contact information only as long as needed for the
                  inquiry or until you ask us to delete it. Platform data
                  handling is also governed by the platform's own policy.
                </p>
              </LegalSection>

              <LegalSection id="retention" title="11. Data retention">
                <p>
                  We keep personal information only as long as needed for the
                  purposes described here. General guidelines:
                </p>
                <LegalList
                  items={[
                    "Account and profile data — while your account is active, then deleted or anonymized after closure unless a longer period is required.",
                    "Financial records (trips, earnings, expenses, payouts, invoices) — typically up to 7 years to meet tax and accounting obligations.",
                    "Signed agreements and claim records — for the length of the applicable limitations period.",
                    "Support and messaging history — generally up to 3 years.",
                    "Consent records — retained as proof of consent as required by law.",
                    "Analytics data — retained per provider settings, in de-identified or aggregated form where possible.",
                  ]}
                />
              </LegalSection>

              <LegalSection id="security" title="12. Security">
                <p>
                  We use encryption in transit (HTTPS/TLS), encryption at rest
                  for our database, row-level access controls so users can reach
                  only their own records, server-side authorization on
                  privileged operations, secret management for API credentials,
                  rate limiting and bot protection on public forms, and security
                  headers including HSTS and a content security policy. No
                  system is perfectly secure; we cannot guarantee absolute
                  security, and you are responsible for keeping your credentials
                  confidential. If a breach affecting your personal information
                  occurs, we will notify you and regulators as required by law.
                </p>
              </LegalSection>

              <LegalSection id="choices" title="13. Your choices">
                <LegalList
                  items={[
                    <>Access and update profile information in <em className="text-foreground">Settings</em>.</>,
                    <>Manage cookie and tracking choices in the <a className="text-primary underline underline-offset-4" href="/privacy-center">Privacy Center</a>.</>,
                    "Unsubscribe from marketing email using the link in any marketing message.",
                    "Reply STOP to any text message to end SMS.",
                    "Turn off push notifications in your device settings.",
                    "Manage or cancel subscriptions in your Apple ID or Google Play settings.",
                    <>Delete your account in <em className="text-foreground">Settings → Delete Account</em> or via the <a className="text-primary underline underline-offset-4" href="/delete-account">account deletion page</a>.</>,
                  ]}
                />
              </LegalSection>

              <LegalSection id="california" title="14. California privacy rights (CCPA/CPRA)">
                <p>California residents have the right to:</p>
                <LegalList
                  items={[
                    "Know what personal information we collect, use, disclose, and the purposes for each (see the table in section 2).",
                    "Access a copy of the personal information we hold about you.",
                    "Correct inaccurate personal information.",
                    "Delete personal information, subject to legal exceptions such as tax and contract records.",
                    "Opt out of the sale or sharing of personal information for cross-context behavioral advertising.",
                    "Limit the use of sensitive personal information — we do not use sensitive personal information for inferring characteristics.",
                    "Non-discrimination for exercising any of these rights.",
                  ]}
                />
                <p>
                  To exercise a right, use{" "}
                  <a
                    className="text-primary underline underline-offset-4"
                    href="/privacy-center"
                  >
                    Do Not Sell or Share My Information
                  </a>{" "}
                  in the Privacy Center or email support@teslys.com with
                  "Privacy Request" in the subject. We verify requests using the
                  email or phone number on your account and respond within 45
                  days (extendable by 45 more where permitted). An authorized
                  agent may submit a request with proof of authorization. We do
                  not sell personal information for money and do not knowingly
                  sell or share the personal information of anyone under 16.
                </p>
              </LegalSection>

              <LegalSection id="gdpr" title="15. UK & EEA rights (GDPR)">
                <p>
                  If you are in the UK or the European Economic Area, you have
                  the right to access, rectify, erase, restrict, and port your
                  personal data, to object to processing based on legitimate
                  interests or direct marketing, and to withdraw consent at any
                  time without affecting prior processing. Our legal bases are:
                </p>
                <LegalList
                  items={[
                    "Performance of a contract — operating your account, managing your vehicle, processing purchases and payouts.",
                    "Consent — non-essential cookies, analytics, advertising, SMS, and marketing email.",
                    "Legitimate interests — securing the Service, preventing fraud, improving features, and limited direct communications.",
                    "Legal obligation — tax, accounting, insurance, and regulatory recordkeeping.",
                  ]}
                />
                <p>
                  You may lodge a complaint with your local supervisory
                  authority or the UK ICO. Contact support@teslys.com to
                  exercise any right.
                </p>
              </LegalSection>

              <LegalSection id="states" title="16. Other U.S. state rights">
                <p>
                  Residents of states with comprehensive privacy laws (including
                  Virginia, Colorado, Connecticut, Utah, Texas, Oregon, and
                  Montana) have similar rights to access, correct, delete, and
                  obtain a copy of their personal data, and to opt out of
                  targeted advertising and profiling with legal effects. Use the
                  same request channels above. Where an appeal right applies and
                  we decline a request, you may appeal by replying to our
                  decision email.
                </p>
              </LegalSection>

              <LegalSection id="transfers" title="17. International transfers">
                <p>
                  We are based in the United States and process data there. If
                  you access the Service from outside the U.S., your information
                  will be transferred to and processed in the U.S., where data
                  protection laws may differ. Where required, we rely on
                  appropriate safeguards such as the European Commission's
                  Standard Contractual Clauses with our providers.
                </p>
              </LegalSection>

              <LegalSection id="children" title="18. Children">
                <p>
                  The Service is intended for adults and is not directed to
                  children under 16. We do not knowingly collect personal
                  information from children under 16. If you believe a child has
                  provided us information, email support@teslys.com and we will
                  delete it.
                </p>
              </LegalSection>

              <LegalSection id="changes" title="19. Changes to this policy">
                <p>
                  We may update this policy. Material changes will be posted
                  here with a new "Last updated" date and, where required by
                  law, notified to you by email or in-app before taking effect.
                </p>
              </LegalSection>

              <LegalSection id="contact" title="20. Contact us">
                <p>
                  Privacy questions or requests: email{" "}
                  <a
                    className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                    href="mailto:support@teslys.com"
                  >
                    support@teslys.com
                  </a>{" "}
                  or write to Teslys, 475 Washington Blvd, Marina Del Rey, CA
                  90292.
                </p>
              </LegalSection>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
