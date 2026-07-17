import { useState, useEffect } from "react";
import { ArrowRight, Star } from "lucide-react";
import { C, SERIF, SANS } from "./tokens";

export type Testimonial = {
  quote: string;
  name: string;
  source: string;
};

type Props = {
  testimonials: Testimonial[];
  ratingLabel?: string;
  onViewAll: (e: React.MouseEvent) => void;
  autoRotateMs?: number;
};

export function GoogleReviewCard({
  testimonials,
  ratingLabel = "5.0 on Google · 55 reviews",
  onViewAll,
  autoRotateMs = 7000,
}: Props) {
  const [idx, setIdx] = useState(0);
  const active = testimonials[idx];

  useEffect(() => {
    if (!autoRotateMs || testimonials.length < 2) return;
    const interval = window.setInterval(() => {
      setIdx((current) => (current + 1) % testimonials.length);
    }, autoRotateMs);
    return () => window.clearInterval(interval);
  }, [testimonials.length, autoRotateMs]);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        minHeight: 250,
        borderRadius: 24,
        background: C.warmWhite,
        border: `1px solid ${C.border}`,
        padding: "20px 20px 18px",
        boxShadow: "0 18px 48px rgba(3,37,44,0.08)",
      }}
    >
      <div className="flex items-center justify-between" style={{ gap: 12 }}>
        <div>
          <div className="flex items-center" style={{ gap: 3 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={15}
                color={C.gold}
                fill={C.gold}
                strokeWidth={0}
              />
            ))}
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: SANS,
              fontSize: 11,
              lineHeight: "16px",
              color: C.muted,
            }}
          >
            {ratingLabel}
          </div>
        </div>

        <span
          aria-hidden
          style={{
            fontFamily: SERIF,
            fontSize: 48,
            lineHeight: "38px",
            color: C.teal,
            opacity: 0.9,
          }}
        >
          &ldquo;
        </span>
      </div>

      <div aria-live="polite" style={{ marginTop: 16 }}>
        <p
          style={{
            margin: 0,
            minHeight: 94,
            fontFamily: SERIF,
            fontSize: 17,
            lineHeight: "23px",
            fontStyle: "italic",
            color: C.headline,
          }}
        >
          {active.quote}
        </p>

        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 15,
              lineHeight: "19px",
              fontWeight: 600,
              color: C.headline,
            }}
          >
            — {active.name}
          </div>
          <div
            style={{
              marginTop: 2,
              fontFamily: SANS,
              fontSize: 10,
              lineHeight: "14px",
              color: C.muted,
            }}
          >
            {active.source}
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-center"
        style={{ gap: 7, marginTop: 14 }}
      >
        {testimonials.map((t, i) => {
          const on = i === idx;
          return (
            <button
              key={t.name}
              type="button"
              aria-label={`Show review ${i + 1}`}
              aria-current={on}
              onClick={() => setIdx(i)}
              style={{
                width: on ? 18 : 6,
                height: 6,
                borderRadius: 999,
                border: 0,
                padding: 0,
                cursor: "pointer",
                background: on ? C.teal : C.border,
                transition: "width 180ms ease, background 180ms ease",
              }}
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={onViewAll}
        className="flex w-full items-center justify-center"
        style={{
          gap: 8,
          marginTop: 14,
          paddingTop: 14,
          borderTop: `1px solid ${C.borderSoft}`,
          borderRight: 0,
          borderBottom: 0,
          borderLeft: 0,
          background: "transparent",
          color: C.tealDark,
          fontFamily: SANS,
          fontSize: 12,
          lineHeight: "18px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        View all Google Reviews
        <ArrowRight size={15} strokeWidth={1.8} />
      </button>
    </div>
  );
}

export default GoogleReviewCard;
