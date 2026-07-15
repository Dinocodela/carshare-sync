import { CSSProperties, forwardRef, ReactNode } from "react";
import { C } from "./tokens";

type Variant = "light" | "dark";

type Props = {
  variant?: Variant;
  as?: "div" | "article" | "section";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & React.HTMLAttributes<HTMLElement>;

/**
 * Rounded luxury card used across the homepage.
 * - "light": warm-white porcelain surface with cream border and warm shadow.
 * - "dark":  deep-teal gradient panel with subtle radial teal glow.
 * Consumers can override anything via `style` (e.g. explicit height, padding).
 */
export const LuxuryCard = forwardRef<HTMLElement, Props>(function LuxuryCard(
  { variant = "light", as = "div", className, style, children, ...rest },
  ref
) {
  const base: CSSProperties =
    variant === "dark"
      ? {
          borderRadius: 26,
          background: `
            radial-gradient(
              circle at 86% 68%,
              rgba(7,139,142,0.34) 0%,
              rgba(7,139,142,0.08) 38%,
              transparent 62%
            ),
            linear-gradient(150deg, ${C.darkTeal} 0%, ${C.darkTealEnd} 100%)
          `,
          color: "#fff",
          border: "1px solid rgba(105,205,208,0.18)",
          boxShadow: "0 22px 54px -20px rgba(3,37,44,0.48)",
        }
      : {
          borderRadius: 26,
          background: C.warmWhite,
          border: `1px solid ${C.border}`,
          boxShadow: "0 16px 38px rgba(55,41,25,0.08)",
          color: C.headline,
        };

  const Tag = as as any;
  return (
    <Tag
      ref={ref as any}
      className={["relative overflow-hidden", className].filter(Boolean).join(" ")}
      style={{ ...base, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default LuxuryCard;
