import { SEO } from "@/components/SEO";
import { ScreenHeader } from "@/components/ScreenHeader";

export default function DeleteAccount() {
  return (
    <>
      <SEO
        title="Delete Account - Teslys"
        description="Request deletion of your Teslys account and all associated data."
        canonical="https://teslys.app/delete-account"
      />
      <div className="min-h-screen bg-background">
        <ScreenHeader title="Delete Account" fallbackHref="/" />
        <div className="px-4 sm:px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Delete Your Account</h1>

            <p className="text-muted-foreground">
              We're sorry to see you go. If you'd like to delete your Teslys
              account and all associated data, please follow the instructions
              below.
            </p>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">How it works</h2>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>
                  Send an email to{" "}
                  <a
                    className="text-primary underline underline-offset-2"
                    href="mailto:support@teslys.com?subject=Account%20Deletion%20Request"
                  >
                    support@teslys.com
                  </a>{" "}
                  with the subject <strong>"Account Deletion Request"</strong>.
                </li>
                <li>
                  Include the email address associated with your Teslys account.
                </li>
                <li>
                  Our team will verify your identity and process the request
                  within 7 business days.
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">What gets deleted</h2>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Your profile and personal information</li>
                <li>Your cars and hosting data</li>
                <li>Earnings, expenses, and trip history</li>
                <li>Push notification subscriptions</li>
                <li>All other data associated with your account</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              Some data may be retained as required by law or for legitimate
              business purposes (e.g., financial records for tax compliance).
            </p>

            <div className="pt-4">
              <a
                href="mailto:support@teslys.com?subject=Account%20Deletion%20Request"
                className="inline-flex items-center justify-center rounded-md bg-destructive px-6 py-3 text-sm font-medium text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-colors"
              >
                Request Account Deletion
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
