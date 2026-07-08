import { Link } from "react-router-dom";
import {
  Shield,
  SlidersHorizontal,
  FileText,
  Cookie,
  Scale,
  Ban,
  Download,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/hooks/useConsent";
import { categories, brand } from "@/config/consent.config";

export default function PrivacyCenter() {
  const { choices, record, openPreferences } = useConsent();

  const editable = categories.filter((c) => !c.required);

  const dataRequest = (subject: string) =>
    `mailto:${brand.privacyEmail}?subject=${encodeURIComponent(subject)}`;

  return (
    <>
      <SEO
        title="Privacy Center | Teslys"
        description="Manage your privacy preferences, review our policies, and exercise your data rights including Do Not Sell or Share My Information."
        canonical="https://teslys.app/privacy-center"
        ogType="article"
      />
      <div className="min-h-screen bg-background">
        <ScreenHeader title="Privacy Center" fallbackHref="/" />

        <div className="px-4 sm:px-6 py-8 pb-16">
          <div className="max-w-3xl mx-auto space-y-10">
            {/* Intro */}
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-1 shrink-0" />
              <p className="text-base text-foreground/85 leading-relaxed">
                Your privacy is in your control. Review your current choices,
                update your preferences, and exercise your data rights below.
              </p>
            </div>

            {/* Current consent choices */}
            <section className="rounded-3xl border border-border/60 bg-gradient-card shadow-card p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  Your Current Choices
                </h2>
                <Button
                  onClick={openPreferences}
                  className="rounded-full min-h-11 bg-gradient-primary border-0"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Update Preferences
                </Button>
              </div>

              <ul className="space-y-2.5">
                <li className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    Essential Cookies
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <Check className="h-3.5 w-3.5" /> Always on
                  </span>
                </li>
                {editable.map((cat) => {
                  const on = choices[cat.id as "analytics" | "marketing" | "functional"];
                  return (
                    <li
                      key={cat.id}
                      className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {cat.label}
                      </span>
                      {on ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                          <Check className="h-3.5 w-3.5" /> Allowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <X className="h-3.5 w-3.5" /> Blocked
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {record && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Last updated{" "}
                  {new Date(record.timestamp).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · Consent version {record.version}
                </p>
              )}
            </section>

            {/* Policies */}
            <section>
              <h2 className="text-lg font-bold text-foreground tracking-tight mb-4">
                Policies
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <PolicyCard to="/privacy" icon={FileText} label="Privacy Policy" />
                <PolicyCard to="/cookie-policy" icon={Cookie} label="Cookie Policy" />
                <PolicyCard to="/terms" icon={Scale} label="Terms of Service" />
              </div>
            </section>

            {/* Data rights */}
            <section>
              <h2 className="text-lg font-bold text-foreground tracking-tight mb-4">
                Your Data Rights
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <RightRow
                  icon={Ban}
                  label="Do Not Sell or Share My Information"
                  href={dataRequest("Do Not Sell or Share My Information")}
                />
                <RightRow
                  icon={Download}
                  label="Request My Data"
                  href={dataRequest("Data Access Request")}
                />
                <RightRow
                  icon={Trash2}
                  label="Delete My Data"
                  href={dataRequest("Data Deletion Request")}
                />
                <RightRow
                  icon={SlidersHorizontal}
                  label="Manage Cookie Preferences"
                  onClick={openPreferences}
                />
              </div>
            </section>

            <p className="text-xs text-muted-foreground">
              Questions about your privacy? Contact us at{" "}
              <a
                href={`mailto:${brand.privacyEmail}`}
                className="text-primary underline underline-offset-2"
              >
                {brand.privacyEmail}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function PolicyCard({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-4 hover:border-primary/40 hover:shadow-card transition-all"
    >
      <Icon className="h-5 w-5 text-primary shrink-0" />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </Link>
  );
}

function RightRow({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <Icon className="h-5 w-5 text-primary shrink-0" />
      <span className="text-sm font-medium text-foreground text-left">{label}</span>
    </>
  );
  const cls =
    "flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-4 hover:border-primary/40 hover:shadow-card transition-all min-h-11 w-full";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    );
  }
  return (
    <a href={href} className={cls}>
      {inner}
    </a>
  );
}
