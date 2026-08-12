import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Info } from "lucide-react";
import { SEO } from "@/components/SEO";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WrapImage } from "@/components/wraps/WrapImage";
import { WrapsHeader } from "@/components/wraps/WrapsHeader";
import { WrapsOffers } from "@/components/wraps/WrapsOffers";
import { WRAP_DISCLOSURE } from "@/data/wraps";
import { useWrapDesigns } from "@/hooks/useWrapDesigns";
import { getRelatedCatalogWraps } from "@/lib/wrapCatalog";
import { trackWrapEvent } from "@/lib/wrapAnalytics";


const installSteps = [
  "In the Tesla mobile app (v4.59.0 or later), open Creations → Wrap → Upload and select the PNG.",
  "Or copy the PNG into a folder named Wraps at the root of a USB drive, then plug it into the car.",
  "In the car, go to Toybox → Paint Shop → Wraps and select your design.",
];

export default function WrapDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { wraps: allWraps } = useWrapDesigns();
  const wrap = allWraps.find((w) => w.slug === slug);


  useEffect(() => {
    if (wrap) {
      trackWrapEvent("wrap_detail_view", {
        slug: wrap.slug,
        category: wrap.category,
      });
    }
  }, [wrap]);

  if (!wrap) {
    return (
      <div className="min-h-screen bg-sand text-foreground flex flex-col">
        <SEO
          title="Wrap not found | Teslys"
          description="This Teslys digital wrap could not be found. Browse the full free wrap collection."
          canonical="https://teslys.app/wraps"
          noIndex
        />
        <WrapsHeader />
        <main className="flex-1 px-6 py-24 text-center">
          <h1 className="font-bold tracking-tight text-4xl">Wrap not found</h1>
          <p className="mt-4 text-muted-foreground">
            That wrap doesn’t exist — it may have been renamed.
          </p>
          <Link
            to="/wraps"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-navy-foreground"
          >
            Browse all free wraps →
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const fileUrl = wrapImageUrl(wrap);
  const previewUrl = wrapPreviewUrl(wrap);
  const related = getRelatedWraps(wrap);

  const onDownload = () =>
    trackWrapEvent("wrap_download_click", {
      slug: wrap.slug,
      filename: wrap.filename,
      category: wrap.category,
    });

  return (
    <div className="min-h-screen bg-sand text-foreground">
      <SEO
        title={`${wrap.title} — Free Tesla Wrap | Teslys`}
        description={`${wrap.description} Free digital Tesla Paint Shop wrap for the 2025+ Model Y Premium (Juniper).`}
        canonical={`https://teslys.app/wraps/${wrap.slug}`}
        ogImage={`https://teslys.app${previewUrl}`}
      />

      <WrapsHeader />

      <main className="pb-28 lg:pb-16">
        <div className="max-w-6xl mx-auto px-6 pt-10">
          <Link
            to="/wraps"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Teslys Free Wraps
          </Link>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <WrapImage
              src={previewUrl}
              alt={`${wrap.title} wrapped Tesla Model Y concept preview`}
              className="aspect-[3/2] rounded-3xl"
              badge="Concept preview"
              priority
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Concept visualization · Download includes the exact Tesla Paint
              Shop PNG.
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                Free
              </span>
              <span className="rounded-full border border-sand-border px-2.5 py-1 text-[11px] text-muted-foreground">
                {wrap.category}
              </span>
            </div>
            <h1 className="mt-4 font-bold tracking-tight text-4xl sm:text-5xl leading-tight">
              {wrap.title}
            </h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {wrap.description}
            </p>

            <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl bg-sand-card border border-sand-border p-4">
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Compatibility
                </dt>
                <dd className="mt-1">{wrap.compatibility}</dd>
              </div>
              <div className="rounded-2xl bg-sand-card border border-sand-border p-4">
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  File
                </dt>
                <dd className="mt-1 break-all font-mono text-xs">
                  {wrap.filename}
                </dd>
                <dd className="mt-1 tabular-nums text-muted-foreground">
                  {wrap.dimensions} · PNG · {wrap.fileSize}
                </dd>
              </div>
            </dl>

            <a
              href={fileUrl}
              download={wrap.filename}
              onClick={onDownload}
              className="mt-8 hidden lg:inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-navy-foreground shadow-md transition-transform motion-safe:hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              Download free PNG
            </a>

            <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              On iPhone: if the file opens in a new tab instead of downloading,
              tap the share icon and choose “Save to Files”, then upload it from
              the Tesla app.
            </p>
          </div>
        </div>

        {/* Installation */}
        <section className="max-w-6xl mx-auto px-6 mt-16">
          <div className="rounded-3xl bg-navy p-8 sm:p-11 relative overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(27,110,102,0.35),transparent_60%)]"
            />
            <div className="relative">
              <h2 className="font-bold tracking-tight text-3xl text-navy-foreground">
                How to install this wrap
              </h2>
              <span className="mt-3 block h-px w-16 bg-primary" />
              <ol className="mt-7 space-y-4 text-sm text-navy-foreground/70 list-none p-0">
                {installSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-foreground/10 text-xs text-navy-foreground tabular-nums">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
              <details
                className="mt-7 text-sm text-navy-foreground/70"
                onToggle={(e) => {
                  if ((e.currentTarget as HTMLDetailsElement).open) {
                    trackWrapEvent("wrap_install_guide_open", {
                      slug: wrap.slug,
                    });
                  }
                }}
              >
                <summary className="cursor-pointer text-navy-foreground">
                  Troubleshooting &amp; details
                </summary>
                <p className="mt-3 leading-relaxed">
                  Paint Shop wraps require a compatible vehicle and recent
                  software. If the wrap doesn’t appear, confirm the PNG sits
                  directly inside a folder named <code>Wraps</code> at the USB
                  root, that the drive is formatted exFAT or FAT32, and that the
                  Tesla app is on v4.59.0 or later.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 mt-16">
            <h2 className="font-bold tracking-tight text-3xl">More wraps</h2>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 list-none p-0">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to={`/wraps/${r.slug}`}
                    onClick={() =>
                      trackWrapEvent("wrap_card_click", {
                        slug: r.slug,
                        category: r.category,
                        source: "related",
                      })
                    }
                    className="group block rounded-3xl bg-sand-card p-4 shadow-sm transition-transform motion-safe:hover:-translate-y-1"
                  >
                    <WrapImage
                      src={wrapPreviewUrl(r)}
                      alt={`${r.title} wrapped Tesla Model Y concept preview`}
                      className="aspect-[3/2]"
                      badge="Concept preview"
                    />
                    <h3 className="mt-4 px-2 font-bold tracking-tight text-xl">{r.title}</h3>
                    <p className="px-2 pb-2 text-xs text-muted-foreground">
                      {r.category} · Free
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-16">
          <WrapsOffers source="wrap-detail" />
        </div>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {WRAP_DISCLOSURE}
          </p>
        </section>
      </main>

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-sand-border bg-sand-card/95 backdrop-blur px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <a
          href={fileUrl}
          download={wrap.filename}
          onClick={onDownload}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-navy-foreground"
        >
          <Download className="w-4 h-4" />
          Download free PNG
        </a>
      </div>

      <SiteFooter />
    </div>
  );
}