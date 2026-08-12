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
      className={`relative overflow-hidden rounded-2xl bg-[#0E3D3A] ${className ?? ""}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(27,110,102,0.45),transparent_65%)]"
      />
      <img
        src={source}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => setSource(WRAP_PLACEHOLDER)}
        className="relative z-10 w-full h-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl"
      />
      {badge && (
        <span className="absolute bottom-3 left-3 z-20 rounded-full bg-[#0E3D3A]/75 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
          {badge}
        </span>
      )}
    </div>
  );
}