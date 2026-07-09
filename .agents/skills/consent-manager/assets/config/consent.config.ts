/**
 * ============================================================================
 * Privacy & Consent Management — Central Configuration
 * ============================================================================
 *
 * This is the SINGLE source of truth for the consent system. Drop this whole
 * consent module into any project (Manifesting Bestie, Teslys, BlurMyHouse,
 * StreetPrivacy, future clients) and only this file needs to change.
 *
 * - `brand`        → copy + company info shown in the UI and policies
 * - `categories`   → the consent categories and their descriptions
 * - `services`     → the actual tracking scripts, keyed by category
 * - `cookies`      → the human-readable cookie table for the Cookie Policy
 * ============================================================================
 */

export type ConsentCategory =
  | "essential"
  | "analytics"
  | "marketing"
  | "functional";

/** How long consent is remembered before we ask again. */
export const CONSENT_EXPIRY_DAYS = 182; // ~6 months

/** Bump this whenever categories/services materially change to re-prompt users. */
export const CONSENT_VERSION = "1.0.0";

/** localStorage key that holds the consent record. */
export const CONSENT_STORAGE_KEY = "app_consent_v1";

export interface CategoryConfig {
  id: ConsentCategory;
  label: string;
  description: string;
  /** Short legal-basis label shown under the category name. */
  legalBasis?: string;
  examples?: string[];
  /** Essential can never be turned off. */
  required?: boolean;
}

export interface ServiceConfig {
  id: string;
  name: string;
  category: Exclude<ConsentCategory, "essential"> | "essential";
  /**
   * Loader invoked ONLY after consent for this service's category is granted.
   * Implement whatever the script needs here. Kept as a function so nothing
   * runs until consent exists.
   */
  load: () => void;
}

export interface CookieConfig {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  category: ConsentCategory;
}

export interface BrandConfig {
  productName: string;
  companyName: string;
  websiteUrl: string;
  privacyEmail: string;
  supportEmail: string;
  address: string;
  effectiveDate: string;
}

/* -------------------------------------------------------------------------- */
/* BRAND                                                                       */
/* -------------------------------------------------------------------------- */

export const brand: BrandConfig = {
  productName: "Teslys",
  companyName: "Teslys Inc.",
  websiteUrl: "https://teslys.app",
  privacyEmail: "support@teslys.com",
  supportEmail: "support@teslys.com",
  address: "475 Washington Blvd, Marina Del Rey, CA 90292",
  effectiveDate: "July 8, 2026",
};

/* -------------------------------------------------------------------------- */
/* CATEGORIES                                                                  */
/* -------------------------------------------------------------------------- */

export const categories: CategoryConfig[] = [
  {
    id: "analytics",
    label: "Analytics",
    legalBasis: "Consent - Opt In",
    description: "Help us understand how visitors use our website.",
    examples: ["Google Analytics", "Plausible", "Mixpanel"],
  },
  {
    id: "marketing",
    label: "Behavioral Advertising",
    legalBasis: "Consent - Opt In",
    description: "Used for personalized advertising and campaign performance.",
    examples: ["Meta Pixel", "Google Ads", "TikTok Pixel", "LinkedIn Insight"],
  },
  {
    id: "functional",
    label: "Functional",
    legalBasis: "Consent - Opt In",
    description:
      "Enhances your experience with optional features like chat support and personalization.",
  },
  {
    id: "essential",
    label: "Essential Services",
    legalBasis: "Disclosure",
    description:
      "Required for login, security, navigation, and basic website functionality. These are always active.",
    required: true,
  },
];

/* -------------------------------------------------------------------------- */
/* SERVICES  (nothing here runs until its category is consented to)            */
/* -------------------------------------------------------------------------- */

/** Google Tag Manager container — the only tracking currently active on Teslys. */
const GTM_ID = "GTM-WJ443454";

function loadGTM() {
  if (typeof window === "undefined") return;
  const w = window as typeof window & { dataLayer?: unknown[]; __gtmLoaded?: boolean };
  if (w.__gtmLoaded) return;
  w.__gtmLoaded = true;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
}

export const services: ServiceConfig[] = [
  {
    id: "gtm",
    name: "Google Tag Manager",
    category: "analytics",
    load: loadGTM,
  },
  // Future services — just add an entry, no rewrite needed:
  // { id: "ga4", name: "Google Analytics 4", category: "analytics", load: loadGA4 },
  // { id: "meta", name: "Meta Pixel", category: "marketing", load: loadMetaPixel },
  // { id: "clarity", name: "Microsoft Clarity", category: "analytics", load: loadClarity },
];

/* -------------------------------------------------------------------------- */
/* COOKIE TABLE                                                                */
/* -------------------------------------------------------------------------- */

export const cookies: CookieConfig[] = [
  {
    name: "app_consent_v1",
    provider: brand.productName,
    purpose: "Stores your cookie consent preferences.",
    duration: "6 months",
    category: "essential",
  },
  {
    name: "sb-*-auth-token",
    provider: "Supabase",
    purpose: "Keeps you securely signed in.",
    duration: "Session / 1 hour refresh",
    category: "essential",
  },
  {
    name: "_ga / _ga_*",
    provider: "Google Analytics",
    purpose: "Distinguishes users and measures site usage.",
    duration: "2 years",
    category: "analytics",
  },
  {
    name: "_gid",
    provider: "Google Analytics",
    purpose: "Distinguishes users for 24-hour session analytics.",
    duration: "24 hours",
    category: "analytics",
  },
  {
    name: "_fbp",
    provider: "Meta",
    purpose: "Tracks conversions and ad performance from Meta ads.",
    duration: "3 months",
    category: "marketing",
  },
];
