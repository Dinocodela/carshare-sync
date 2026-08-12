import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUp, Download, Sparkles, Upload, Wand2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WrapImage } from "@/components/wraps/WrapImage";
import { ModelTabs } from "@/components/wraps/ModelTabs";
import { ModelComingSoon } from "@/components/wraps/ModelComingSoon";
import { WrapsHeader } from "@/components/wraps/WrapsHeader";
import { WrapsOffers } from "@/components/wraps/WrapsOffers";
import { cn } from "@/lib/utils";
import {
  DEFAULT_MODEL_KEY,
  TeslaModelKey,
  WRAP_CATEGORIES,
  WRAP_DISCLOSURE,
  WrapCategory,
  getModelConfig,
  isTeslaModelKey,
} from "@/data/wraps";
import { useWrapDesigns } from "@/hooks/useWrapDesigns";
import { trackWrapEvent } from "@/lib/wrapAnalytics";


const steps = [
  {
    icon: Download,
    title: "Download",
    body: "Grab any wrap as a free PNG — no account, no payment.",
  },
  {
    icon: Upload,
    title: "Upload",
    body: "Tesla app v4.59.0+ → Creations → Wrap → Upload, or a USB Wraps folder.",
  },
  {
    icon: Wand2,
    title: "Apply",
    body: "In the car: Toybox → Paint Shop → Wraps, then pick your design.",
  },
];

export default function Wraps() {
  const [active, setActive] = useState<"All" | WrapCategory>("All");
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const modelParam = searchParams.get("model");
  const activeModel: TeslaModelKey = isTeslaModelKey(modelParam)
    ? modelParam
    : DEFAULT_MODEL_KEY;
  const modelConfig = getModelConfig(activeModel);
  const { wraps: allWraps } = useWrapDesigns();
  const modelWraps = useMemo(
    () => allWraps.filter((w) => w.modelKey === activeModel),
    [allWraps, activeModel]
  );

  useEffect(() => {
    trackWrapEvent("wrap_gallery_view", { count: allWraps.length });
  }, [allWraps.length]);


  // Reset the secondary category filter whenever the model changes.
  useEffect(() => {
    setActive("All");
  }, [activeModel]);

  // Show/hide back-to-top button based on scroll position
  useEffect(() => {
    const getScrollTop = () =>
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      window.scrollY ||
      0;

    const handleScroll = () => {
      setShowTopBtn(getScrollTop() > 500);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.body.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const root =
      document.body.scrollTop > 0 ? document.body : document.documentElement;
    root.scrollTo({ top: 0, behavior: "smooth" });
    // Fallback for environments that scroll the window itself
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectModel = (key: TeslaModelKey) => {
    const next = new URLSearchParams(searchParams);
    if (key === DEFAULT_MODEL_KEY) next.delete("model");
    else next.set("model", key);
    setSearchParams(next); // preserves utm_* and any other existing params
    trackWrapEvent("wrap_model_tab_click", {
      modelKey: key,
      availability: getModelConfig(key).status,
    });
  };

  const visible = useMemo(
    () =>
      active === "All"
        ? modelWraps
        : modelWraps.filter((w) => w.category === active),
    [active, modelWraps]
  );

  const hasWraps = modelWraps.length > 0;

  return (
    <div className="min-h-screen bg-sand text-foreground">
      <SEO
        title="Free Tesla Wraps for Model Y Premium | Teslys"
        description="Download free digital Tesla Paint Shop wraps for the 2025+ Model Y Premium (Juniper). Original artwork, instant PNG downloads, no account required."
        canonical="https://teslys.app/wraps"
        keywords="free tesla wraps, tesla paint shop wraps, model y juniper wrap, tesla creations wrap"
      />

      <WrapsHeader />

      <main>
        {/* Hero */}
        <section className="px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-sand-border bg-sand-card px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Free digital wraps
            </span>
            <h1 className="mt-6 font-bold tracking-tight text-4xl sm:text-6xl leading-[1.05] tracking-tight">
              Make your Tesla <span className="text-primary">yours.</span>
            </h1>
            <p className="mt-5 mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              These change how your car appears on your screen — they are not
              printable vinyl templates and nothing is applied to the physical
              vehicle.
            </p>
            {!hasWraps && (
              <p className="mt-3 text-sm text-muted-foreground">
                {`${modelConfig.label} library coming soon. Every design will use Tesla's exact official template.`}
              </p>
            )}
          </div>
        </section>

        {/* Model selector */}
        <section className="px-6" aria-label="Select a Tesla model">
          <div className="max-w-4xl mx-auto">
            <ModelTabs active={activeModel} onChange={selectModel} />
          </div>
        </section>

        {/* Filters */}
        {hasWraps && (
        <section className="px-6 pt-8" aria-label="Filter wraps by category">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-2">
            {WRAP_CATEGORIES.map((cat) => {
              const isActive = cat === active;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActive(cat)}
                  aria-pressed={isActive}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-navy-foreground"
                      : "border border-sand-border bg-sand-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>
        )}

        {/* Gallery */}
        <section
          className="px-6 py-12"
          id="wraps-model-panel"
          role="tabpanel"
          aria-labelledby={`model-tab-${activeModel}`}
        >
          {!hasWraps ? (
            <ModelComingSoon
              model={modelConfig}
              onBackToModelY={() => selectModel(DEFAULT_MODEL_KEY)}
            />
          ) : (
          <ul className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0">
            {visible.map((wrap, i) => (
              <li key={wrap.slug}>
                <Link
                  to={`/wraps/${wrap.slug}`}
                  onClick={() =>
                    trackWrapEvent("wrap_card_click", {
                      slug: wrap.slug,
                      category: wrap.category,
                    })
                  }
                  className="group block rounded-3xl bg-sand-card p-4 shadow-sm transition-transform duration-300 motion-safe:hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <WrapImage
                    src={wrap.previewUrl}
                    alt={`${wrap.title} wrapped Tesla Model Y concept preview`}
                    className="aspect-[3/2]"
                    badge="Concept preview"
                    priority={i < 3}
                  />
                  <div className="px-2 pt-4 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                        Free
                      </span>
                      <span className="rounded-full border border-sand-border px-2.5 py-1 text-[11px] text-muted-foreground">
                        {wrap.category}
                      </span>
                    </div>
                    <h2 className="mt-3 font-bold tracking-tight text-2xl leading-tight">
                      {wrap.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {wrap.description}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground/80">
                      Model Y Premium (2025+ Juniper)
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      View wrap
                      <ArrowRight className="w-4 h-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          )}
        </section>

        {/* Offers */}
        <div className="pb-16">
          <WrapsOffers source="wraps-gallery" />
        </div>

        {/* How it works */}
        <section className="px-6 pb-16">
          <div className="max-w-5xl mx-auto rounded-3xl bg-navy p-8 sm:p-12 relative overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(27,110,102,0.35),transparent_60%)]"
            />
            <div className="relative">
              <h2 className="font-bold tracking-tight text-3xl text-navy-foreground">How it works</h2>
              <span className="mt-3 block h-px w-16 bg-primary" />
              <ol className="mt-8 grid gap-6 sm:grid-cols-3 list-none p-0">
                {steps.map((step, i) => (
                  <li key={step.title} className="flex flex-col gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-foreground/10">
                      <step.icon className="h-4 w-4 text-navy-foreground" />
                    </span>
                    <h3 className="font-bold tracking-tight text-xl text-navy-foreground">
                      {i + 1}. {step.title}
                    </h3>
                    <p className="text-sm text-navy-foreground/60 leading-relaxed">
                      {step.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Disclosure */}
        <section className="px-6 pb-16">
          <p className="max-w-3xl mx-auto text-xs leading-relaxed text-muted-foreground">
            {WRAP_DISCLOSURE}
          </p>
        </section>
      </main>

      {/* Back to top */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-navy-foreground shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          showTopBtn ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        )}
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      <SiteFooter />
    </div>
  );
}