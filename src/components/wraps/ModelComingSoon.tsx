import { ArrowRight, Instagram, Sparkles } from "lucide-react";
import { TeslaModelConfig } from "@/data/wraps";

interface ModelComingSoonProps {
  model: TeslaModelConfig;
  onBackToModelY: () => void;
}

export function ModelComingSoon({ model, onBackToModelY }: ModelComingSoonProps) {
  return (
    <div className="max-w-3xl mx-auto rounded-3xl bg-navy p-8 sm:p-12 text-center relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(27,110,102,0.35),transparent_60%)]"
      />
      <div className="relative">
        <span
          aria-hidden
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy-foreground/10 ring-1 ring-inset ring-navy-foreground/15"
        >
          <Sparkles className="h-5 w-5 text-primary" />
        </span>
        <h2 className="mt-6 font-bold tracking-tight text-3xl sm:text-4xl text-navy-foreground">
          {model.label} wraps are coming.
        </h2>
        <span className="mx-auto mt-4 block h-px w-16 bg-primary" />
        <p className="mt-5 mx-auto max-w-xl text-sm sm:text-base leading-relaxed text-navy-foreground/60">
          We’re building each design on Tesla’s exact official template. Follow
          Teslys to see the next drop first.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://www.instagram.com/teslysla"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-navy-foreground transition-transform motion-safe:hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-foreground"
          >
            <Instagram className="h-4 w-4" />
            Follow @teslysla
          </a>
          <button
            type="button"
            onClick={onBackToModelY}
            className="inline-flex items-center gap-1.5 rounded-full border border-navy-foreground/25 px-6 py-3 text-sm font-medium text-navy-foreground/80 transition-colors hover:text-navy-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-foreground"
          >
            Back to Model Y wraps
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}