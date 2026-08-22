import { SEO } from "@/components/SEO";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FileText } from "lucide-react";
import { LegalSection, LegalList, LegalTOC } from "@/components/legal/LegalSection";

const LAST_UPDATED = "August 22, 2026";

const SECTIONS = [
  { id: "about", title: "About these Terms" },
  { id: "services", title: "What Teslys offers" },
  { id: "eligibility", title: "Eligibility & accounts" },
  { id: "management", title: "Vehicle management (owners)" },
  { id: "fees", title: "Fees, splits & payouts" },
  { id: "claims", title: "Insurance, damage & claims" },
  { id: "renters", title: "Renting a Tesla" },
  { id: "investor", title: "Investor program" },
  { id: "shop", title: "Shop, wraps & digital downloads" },
  { id: "subscriptions", title: "Subscriptions & billing" },
  { id: "communications", title: "Communications & SMS" },
  { id: "content", title: "Your content & acceptable use" },
  { id: "thirdparty", title: "Third-party services" },
  { id: "ip", title: "Intellectual property & trademarks" },
  { id: "disclaimer", title: "Disclaimers" },
  { id: "liability", title: "Limitation of liability" },
  { id: "indemnity", title: "Indemnification" },
  { id: "termination", title: "Suspension & termination" },
  { id: "disputes", title: "Dispute resolution & arbitration" },
  { id: "general", title: "General terms" },
  { id: "contact", title: "Contact" },
];

export default function TermsOfUse() {
  return (
    <>
      <SEO
        title="Terms of Use - Teslys Tesla Car Sharing Platform"
        description="Teslys terms of use and service agreement covering vehicle management, revenue splits, rentals, the investor program, subscriptions, and dispute resolution."
        keywords="Teslys terms of use, Tesla car sharing agreement, service terms, car rental terms, subscription terms and conditions"
        canonical="https://teslys.app/terms"
        ogType="article"
      />
      <div className="min-h-screen bg-background">
        <ScreenHeader title="Terms of Use" fallbackHref="/" />

        <div className="px-4 sm:px-6 py-8 pb-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
              <FileText className="w-4 h-4 text-primary" />
              <span>Last updated: {LAST_UPDATED}</span>
            </div>

            <p className="text-base text-foreground/85 leading-relaxed mb-8">
              These Terms of Use ("Terms") are a binding agreement between you
              and Teslys ("Teslys", "we", "our", "us") governing your use of the
              Teslys website at teslys.app, our iOS and Android apps, and all
              related services (together, the "Service"). By creating an
              account, listing a vehicle, using vehicle discovery links or
              accessing third-party booking options, purchasing from our
              shop, or otherwise using the Service, you agree to these Terms and
              to our{" "}
              <a
                className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                href="/privacy"
              >
                Privacy Policy
              </a>
              . If you do not agree, do not use the Service.
            </p>

            <p className="text-sm text-foreground/85 leading-relaxed mb-10 rounded-2xl border border-border/60 bg-muted/20 p-5">
              <strong className="text-foreground">Please read carefully.</strong>{" "}
              Section 19 contains an arbitration agreement and a class action
              waiver that affect how disputes between you and Teslys are
              resolved.
            </p>

            <LegalTOC sections={SECTIONS} />

            <div className="space-y-10">
              <LegalSection id="about" title="1. About these Terms">
                <p>
                  These Terms apply to everyone who uses the Service. Some
                  activities are governed by additional agreements — most
                  importantly the <strong className="text-foreground">Co-Host
                  Agreement</strong> that vehicle owners sign before we manage a
                  vehicle. Where a signed Co-Host Agreement conflicts with these
                  Terms with respect to a managed vehicle, the Co-Host Agreement
                  controls for that vehicle.
                </p>
                <p>
                  We may update these Terms. Material changes will be posted
                  here with a new "Last updated" date and, where required,
                  notified to you in-app or by email. Continued use after the
                  effective date means you accept the updated Terms.
                </p>
              </LegalSection>

              <LegalSection id="services" title="2. What Teslys offers">
                <p>Teslys is a managed Tesla car-sharing platform. Depending on your role, the Service may include:</p>
                <LegalList
                  items={[
                    <>
                      <strong className="text-foreground">Vehicle management (co-hosting)</strong> — we list, market, and operate an owner's Tesla on third-party rental marketplaces on the owner's behalf.
                    </>,
                    <>
                      <strong className="text-foreground">Owner dashboard</strong> — trip, earnings, expense, calendar, and claims reporting.
                    </>,
                    <>
                      <strong className="text-foreground">Rentals</strong> — discovery of Teslas available to rent. Bookings and rental contracts are completed on the applicable third-party marketplace, not on Teslys.
                    </>,
                    <>
                      <strong className="text-foreground">Investor program</strong> — information about vehicle investment opportunities, where offered.
                    </>,
                    <>
                      <strong className="text-foreground">Shop and digital wraps</strong> — merchandise and downloadable wrap design files.
                    </>,
                  ]}
                />
                <p>
                  Teslys is not a car rental company, an insurance company, a
                  broker-dealer, or an investment adviser.
                </p>
              </LegalSection>

              <LegalSection id="eligibility" title="3. Eligibility & accounts">
                <LegalList
                  items={[
                    "You must be at least 18 years old and able to form a binding contract.",
                    "You must provide accurate, current information and keep it updated.",
                    "You are responsible for safeguarding your login credentials and for all activity under your account.",
                    "Accounts may require approval. We may decline, waitlist, or revoke access at our discretion, including where a vehicle does not meet our current eligibility criteria (model and model-year requirements, condition, title status, and available capacity).",
                    "You may not create an account on behalf of someone else without authorization, or maintain multiple accounts to evade restrictions.",
                  ]}
                />
              </LegalSection>

              <LegalSection id="management" title="4. Vehicle management (owners)">
                <p>
                  If you enroll a vehicle, you appoint Teslys as your co-host to
                  list, price, market, schedule, clean, coordinate, and
                  otherwise operate the vehicle on rental marketplaces. You
                  represent and warrant that:
                </p>
                <LegalList
                  items={[
                    "You are the legal owner or an authorized lessee with the right to place the vehicle into commercial car sharing, and doing so does not violate your lease, loan, or lienholder agreement.",
                    "The vehicle is registered, road-legal, mechanically sound, and free of open safety recalls you have been asked to address.",
                    "You maintain the insurance you are required to carry and have disclosed the vehicle's commercial car-sharing use as required by your insurer and applicable law.",
                    "You will keep the vehicle current on maintenance, tires, registration, and tolls/tickets attributable to your own use.",
                    "All information you provide about the vehicle (VIN, mileage, condition, history) is accurate.",
                  ]}
                />
                <p>
                  Either party may end management as described in the Co-Host
                  Agreement. Bookings already confirmed at the time of
                  termination will generally be honored to completion.
                </p>
              </LegalSection>

              <LegalSection id="fees" title="5. Fees, splits & payouts">
                <p>
                  Rental income is generated on third-party marketplaces. Those
                  marketplaces retain their own commission before any funds
                  reach us. Current arrangements:
                </p>
                <LegalList
                  items={[
                    <>
                      <strong className="text-foreground">Eon</strong> — 70/30 split; Eon retains 30% of gross trip revenue.
                    </>,
                    <>
                      <strong className="text-foreground">Turo</strong> — 70/30 split; Turo retains 30% of gross trip revenue.
                    </>,
                    <>
                      <strong className="text-foreground">Teslys management fee</strong> — Teslys charges a management fee of 30% of gross trip revenue for operating the vehicle. Owner proceeds are what remains after the marketplace commission and the Teslys management fee, less any documented trip-related expenses (cleaning, charging, tolls, damage not covered by the marketplace, and similar).
                    </>,
                  ]}
                />
                <p>
                  Marketplace terms, commission rates, and program availability
                  are set by those third parties and can change without notice
                  to us. Payout timing depends on when the marketplace releases
                  funds; we do not guarantee a specific payout date. Amounts
                  shown in the owner dashboard are reporting estimates until
                  marked paid and may be adjusted to reflect marketplace
                  reconciliation, refunds, chargebacks, or corrections.
                </p>
                <p>
                  <strong className="text-foreground">No income guarantee.</strong>{" "}
                  Any earnings figures, calculators, averages, or examples on the
                  Service are illustrative only, based on historical or modeled
                  data, and are not a promise or projection of what you will
                  earn. Actual results vary with demand, seasonality, pricing,
                  vehicle condition, location, and factors outside our control.
                </p>
                <p>
                  You are solely responsible for your own taxes, including
                  income and any applicable sales or transaction taxes on your
                  earnings. We do not provide tax, legal, accounting, or
                  insurance advice.
                </p>
              </LegalSection>

              <LegalSection id="claims" title="6. Insurance, damage & claims">
                <p>
                  Protection during a trip is provided by the marketplace
                  program applicable to that trip, subject to that program's
                  own terms, exclusions, and claim process. As of the date
                  above:
                </p>
                <LegalList
                  items={[
                    <>
                      <strong className="text-foreground">Eon trips</strong> — $0 deductible for covered accident damage.
                    </>,
                    <>
                      <strong className="text-foreground">Turo trips</strong> — $250 deductible for covered accident damage.
                    </>,
                  ]}
                />
                <p>
                  Deductibles, coverage limits, and eligibility are set by the
                  applicable marketplace and insurer and may change at any time.
                  Teslys does not underwrite, issue, or guarantee any insurance
                  coverage and is not responsible for a marketplace's or
                  insurer's coverage determination, claim denial, valuation, or
                  payment timing. Teslys will assist with filing and tracking
                  claims but cannot promise any particular outcome. Damage,
                  wear, mechanical failure, or loss that is not covered by a
                  marketplace program remains the owner's responsibility except
                  where caused by our gross negligence or willful misconduct.
                </p>
              </LegalSection>

              <LegalSection id="renters" title="7. Renting a Tesla">
                <p>
                  Where the Service surfaces vehicles available to rent, the
                  rental itself is a contract between you and the applicable
                  marketplace and/or vehicle owner. Their terms, age and license
                  requirements, verification, deposits, mileage limits, charging
                  policies, cancellation rules, and protection plans apply.
                  Teslys is not a party to that rental contract and does not
                  control vehicle availability, pricing, pickup, or condition on
                  those platforms.
                </p>
              </LegalSection>

              <LegalSection id="investor" title="8. Investor program">
                <p>
                  Information about vehicle investment opportunities is provided
                  for general informational purposes only. It is not investment,
                  legal, tax, or financial advice, and it is not an offer to
                  sell or a solicitation of an offer to buy any security in any
                  jurisdiction where such an offer would be unlawful.
                </p>
                <LegalList
                  items={[
                    "Any investment is governed exclusively by the separate written agreement you sign for that opportunity.",
                    "Returns are not guaranteed. Vehicle-based investments involve risk, including depreciation, downtime, damage, demand shortfalls, and total loss of capital.",
                    "Past or projected performance, occupancy rates, and payout figures are estimates and not a promise of future results.",
                    "Payout schedules are targets, not obligations, unless stated in your signed agreement.",
                  ]}
                />
              </LegalSection>

              <LegalSection id="shop" title="9. Shop, wraps & digital downloads">
                <LegalList
                  items={[
                    "Merchandise orders are fulfilled through our commerce provider; product availability, pricing, shipping, and returns are handled as described at checkout.",
                    "Downloadable wrap design files are licensed to you for personal, non-commercial use on your own vehicle. You may not resell, redistribute, sublicense, or claim authorship of the files.",
                    "Wrap templates and previews are design references. Final print output, color match, coverage, and fitment depend on your installer, printer, and vehicle. We do not warrant a specific result.",
                    "You are responsible for confirming that a wrap complies with your local vehicle, registration, and insurance requirements.",
                  ]}
                />
              </LegalSection>

              <LegalSection id="subscriptions" title="10. Subscriptions & billing">
                <LegalList
                  items={[
                    <>
                      <strong className="text-foreground">Pro Monthly</strong> — length: 1 month.
                    </>,
                    <>
                      <strong className="text-foreground">Pro Annual</strong> — length: 1 year.
                    </>,
                  ]}
                />
                <p>
                  Prices are shown in-app and may vary by region. When purchased
                  through an app store, payment is charged to your App Store or
                  Google Play account upon confirmation. Subscriptions
                  auto-renew unless canceled at least 24 hours before the
                  current period ends, and renewal is charged within 24 hours of
                  the period end. Manage or cancel in your Apple ID or Google
                  Play settings — deleting the app does not cancel a
                  subscription.
                </p>
                <p>
                  Use <em className="text-foreground">Restore Purchases</em> in
                  the app to re-enable prior purchases. Refunds for purchases
                  made through an app store are handled under that store's
                  terms (Apple Media Services or Google Play), not by Teslys.
                  Unused portions of a free trial, if offered, are forfeited on
                  purchase of a subscription.
                </p>
                <p>
                  We may change subscription pricing or plan features with
                  notice; changes apply from your next renewal.
                </p>
              </LegalSection>

              <LegalSection id="communications" title="11. Communications & SMS">
                <p>
                  By creating an account you agree to receive transactional
                  communications (account, security, booking, payout, and
                  support notices) by email, push notification, and in-app
                  message. These are part of the Service and cannot be opted out
                  of while your account is active.
                </p>
                <p>
                  Marketing email is optional and can be unsubscribed at any
                  time. Text messaging is opt-in and governed by our{" "}
                  <a
                    className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                    href="/sms-consent"
                  >
                    SMS Consent & Messaging Terms
                  </a>
                  . Consent to marketing messages is not a condition of any
                  purchase. Reply STOP to opt out; message and data rates may
                  apply.
                </p>
              </LegalSection>

              <LegalSection id="content" title="12. Your content & acceptable use">
                <p>
                  You retain ownership of photos, vehicle details, reviews, and
                  other content you submit. You grant Teslys a worldwide,
                  non-exclusive, royalty-free license to host, store, reproduce,
                  adapt, and display that content for the purpose of operating,
                  marketing, and promoting the Service and your listings,
                  including on rental marketplaces and social media. You
                  represent that you have the rights to grant this license.
                </p>
                <p>You agree not to:</p>
                <LegalList
                  items={[
                    "Use the Service for any unlawful, fraudulent, or misleading purpose.",
                    "Misrepresent your identity, ownership of a vehicle, or a vehicle's condition or history.",
                    "Circumvent Teslys to transact directly with a party you were introduced to through the Service in order to avoid fees.",
                    "Scrape, crawl, reverse engineer, overload, or attempt to gain unauthorized access to the Service or its data.",
                    "Upload malware, infringing material, or content that is harassing, defamatory, or discriminatory.",
                    "Use the Service to violate the terms of any third-party marketplace, insurer, or app store.",
                  ]}
                />
                <p>
                  We may remove content and restrict features at our discretion.
                  If you believe content on the Service infringes your
                  copyright, email us with the URL, a description of the work,
                  and your contact information and a statement of good-faith
                  belief, and we will respond consistent with the DMCA.
                </p>
              </LegalSection>

              <LegalSection id="thirdparty" title="13. Third-party services">
                <p>
                  The Service integrates with third parties including rental
                  marketplaces, payment and app-store providers, insurers,
                  messaging and email providers, analytics, and social
                  platforms. Your use of those services is governed by their
                  terms and privacy policies. We are not responsible for their
                  acts, omissions, availability, pricing, or decisions.
                </p>
              </LegalSection>

              <LegalSection id="ip" title="14. Intellectual property & trademarks">
                <p>
                  The Service, including its software, design, text, graphics,
                  and the Teslys name and logo, is owned by Teslys and protected
                  by intellectual property laws. We grant you a limited,
                  revocable, non-transferable license to use the Service for its
                  intended purpose.
                </p>
                <p>
                  <strong className="text-foreground">
                    Teslys is an independent service and is not affiliated with,
                    endorsed by, sponsored by, or connected to Tesla, Inc., Turo
                    Inc., or Eon.
                  </strong>{" "}
                  "Tesla", "Model 3", "Model Y", "Model S", "Model X",
                  "Cybertruck", "Turo", and other marks are the property of
                  their respective owners and are used only to describe vehicles
                  and services in a nominative, descriptive way.
                </p>
              </LegalSection>

              <LegalSection id="disclaimer" title="15. Disclaimers">
                <p>
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                  WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR
                  STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY,
                  FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND
                  NON-INFRINGEMENT. We do not warrant that the Service will be
                  uninterrupted, secure, or error-free, that reporting figures
                  will be free of inaccuracies, or that any earnings, bookings,
                  coverage, or investment outcome will be achieved.
                </p>
                <p>
                  Some jurisdictions do not allow certain warranty exclusions,
                  so parts of this section may not apply to you.
                </p>
              </LegalSection>

              <LegalSection id="liability" title="16. Limitation of liability">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, TESLYS AND ITS
                  OFFICERS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR
                  PUNITIVE DAMAGES, OR FOR LOST PROFITS, LOST REVENUE, LOST
                  EARNINGS, LOSS OF USE, LOSS OF DATA, OR DIMINUTION IN VEHICLE
                  VALUE, ARISING OUT OF OR RELATING TO THE SERVICE, EVEN IF
                  ADVISED OF THE POSSIBILITY.
                </p>
                <p>
                  OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE
                  SERVICE WILL NOT EXCEED THE GREATER OF (A) THE TOTAL
                  MANAGEMENT FEES AND SUBSCRIPTION FEES YOU PAID TO TESLYS IN
                  THE SIX (6) MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM,
                  OR (B) ONE HUNDRED U.S. DOLLARS ($100). Nothing in these Terms
                  limits liability that cannot be limited under applicable law,
                  including for fraud, gross negligence, or willful misconduct.
                </p>
              </LegalSection>

              <LegalSection id="indemnity" title="17. Indemnification">
                <p>
                  You agree to defend, indemnify, and hold harmless Teslys from
                  any claims, damages, liabilities, losses, and expenses
                  (including reasonable attorneys' fees) arising out of your use
                  of the Service, your vehicle, your content, your breach of
                  these Terms, or your violation of any law or third-party
                  right.
                </p>
              </LegalSection>

              <LegalSection id="termination" title="18. Suspension & termination">
                <p>
                  You may stop using the Service at any time and can delete your
                  account in{" "}
                  <em className="text-foreground">Settings → Delete Account</em>{" "}
                  or via our{" "}
                  <a
                    className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                    href="/delete-account"
                  >
                    account deletion page
                  </a>
                  . We may suspend or terminate access, with or without notice,
                  for violation of these Terms, suspected fraud or abuse, risk
                  to other users or vehicles, or where required by law.
                  Provisions that by their nature should survive termination
                  (fees owed, content license for already-published material,
                  disclaimers, liability limits, indemnity, and dispute
                  resolution) survive.
                </p>
              </LegalSection>

              <LegalSection id="disputes" title="19. Dispute resolution & arbitration">
                <p>
                  <strong className="text-foreground">Informal resolution first.</strong>{" "}
                  Before filing a claim, you agree to contact us at
                  support@teslys.com and attempt to resolve the dispute
                  informally for at least 30 days.
                </p>
                <p>
                  <strong className="text-foreground">Binding arbitration.</strong>{" "}
                  If we cannot resolve the dispute, you and Teslys agree that
                  any dispute arising out of or relating to these Terms or the
                  Service will be resolved by final and binding individual
                  arbitration administered by a recognized arbitration provider
                  under its consumer rules, seated in Los Angeles County,
                  California, unless applicable law requires otherwise. Either
                  party may bring an individual claim in small claims court
                  instead.
                </p>
                <p>
                  <strong className="text-foreground">Class action waiver.</strong>{" "}
                  Disputes will be brought only in an individual capacity, not
                  as a plaintiff or class member in any purported class,
                  consolidated, or representative proceeding. If this waiver is
                  found unenforceable as to a particular claim, that claim will
                  proceed in court.
                </p>
                <p>
                  <strong className="text-foreground">Governing law and venue.</strong>{" "}
                  These Terms are governed by the laws of the State of
                  California, without regard to conflict-of-law rules. For any
                  matter not subject to arbitration, the state and federal
                  courts located in Los Angeles County, California have
                  exclusive jurisdiction.
                </p>
              </LegalSection>

              <LegalSection id="general" title="20. General terms">
                <LegalList
                  items={[
                    "These Terms, plus any signed Co-Host Agreement, investor agreement, or order confirmation, are the entire agreement between you and Teslys regarding the Service.",
                    "If any provision is found unenforceable, the rest remains in effect.",
                    "Our failure to enforce a provision is not a waiver of it.",
                    "You may not assign these Terms without our consent; we may assign them in connection with a merger, acquisition, or sale of assets.",
                    "We are not liable for delays or failures caused by events beyond our reasonable control.",
                    "Notices may be sent to the email address on your account.",
                  ]}
                />
              </LegalSection>

              <LegalSection id="contact" title="21. Contact">
                <p>
                  Questions about these Terms? Email{" "}
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
