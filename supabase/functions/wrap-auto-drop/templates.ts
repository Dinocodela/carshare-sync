/**
 * Edge-function copy of the Tesla Paint Shop template registry.
 * Mirrors src/lib/wrapTemplates.ts (functions cannot import from src/), plus the
 * per-model styling notes that keep generated previews true to the model year
 * the UV template actually targets.
 */
export interface WrapTemplate {
  key: string;
  label: string;
  width: number;
  height: number;
  compatibility: string;
  /** Photoreal vehicle description used in preview/video prompts. */
  vehicle: string;
  /** Styling cues that pin the render to the right generation of the car. */
  style: string;
}

export const WRAP_TEMPLATES: WrapTemplate[] = [
  {
    key: "modely-2025-premium",
    label: "Model Y Premium (2025+ Juniper)",
    width: 1024,
    height: 1024,
    compatibility:
      "2025+ Tesla Model Y Premium (Juniper), including 2026 Model Y Premium.",
    vehicle: "2026 Tesla Model Y Premium (Juniper refresh)",
    style:
      "Juniper styling is mandatory: one continuous full-width light bar across the front, " +
      "smooth flush nose with no separate headlights, full-width rear light strip, flush " +
      "door handles, modern aero wheels.",
  },
  {
    key: "modely-2025-base",
    label: "Model Y (2025+ Standard)",
    width: 1024,
    height: 1024,
    compatibility: "2025+ Tesla Model Y (Juniper), standard trim.",
    vehicle: "2025 Tesla Model Y (Juniper refresh, standard trim)",
    style:
      "Juniper styling is mandatory: full-width front light bar, flush nose, full-width rear " +
      "light strip, standard aero wheels.",
  },
  {
    key: "modely-2025-performance",
    label: "Model Y Performance (2025+)",
    width: 1024,
    height: 1024,
    compatibility: "2025+ Tesla Model Y Performance (Juniper).",
    vehicle: "2025 Tesla Model Y Performance (Juniper refresh)",
    style:
      "Juniper styling is mandatory: full-width front light bar, flush nose, sport wheels, " +
      "lowered stance, rear spoiler.",
  },
  {
    key: "modely",
    label: "Model Y (pre-2025)",
    width: 1024,
    height: 1024,
    compatibility: "Tesla Model Y built before the 2025 Juniper refresh.",
    vehicle: "2022 Tesla Model Y (pre-Juniper)",
    style:
      "Pre-refresh styling: separate teardrop headlights, rounded nose, no light bar.",
  },
  {
    key: "modely-l",
    label: "Model Y L",
    width: 1024,
    height: 1024,
    compatibility: "Tesla Model Y L (long-wheelbase six-seat).",
    vehicle: "Tesla Model Y L, the long-wheelbase six-seat Model Y",
    style:
      "Juniper front and rear light bars with a visibly stretched wheelbase and longer rear doors.",
  },
  {
    key: "model3-2024-base",
    label: "Model 3 (2024+ Highland)",
    width: 1024,
    height: 1024,
    compatibility: "2024+ Tesla Model 3 (Highland), standard trim.",
    vehicle: "2026 Tesla Model 3 (Highland refresh)",
    style:
      "Highland styling is mandatory: sharp slim swept headlights, pointed low nose, C-shaped " +
      "rear lights split across the bumper, flush handles.",
  },
  {
    key: "model3-2024-performance",
    label: "Model 3 Performance (2024+)",
    width: 1024,
    height: 1024,
    compatibility: "2024+ Tesla Model 3 Performance (Highland).",
    vehicle: "2026 Tesla Model 3 Performance (Highland refresh)",
    style:
      "Highland Performance styling: slim swept headlights, front splitter, carbon rear " +
      "spoiler, forged sport wheels, lowered stance.",
  },
  {
    key: "model3",
    label: "Model 3 (pre-2024)",
    width: 1024,
    height: 1024,
    compatibility: "Tesla Model 3 built before the 2024 Highland refresh.",
    vehicle: "2021 Tesla Model 3 (pre-Highland)",
    style: "Pre-refresh styling: rounded nose, wider headlights, chrome-delete trim.",
  },
  {
    key: "models-2025-plaid",
    label: "Model S Plaid (2025+)",
    width: 1024,
    height: 1024,
    compatibility: "2025+ Tesla Model S Plaid.",
    vehicle: "2025 Tesla Model S Plaid",
    style:
      "Long low liftback sedan silhouette, refreshed front fascia, wide track, Plaid wheels.",
  },
  {
    key: "models-2021",
    label: "Model S (2021+)",
    width: 1024,
    height: 1024,
    compatibility: "2021+ Tesla Model S.",
    vehicle: "2022 Tesla Model S",
    style: "Long low liftback sedan silhouette, slim headlights, flush handles.",
  },
  {
    key: "modelx-2021",
    label: "Model X (2021+)",
    width: 1024,
    height: 1024,
    compatibility: "2021+ Tesla Model X.",
    vehicle: "2022 Tesla Model X",
    style: "Tall SUV silhouette with falcon-wing rear doors closed, large panoramic windshield.",
  },
  {
    key: "cybertruck",
    label: "Cybertruck",
    width: 1024,
    height: 768,
    compatibility: "Tesla Cybertruck (all trims).",
    vehicle: "Tesla Cybertruck",
    style:
      "Angular stainless-steel wedge body with flat faceted panels, full-width front light bar, " +
      "no curves anywhere, exposed sail pillars over the bed.",
  },
];

const find = (key: string) =>
  WRAP_TEMPLATES.find((t) => t.key === key) ?? WRAP_TEMPLATES[0];

export const templateVehicleName = (key: string) => find(key).vehicle;
export const templateStyleNote = (key: string) => find(key).style;

/** Marketing-facing model name, e.g. "Model Y", "Cybertruck". */
export const templateModelName = (key: string) => {
  const k = find(key).key;
  if (k.startsWith("cybertruck")) return "Cybertruck";
  if (k.startsWith("modely")) return "Model Y";
  if (k.startsWith("model3")) return "Model 3";
  if (k.startsWith("models")) return "Model S";
  if (k.startsWith("modelx")) return "Model X";
  return "Tesla";
};
