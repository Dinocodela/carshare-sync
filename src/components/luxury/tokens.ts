// Teslys "Luxury Concierge" v1 tokens (single source of truth).
// Values MUST match src/index.css :root --luxury-* tokens.
// Exported as hex so existing inline styles keep working unchanged.

export const luxuryPalette = {
  pageCream: "#FBF8F2",
  warmWhite: "#FFFDF9",
  softCream: "#F7F1E8",
  headline: "#071C27",
  body: "#52616D",
  muted: "#7C8790",
  darkTeal: "#03252C",
  darkTealEnd: "#061C23",
  teal: "#078B8E",
  tealDark: "#056F73",
  tealLight: "#69CDD0",
  tealSoft: "#EAF6F5",
  gold: "#B59251",
  goldBorder: "#D8C39C",
  goldBackground: "rgba(255,253,249,0.76)",
  border: "#E6DCCF",
  borderSoft: "#E9E4DC",
  divider: "#C9C8C2",
} as const;

export type LuxuryPalette = typeof luxuryPalette;

export const luxuryFonts = {
  serif: '"Cormorant Garamond", ui-serif, Georgia, serif',
  sans: '"Manrope", ui-sans-serif, system-ui, sans-serif',
} as const;

// Convenience aliases (short names used across the homepage).
export const C = luxuryPalette;
export const SERIF = luxuryFonts.serif;
export const SANS = luxuryFonts.sans;
