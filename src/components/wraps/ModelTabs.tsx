import { useEffect, useRef } from "react";
import {
  TESLA_MODELS,
  TeslaModelKey,
  getWrapCountByModel,
} from "@/data/wraps";

interface ModelTabsProps {
  active: TeslaModelKey;
  onChange: (key: TeslaModelKey) => void;
}

/**
 * Primary Tesla model selector for the wraps gallery.
 * Accessible tablist with keyboard arrow navigation.
 */
export function ModelTabs({ active, onChange }: ModelTabsProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const listRef = useRef<HTMLDivElement | null>(null);

  // Keep the selected tab visible inside the horizontal scroller (mobile,
  // direct URL loads and browser back/forward) without scrolling the page.
  useEffect(() => {
    const el = refs.current[active];
    const list = listRef.current;
    if (!el || !list) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (list.scrollWidth <= list.clientWidth) return;
    const target =
      el.offsetLeft - (list.clientWidth - el.offsetWidth) / 2;
    list.scrollTo({
      left: Math.max(0, target),
      behavior: reduced ? "auto" : "smooth",
    });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % TESLA_MODELS.length;
    else if (e.key === "ArrowLeft")
      next = (index - 1 + TESLA_MODELS.length) % TESLA_MODELS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TESLA_MODELS.length - 1;
    else return;
    e.preventDefault();
    const key = TESLA_MODELS[next].key;
    onChange(key);
    refs.current[key]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Select a Tesla model"
      className="flex gap-2 overflow-x-auto sm:overflow-visible sm:grid sm:grid-cols-5 rounded-3xl border border-[#E8E1D3] bg-[#FFFDF9] p-2 shadow-[0_20px_60px_rgba(14,61,58,0.06)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TESLA_MODELS.map((model, i) => {
        const isActive = model.key === active;
        const count = getWrapCountByModel(model.key);
        return (
          <button
            key={model.key}
            ref={(el) => {
              refs.current[model.key] = el;
            }}
            role="tab"
            id={`model-tab-${model.key}`}
            aria-selected={isActive}
            aria-controls="wraps-model-panel"
            tabIndex={isActive ? 0 : -1}
            type="button"
            onClick={() => onChange(model.key)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`shrink-0 min-w-[9.5rem] sm:min-w-0 rounded-2xl px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B6E66] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFDF9] ${
              isActive
                ? "bg-[#0E3D3A] text-white shadow-[0_12px_30px_rgba(14,61,58,0.18)]"
                : "text-[#17211F] hover:bg-[#F7F2E9]"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="font-serif text-lg leading-none whitespace-nowrap">
                {model.label}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider tabular-nums ${
                  model.status === "available"
                    ? isActive
                      ? "bg-[#C6A15B]/25 text-[#F7F2E9]"
                      : "bg-[#1B6E66]/10 text-[#1B6E66]"
                    : isActive
                      ? "bg-white/10 text-white/70"
                      : "bg-[#E8E1D3]/70 text-[#5C6B67]"
                }`}
              >
                {model.status === "available" ? count : "Soon"}
              </span>
            </span>
            <span
              className={`mt-1 block text-[11px] whitespace-nowrap ${
                isActive ? "text-white/60" : "text-[#5C6B67]"
              }`}
            >
              {model.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
}
