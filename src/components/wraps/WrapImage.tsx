import { useState } from "react";
import { WRAP_PLACEHOLDER } from "@/data/wraps";

interface WrapImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  badge?: string;
}

/**
 * Dark "digital canvas" preview treatment with a graceful placeholder while the
 * final PNGs are being attached.
 */
export function WrapImage({ src, alt, className, priority, badge }: WrapImageProps) {
  const [source, setSource] = useState(src);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-navy ${className ?? ""}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(27,110,102,0.45),transparent_65%)]"
      />
      <img
        src={source}
        alt={alt}
        width={900}
        height={600}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        decoding="async"
        onError={() => setSource(WRAP_PLACEHOLDER)}
        className="relative z-10 w-full h-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-navy-foreground/10 rounded-2xl"
      />
      {badge && (
        <span className="absolute bottom-3 left-3 z-20 rounded-full bg-navy/75 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-navy-foreground/90 backdrop-blur-sm">
          {badge}
        </span>
      )}
    </div>
  );
}