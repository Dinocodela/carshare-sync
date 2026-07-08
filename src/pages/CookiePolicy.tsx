import { Cookie } from "lucide-react";
import { SEO } from "@/components/SEO";
import { ScreenHeader } from "@/components/ScreenHeader";
import { cookies, categories, brand } from "@/config/consent.config";

const categoryLabel = (id: string) =>
  categories.find((c) => c.id === id)?.label ?? id;

export default function CookiePolicy() {
  return (
    <>
      <SEO
        title="Cookie Policy | Teslys"
        description="Learn which cookies Teslys uses, their purpose, provider, and duration, and how to manage your cookie preferences."
        canonical="https://teslys.app/cookie-policy"
        ogType="article"
      />
      <div className="min-h-screen bg-background">
        <ScreenHeader title="Cookie Policy" fallbackHref="/privacy-center" />

        <div className="px-4 sm:px-6 py-8 pb-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
              <Cookie className="w-4 h-4 text-primary" />
              <span>Effective: {brand.effectiveDate}</span>
            </div>

            <p className="text-base text-foreground/85 leading-relaxed mb-10">
              This Cookie Policy explains how {brand.companyName} uses cookies and
              similar technologies on {brand.websiteUrl}. Non-essential cookies
              only load after you grant consent. You can change your choices at
              any time in the{" "}
              <a
                href="/privacy-center"
                className="text-primary underline underline-offset-2"
              >
                Privacy Center
              </a>
              .
            </p>

            {/* Cookie table — desktop */}
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Cookie</th>
                    <th className="px-4 py-3 font-semibold">Purpose</th>
                    <th className="px-4 py-3 font-semibold">Provider</th>
                    <th className="px-4 py-3 font-semibold">Duration</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {cookies.map((c) => (
                    <tr key={c.name} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-foreground/80">{c.purpose}</td>
                      <td className="px-4 py-3 text-foreground/80">{c.provider}</td>
                      <td className="px-4 py-3 text-foreground/80">{c.duration}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {categoryLabel(c.category)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cookie cards — mobile */}
            <div className="sm:hidden space-y-3">
              {cookies.map((c) => (
                <div
                  key={c.name}
                  className="rounded-2xl border border-border/60 bg-background p-4"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs text-foreground">
                      {c.name}
                    </span>
                    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                      {categoryLabel(c.category)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mb-2">{c.purpose}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{c.provider}</span>
                    <span>{c.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-10 text-xs text-muted-foreground leading-relaxed">
              Some cookie names use wildcards (e.g. <code>_ga_*</code>) because
              providers append unique identifiers. Third-party cookies are
              governed by their respective providers' privacy policies.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
