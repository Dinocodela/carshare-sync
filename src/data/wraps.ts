/**
 * Static catalog of free Teslys digital wraps (Tesla Paint Shop visualizations).
 * Files are served from the public folder at /wraps/model-y-premium/<filename>.
 */

export type WrapCategory =
  | "Featured"
  | "Manga"
  | "Spiritual"
  | "Lifestyle"
  | "Hot Takes";

export type TeslaModelKey =
  | "model-y"
  | "model-3"
  | "model-s"
  | "model-x"
  | "cybertruck";

export interface TeslaModelConfig {
  key: TeslaModelKey;
  label: string;
  subtitle: string;
  status: "available" | "coming-soon";
  /** Optional note about the official Tesla template used for this model. */
  templateNote?: string;
}

/** Display order for the model selector. */
export const TESLA_MODELS: TeslaModelConfig[] = [
  {
    key: "model-y",
    label: "Model Y",
    subtitle: "2025+ Premium · Juniper",
    status: "available",
    templateNote:
      "2025+ Tesla Model Y Premium (Juniper), including 2026 Model Y Premium.",
  },
  {
    key: "model-3",
    label: "Model 3",
    subtitle: "2026 Model 3",
    status: "available",
    templateNote: "2026 Tesla Model 3.",
  },
  {
    key: "model-s",
    label: "Model S",
    subtitle: "2021+ Model S · Plaid",
    status: "available",
    templateNote: "2021+ Tesla Model S, including 2025 Model S Plaid.",
  },
  {
    key: "model-x",
    label: "Model X",
    subtitle: "2021+ Model X",
    status: "available",
    templateNote: "2021+ Tesla Model X.",
  },
  {
    key: "cybertruck",
    label: "Cybertruck",
    subtitle: "2024+ Cybertruck",
    status: "available",
    templateNote: "2024+ Tesla Cybertruck.",
  },
];

export const DEFAULT_MODEL_KEY: TeslaModelKey = "model-y";

export const isTeslaModelKey = (value: unknown): value is TeslaModelKey =>
  typeof value === "string" &&
  TESLA_MODELS.some((m) => m.key === (value as TeslaModelKey));

export const getModelConfig = (key: TeslaModelKey) =>
  TESLA_MODELS.find((m) => m.key === key) ?? TESLA_MODELS[0];

export interface Wrap {
  slug: string;
  title: string;
  filename: string;
  /** Website/social concept preview art (3:2 JPG). Never the download. */
  previewFilename: string;
  category: WrapCategory;
  modelKey: TeslaModelKey;
  description: string;
  price: "Free";
  compatibility: string;
  dimensions: string;
  fileSize: string;
}

export const WRAP_BASE_PATH = "/wraps/model-y-premium";
export const MODEL_WRAP_BASE_PATHS: Partial<Record<TeslaModelKey, string>> = {
  "model-3": "/wraps/model-3",
  "model-s": "/wraps/model-s",
  "model-x": "/wraps/model-x",
  cybertruck: "/wraps/cybertruck",
};
export const WRAP_PREVIEW_BASE_PATH = "/wraps/previews";
export const WRAP_PLACEHOLDER = "/wraps/placeholder.svg";

export const COMPATIBILITY =
  "2025+ Tesla Model Y Premium (Juniper), including 2026 Model Y Premium.";

export const WRAP_CATEGORIES: Array<"All" | WrapCategory> = [
  "All",
  "Featured",
  "Manga",
  "Spiritual",
  "Lifestyle",
  "Hot Takes",
];

export const WRAP_DISCLOSURE =
  "Concept previews illustrate the artwork on a Model Y and may differ slightly from Tesla's in-car 3D visualization; the download is the exact Tesla-compatible PNG. Digital wraps alter only your Tesla's on-screen 3D visualization and are not printable vinyl templates. Teslys is independent and not affiliated with Tesla. Political concepts are commentary/fan art and do not imply endorsement. Manga, creature, and virtual-idol concepts use original characters and are not affiliated with existing franchises.";

const base = {
  price: "Free" as const,
  compatibility: COMPATIBILITY,
  modelKey: "model-y" as const,
};

export const wraps: Wrap[] = [
  {
    price: "Free",
    modelKey: "model-s",
    compatibility: "2021+ Tesla Model S, including 2025 Model S Plaid.",
    slug: "midnight-meridian",
    filename: "Midnight_Meridian.png",
    previewFilename: "Midnight_Meridian-preview-v1.jpg",
    dimensions: "1024 × 1024 px",
    fileSize: "1.5 MB",
    title: "Midnight Meridian",
    category: "Featured",
    description:
      "Midnight navy laced with liquid-chrome ribbons and thin teal light bands — a quiet, executive livery built for the Model S silhouette.",
  },
  {
    price: "Free",
    modelKey: "model-x",
    compatibility: "2021+ Tesla Model X.",
    slug: "canyon-mirage",
    filename: "Canyon_Mirage.png",
    previewFilename: "Canyon_Mirage-preview-v1.jpg",
    dimensions: "1024 × 1024 px",
    fileSize: "1.6 MB",
    title: "Canyon Mirage",
    category: "Lifestyle",
    description:
      "Terracotta and sandstone strata traced with bronze topographic contours — desert-road warmth wrapped around the Model X.",
  },
  {
    price: "Free",
    modelKey: "cybertruck",
    compatibility: "2024+ Tesla Cybertruck.",
    slug: "titan-circuit",
    filename: "Titan_Circuit.png",
    previewFilename: "Titan_Circuit-preview-v1.jpg",
    dimensions: "1024 × 768 px",
    fileSize: "1.2 MB",
    title: "Titan Circuit",
    category: "Featured",
    description:
      "Gunmetal stainless panels threaded with electric-cyan circuit traces and graphite hazard chevrons — engineered for the Cybertruck's hard edges.",
  },
  {
    price: "Free",
    modelKey: "model-3",
    compatibility: "2026 Tesla Model 3.",
    slug: "sunset-boulevard",
    filename: "Sunset_Boulevard.png",
    previewFilename: "Sunset_Boulevard-preview-v1.jpg",
    dimensions: "1024 × 1024 px",
    fileSize: "1.5 MB",
    title: "Sunset Boulevard",
    category: "Featured",
    description:
      "Golden-hour Los Angeles poured over the bodywork — coral melting into peach, amber and deep violet with soft horizontal light bands. Built for the 2026 Model 3.",
  },
  {
    ...base,
    slug: "onyx",
    filename: "Onyx.png",
    previewFilename: "Onyx-preview-v2.jpg",
    dimensions: "1024 × 1024 px",
    fileSize: "709 KB",
    title: "Onyx",
    category: "Featured",
    description:
      "Gothic obsidian marble with smoked charcoal veining, brushed-silver hairlines and ornate blackletter ONYX lettering across the doors — dark, restrained and unmistakably premium.",
  },
  {
    ...base,
    slug: "astromech",
    filename: "Astromech.png",
    previewFilename: "Astromech-preview-v1.jpg",
    dimensions: "1024 × 1024 px",
    fileSize: "1.2 MB",
    title: "Astromech",
    category: "Featured",
    description:
      "Arctic-white panels, cobalt-blue utility blocks and brushed-silver segment bands — an original astromech droid tribute for the 2026 Model Y Juniper. Fan-made homage, not affiliated with any franchise.",
  },
  {
    ...base,
    slug: "neon-velocity",

    filename: "Neon_Velocity-v2.png",
    previewFilename: "Neon_Velocity-preview-v3.jpg",
    dimensions: "1024 × 1024 px",
    fileSize: "159 KB",
    title: "Neon Velocity",
    category: "Featured",
    description:
      "Satin-black bodywork slashed with cyan, magenta and electric-yellow speed lines — a track-inspired livery that makes your Tesla's on-screen visualization look built for motion.",
  },
  {
    ...base,
    slug: "pacific-voltage",
    filename: "Pacific_Voltage.png",
    previewFilename: "Pacific_Voltage-preview-v1.jpg",
    dimensions: "1024 × 1024 px",
    fileSize: "989 KB",
    title: "Pacific Voltage",
    category: "Featured",
    description:
      "Electric blues washing over deep ocean gradients — a calm, coastal finish inspired by golden-hour drives along the Pacific.",
  },
  {
    ...base,
    slug: "autonomous-grid",
    filename: "Autonomous_Grid.png",
    previewFilename: "Autonomous_Grid-preview-v1.jpg",
    dimensions: "1024 × 1024 px",
    fileSize: "880 KB",
    title: "Autonomous Grid",
    category: "Featured",
    description:
      "A precise technical grid with subtle luminous nodes, echoing the quiet intelligence of autonomous driving.",
  },
  {
    ...base,
    slug: "mojave-signal",
    filename: "Mojave_Signal.png",
    previewFilename: "Mojave_Signal-preview-v1.jpg",
    dimensions: "1024 × 1024 px",
    fileSize: "795 KB",
    title: "Mojave Signal",
    category: "Lifestyle",
    description:
      "Sun-bleached desert tones with a faint transmission motif — warm, wide-open and unmistakably Californian.",
  },
  {
    ...base,
    slug: "sacred-orbit",
    filename: "Sacred_Orbit.png",
    previewFilename: "Sacred_Orbit-preview-v1.jpg",
    dimensions: "960 × 960 px",
    fileSize: "907 KB",
    title: "Sacred Orbit",
    category: "Spiritual",
    description:
      "Sacred geometry rendered in soft gold and midnight, orbiting quietly around the silhouette of the car.",
  },
  {
    ...base,
    slug: "venice-afterglow",
    filename: "Venice_Afterglow.png",
    previewFilename: "Venice_Afterglow-preview-v1.jpg",
    dimensions: "960 × 960 px",
    fileSize: "950 KB",
    title: "Venice Afterglow",
    category: "Lifestyle",
    description:
      "Dusk over the boardwalk: palm-shadow purples melting into a warm, lingering afterglow.",
  },
  {
    ...base,
    slug: "pink-aura",
    filename: "Pink_Aura.png",
    previewFilename: "Pink_Aura-preview-v1.jpg",
    dimensions: "960 × 960 px",
    fileSize: "799 KB",
    title: "Pink Aura",
    category: "Lifestyle",
    description:
      "A luminous rose haze with pearlescent falloff — playful, soft and endlessly photogenic.",
  },
  {
    ...base,
    slug: "love-car-not-ceo",
    filename: "Love_Car_Not_CEO.png",
    previewFilename: "Love_Car_Not_CEO-preview-v1.jpg",
    dimensions: "960 × 960 px",
    fileSize: "960 KB",
    title: "Love the Car, Not the CEO",
    category: "Hot Takes",
    description:
      "A tongue-in-cheek statement wrap for drivers who love the machine and reserve judgement on everything else. Commentary and fan art only.",
  },
  {
    ...base,
    slug: "maga-250",
    filename: "MAGA_250.png",
    previewFilename: "MAGA_250-preview-v1.jpg",
    dimensions: "960 × 960 px",
    fileSize: "958 KB",
    title: "MAGA 250",
    category: "Hot Takes",
    description:
      "A bold satirical concept wrap. Commentary and fan art only — it does not imply any political endorsement.",
  },
  {
    ...base,
    slug: "no-kings",
    filename: "No_Kings.png",
    previewFilename: "No_Kings-preview-v1.jpg",
    dimensions: "960 × 960 px",
    fileSize: "990 KB",
    title: "No Kings",
    category: "Hot Takes",
    description:
      "A stark typographic statement piece. Commentary and fan art only — it does not imply any political endorsement.",
  },
  {
    ...base,
    slug: "neon-ronin",
    filename: "Neon_Ronin.png",
    previewFilename: "Neon_Ronin-preview-v1.jpg",
    dimensions: "928 × 928 px",
    fileSize: "953 KB",
    title: "Neon Ronin",
    category: "Manga",
    description:
      "An original wandering-swordsman concept drawn in high-contrast ink and neon rain. Original character, no franchise affiliation.",
  },
  {
    ...base,
    slug: "pocket-voltage",
    filename: "Pocket_Voltage.png",
    previewFilename: "Pocket_Voltage-preview-v1.jpg",
    dimensions: "960 × 960 px",
    fileSize: "941 KB",
    title: "Pocket Voltage",
    category: "Manga",
    description:
      "A charming original electric creature crackling with friendly energy. Original character, no franchise affiliation.",
  },
  {
    ...base,
    slug: "glitchy-glam",
    filename: "Glitchy_Glam.png",
    previewFilename: "Glitchy_Glam-preview-v1.jpg",
    dimensions: "960 × 960 px",
    fileSize: "793 KB",
    title: "Glitchy Glam",
    category: "Manga",
    description:
      "An original virtual-idol concept with chromatic glitch trails and holographic sparkle. Original character, no franchise affiliation.",
  },
  {
    ...base,
    slug: "vamp-romantic",
    filename: "Vamp_Romantic.png",
    previewFilename: "Vamp_Romantic-preview-v1.jpg",
    dimensions: "960 × 960 px",
    fileSize: "880 KB",
    title: "Vamp Romantic",
    category: "Manga",
    description:
      "Gothic romance in deep crimson and velvet black, drawn with original manga-style linework.",
  },
  {
    ...base,
    slug: "extra-celestial",
    filename: "Extra_Celestial.png",
    previewFilename: "Extra_Celestial-preview-v1.jpg",
    dimensions: "960 × 960 px",
    fileSize: "895 KB",
    title: "Extra Celestial",
    category: "Manga",
    description:
      "An original cosmic visitor rendered in iridescent starlight and soft nebula gradients.",
  },
];

/** Original downloadable Tesla Paint Shop PNG. */
export const wrapImageUrl = (wrap: Wrap) =>
  `${MODEL_WRAP_BASE_PATHS[wrap.modelKey] ?? WRAP_BASE_PATH}/${wrap.filename}`;

/** Optimized concept preview JPG used across the site and social cards. */
export const wrapPreviewUrl = (wrap: Wrap) =>
  `${WRAP_PREVIEW_BASE_PATH}/${wrap.previewFilename}`;

export const getWrapBySlug = (slug?: string) =>
  wraps.find((w) => w.slug === slug);

/** All wraps belonging to a given Tesla model. */
export const getWrapsByModel = (modelKey: TeslaModelKey) =>
  wraps.filter((w) => w.modelKey === modelKey);

export const getWrapCountByModel = (modelKey: TeslaModelKey) =>
  getWrapsByModel(modelKey).length;

export const getRelatedWraps = (wrap: Wrap, limit = 3) =>
  wraps
    .filter((w) => w.slug !== wrap.slug && w.category === wrap.category)
    .concat(wraps.filter((w) => w.slug !== wrap.slug && w.category !== wrap.category))
    .slice(0, limit);