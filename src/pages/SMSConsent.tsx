import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";

export default function SMSConsent() {
  return (
    <>
      <SEO
        title="Teslys SMS Consent & Messaging Terms"
        description="Learn how Teslys texts you and how to manage your SMS preferences. Information about opt-in, message types, frequency, and opt-out instructions."
        keywords="Teslys SMS, text messages, SMS consent, messaging terms, opt out SMS"
        canonical="https://teslys.app/sms-consent"
      />
      
      <div className="min-h-screen bg-gradient-hero">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          {/* Header */}
          <div className="flex justify-center mb-8">
            <Link to="/">
              <Logo size="lg" />
            </Link>
          </div>
          
          <div className="bg-white/90 backdrop-blur rounded-xl border border-primary/10 p-6 sm:p-8">
            <header className="mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                SMS Consent & Messaging Terms
              </h1>
              <p className="text-muted-foreground">
                How Teslys texts you and how to manage your preferences
              </p>
            </header>

            <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
              {/* Who is sending messages */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Who is sending messages
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Teslys (Teslys LLC) may send text messages (SMS) to the mobile number you provide. Messages may be sent using an automatic telephone dialing system.
                </p>
              </section>

              {/* How you opt in */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  How you opt in (Consent)
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>
                    You opt in by entering your phone number on teslys.app (and/or teslys.com/rent) during account creation or checkout and checking a box agreeing to receive SMS.
                  </li>
                  <li>
                    You may also opt in by texting START to our number after requesting SMS communication.
                  </li>
                  <li>
                    Consent is not a condition of purchase.
                  </li>
                </ul>
              </section>

              {/* Message types */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Message types
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Booking and rental confirmations</li>
                  <li>Pickup/return instructions and reminders</li>
                  <li>Account and security notifications (including verification codes if applicable)</li>
                  <li>Customer support updates and responses to your inquiries</li>
                </ul>
              </section>

              {/* Message frequency */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Message frequency
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Message frequency varies based on your activity (for example, booking status, reminders, and support conversations).
                </p>
              </section>

              {/* Costs */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Costs
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Message and data rates may apply.
                </p>
              </section>

              {/* Opt-out instructions */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Opt-out instructions
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Reply <strong className="text-foreground">STOP</strong> to cancel at any time. After you text STOP, you may receive one final message confirming your opt-out.
                </p>
              </section>

              {/* Help instructions */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Help instructions
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Reply <strong className="text-foreground">HELP</strong> for help or contact us at{" "}
                  <a 
                    href="mailto:support@teslys.app" 
                    className="text-primary underline underline-offset-2"
                  >
                    support@teslys.app
                  </a>.
                </p>
              </section>

              {/* Privacy & terms links */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Privacy & terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  For more information, please review our{" "}
                  <Link 
                    to="/privacy" 
                    className="text-primary underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link 
                    to="/terms" 
                    className="text-primary underline underline-offset-2"
                  >
                    Terms of Service
                  </Link>.
                </p>
              </section>

              {/* No sharing / compliance note */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Data sharing & compliance
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell or share your phone number for third-party marketing. Information collected as part of the SMS program is handled in accordance with our Privacy Policy.
                </p>
              </section>

              {/* Last updated */}
              <footer className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Last updated: January 16, 2026
                </p>
              </footer>
            </div>
          </div>

          {/* Footer links */}
          <footer className="mt-8 text-center text-sm text-muted-foreground space-x-4">
            <Link to="/" className="hover:text-foreground transition">
              Home
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition">
              Terms of Service
            </Link>
            <Link to="/support" className="hover:text-foreground transition">
              Support
            </Link>
          </footer>
        </div>
      </div>
    </>
  );
}
